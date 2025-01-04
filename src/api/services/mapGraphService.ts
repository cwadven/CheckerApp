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
  getMeta: async (mapId: number) => {
    const response = await apiClient.get<MapGraphMeta>(
      `/v1/map-graph/meta/${mapId}`
    );
    console.log("Meta API Response:", response);
    return response;
  },

  getNodes: async (mapId: number) => {
    const response = await apiClient.get<NodesResponse>(
      `/v1/map-graph/node/${mapId}`
    );
    console.log("Nodes API Response:", response);
    return response;
  },

  getArrows: async (mapId: number) => {
    const response = await apiClient.get<ArrowsResponse>(
      `/v1/map-graph/arrow/${mapId}`
    );
    console.log("Arrows API Response:", response);
    return response;
  },

  getActiveRules: async (mapId: number) => {
    const response = await apiClient.get<ActiveRulesResponse>(
      `/v1/map-graph/node-complete-rule/${mapId}`
    );
    console.log("ActiveRules API Response:", response);
    return response;
  },
};
