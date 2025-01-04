export interface User {
  id: number;
  email: string;
  nickname: string;
  profile_image?: string;
  created_at: string;
  subscription_count: number;
  completed_map_count: number;
}

export interface AuthToken {
  access_token: string;
  refresh_token: string;
}
