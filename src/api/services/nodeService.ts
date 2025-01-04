import { apiClient } from "../client";
import type { NodeDetail } from "../../types/node";

export const nodeService = {
  getNodeDetail: async (nodeId: number) => {
    return apiClient.get<NodeDetail>(`/v1/node/${nodeId}`);
  },
};
