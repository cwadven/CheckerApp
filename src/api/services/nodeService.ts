import { apiClient } from "../client";
import type { NodeDetail } from "../../types/node";

export const nodeService = {
  getNodeDetail: (url: string) => {
    return apiClient.get<NodeDetail>(url);
  },
};
