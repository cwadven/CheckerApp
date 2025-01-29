import config from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { eventEmitter, AUTH_EVENTS } from '../utils/eventEmitter';

interface ApiResponse<T> {
  status_code: string;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  rawBody?: boolean;
}

interface TokenResponse extends Pick<ApiResponse<{
  access_token: string;
  refresh_token: string;
}>, 'status_code'> {
  access_token: string;
  refresh_token: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<TokenResponse> | null = null;

  constructor() {
    this.baseUrl = config.API_URL;
  }

  private async getOrSetAccessToken(): Promise<{access_token: string, refresh_token: string, is_member: boolean} | null> {
    try {
      // 저장된 access_token 확인
      const access_token = await AsyncStorage.getItem('access_token');
      const refresh_token = await AsyncStorage.getItem('refresh_token');
      const is_member = await AsyncStorage.getItem('is_member') === 'true';
      if (access_token) return {access_token, refresh_token: refresh_token || '', is_member};

      // access_token이 없으면 게스트 토큰 요청
      const response = await fetch(`${this.baseUrl}/v1/member/guest-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: TokenResponse = await response.json();

      if (!response.ok) {
        console.error('Guest token response:', data);
        throw new Error('Failed to get guest token');
      }

      await AsyncStorage.setItem('access_token', data.access_token);
      await AsyncStorage.setItem('refresh_token', data.refresh_token);
      await AsyncStorage.setItem('is_member', 'false');
      return {access_token: data.access_token, refresh_token: data.refresh_token, is_member: false};
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  private async refreshToken(): Promise<TokenResponse> {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token');

      const response = await fetch(`${this.baseUrl}/v1/member/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data: TokenResponse = await response.json();
      if (data.status_code === 'invalid-refresh-token' || data.status_code === 'no-member-token') {
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        await AsyncStorage.removeItem('is_member');
        eventEmitter.emit(AUTH_EVENTS.REQUIRE_LOGIN, '다시 로그인이 필요합니다.');
        throw new ApiError(401, '다시 로그인이 필요합니다.');
      }
      if (!response.ok) throw new Error('Token refresh failed');

      await AsyncStorage.setItem('access_token', data.access_token);
      await AsyncStorage.setItem('refresh_token', data.refresh_token);
      await AsyncStorage.setItem('is_member', 'true');
      return data;
    } catch (error) {
      throw error;
    }
  }

  private async request<T>(
    method: string,
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithAuth(method, endpoint, options);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(response.status, data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        try {
          if (!this.refreshPromise) {
            this.refreshPromise = this.refreshToken();
          }
          await this.refreshPromise;
          this.refreshPromise = null;
          
          // 토큰 갱신 후 원래 요청 재시도
          const retryResponse = await this.fetchWithAuth(method, endpoint, options);
          const retryData = await retryResponse.json();
          
          if (!retryResponse.ok) {
            throw new ApiError(retryResponse.status, retryData.message || 'API request failed');
          }

          return retryData;
        } catch (refreshError) {
          eventEmitter.emit(AUTH_EVENTS.REQUIRE_LOGIN, '다시 로그인 해주세요.');
          throw new ApiError(401, '다시 로그인이 필요합니다.');
        }
      }
      throw error;
    }
  }

  private async fetchWithAuth(
    method: string,
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    const tokenInfo = await this.getOrSetAccessToken();
    
    // 헤더 초기화
    const headers: HeadersInit = { ...options.headers };

    // 액세스 토큰이 있으면 Authorization 헤더 추가
    if (tokenInfo?.access_token) {
      headers.Authorization = `jwt ${tokenInfo.access_token}`;
    }

    // FormData가 아닌 경우에만 Content-Type 설정
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    return fetch(url, {
      ...options,
      method,
      headers,
      credentials: 'include',
    });
  }

  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>("GET", endpoint, { ...options, method: "GET" });
  }

  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    try {
      const url = `${this.baseUrl}/v1/member/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "로그인에 실패했습니다");
      }

      return data;
    } catch (error) {
      console.error("로그인 실패:", error);
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    // FormData는 그대로 전송, 나머지는 JSON 문자열로 변환
    const body = data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined);
    
    // FormData인 경우 Content-Type 헤더를 제거
    const headers = data instanceof FormData 
      ? { ...options.headers }
      : { 
          'Content-Type': 'application/json',
          ...options.headers 
        };

    return this.request<T>("POST", endpoint, {
      ...options,
      method: "POST",
      body,
      headers,
    });
  }
}

export const apiClient = new ApiClient();
