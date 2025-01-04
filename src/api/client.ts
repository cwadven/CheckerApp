import config from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ApiResponse<T> {
  status_code: string;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

interface GuestTokenResponse {
  access_token: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

class ApiClient {
  private baseUrl: string;
  private guestToken: string | null = null;

  constructor() {
    this.baseUrl = config.API_URL;
  }

  private async getGuestToken(): Promise<string> {
    try {
      // 1. 저장된 토큰 확인
      const savedToken = await AsyncStorage.getItem("guest_token");
      if (savedToken) {
        this.guestToken = savedToken;
        return savedToken;
      }

      // 2. 토큰이 없으면 새로 요청
      console.log("🔄 Requesting new guest token");
      const response = await fetch(`${this.baseUrl}/v1/member/guest-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("📥 Guest token response:", data);

      if (!response.ok) {
        throw new Error("Failed to get guest token");
      }

      // 3. 새 토큰 저장
      const newToken = data.access_token;
      await AsyncStorage.setItem("guest_token", newToken);
      this.guestToken = newToken;
      return newToken;
    } catch (error) {
      console.error("❌ Error getting guest token:", error);
      throw error;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // 1. 토큰 확인/요청
      const token = await this.getGuestToken();

      // 2. API 요청
      const url = `${this.baseUrl}${endpoint}`;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `jwt ${token}`,
        ...options.headers,
      };

      console.log(`🚀 API Request: ${url}`, { headers, ...options });

      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      console.log(`📥 API Response: ${url}`, data);

      // 3. 토큰 만료 체크
      if (
        data.status_code === "guest-token-issue" ||
        data.status_code === "authentication_failed"
      ) {
        console.log("🔄 Token expired, refreshing...");
        // 토큰 삭제 후 재요청
        await AsyncStorage.removeItem("guest_token");
        this.guestToken = null;
        return this.request(endpoint, options);
      }

      if (!response.ok) {
        throw new Error(data.message || "API 요청 실패");
      }

      return data;
    } catch (error) {
      console.error(`❌ API Error: ${endpoint}`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
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

      // 로그인 성공 시 새로운 토큰 저장
      await AsyncStorage.setItem("guest_token", data.access_token);
      await AsyncStorage.setItem("refresh_token", data.refresh_token);
      this.guestToken = data.access_token;

      return data;
    } catch (error) {
      console.error("❌ Login failed:", error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
