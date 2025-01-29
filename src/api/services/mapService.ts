import { apiClient } from "../client";
import type { Map, MapListResponse } from "../../types/map";


export const mapService = {
  getMapList: async (params?: {
    categoryId?: number;
    next_cursor?: string;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.categoryId) {
      searchParams.append("category_id", params.categoryId.toString());
    }
    if (params?.next_cursor) {
      searchParams.append("next_cursor", params.next_cursor);
    }
    if (params?.search) {
      searchParams.append("search", params.search);
    }

    const endpoint = `/v1/map${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    console.log("🔍 API Request:", endpoint);
    return apiClient.get<MapListResponse>(endpoint);
  },

  getMapDetail: async (mapId: number) => {
    return apiClient.get<Map>(`/v1/map/${mapId}`);
  },

  getSubscribedMaps: async (params?: {
    categoryId?: number;
    next_cursor?: string;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.categoryId) {
      searchParams.append("category_id", params.categoryId.toString());
    }
    if (params?.next_cursor) {
      searchParams.append("next_cursor", params.next_cursor);
    }
    if (params?.search) {
      searchParams.append("search", params.search);
    }

    const endpoint = `/v1/map/subscribed${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    console.log("🔍 API Request:", endpoint);
    return apiClient.get<MapListResponse>(endpoint);
  },
};
