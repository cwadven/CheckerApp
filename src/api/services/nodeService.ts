import { apiClient } from "../client";
import type { NodeDetail } from "../../types/node";

const getNodeUrl = (nodeId: number, mapPlayMemberId?: number) => {
  return mapPlayMemberId 
    ? `/v1/node/${nodeId}/member-play/${mapPlayMemberId}`
    : `/v1/node/${nodeId}`;
};

export const nodeService = {
  getNodeDetail: (nodeId: number, mapPlayMemberId?: number) => {
    const url = getNodeUrl(nodeId, mapPlayMemberId);
    return apiClient.get<NodeDetail>(url);
  },
};
