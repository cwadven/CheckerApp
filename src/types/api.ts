export interface ApiErrorResponse {
  message: string;
  status_code: string;
  errors: null | Record<string, string[]>;
} 