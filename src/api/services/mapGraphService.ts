import { apiClient } from "../client";
import type { MapGraphMeta } from "../../types/map";
import type { Node, Arrow, ActiveRule } from "../../types/graph";

interface NodesResponse {
  nodes: Node[];
}

interface ArrowsResponse {
  arrows: Arrow[];
}

interface ActiveRulesResponse {
  node_complete_rules: ActiveRule[];
}

export const mapGraphService = {
  getMeta: (url: string) => apiClient.get(url),
  getNodes: (url: string) => apiClient.get(url),
  getArrows: (url: string) => apiClient.get(url),
  getActiveRules: (mapId: number) => apiClient.get(`/v1/map-graph/node-complete-rule/${mapId}`),
};
