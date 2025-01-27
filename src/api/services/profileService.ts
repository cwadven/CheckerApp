import { apiClient } from "../client";

interface Profile {
  id: number;
  nickname: string;
  profile_image: string | null;
}

interface ProfileResponse {
  data: Profile;
}

export const profileService = {
  async getProfile(): Promise<ApiResponse<Profile>> {
    return apiClient.get<Profile>('/v1/member/profile');
  }
}; 