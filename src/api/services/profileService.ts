import { apiClient } from "../client";

interface ProfileResponse {
  profile_image: any;
  status_code: string;
  data: {
    id: number;
    nickname: string;
    profile_image: string | null;
    subscribed_map_count: number;
  };
}

export const profileService = {
  getProfile: () => {
    return apiClient.get<ProfileResponse>('/v1/member/profile');
  },
}; 