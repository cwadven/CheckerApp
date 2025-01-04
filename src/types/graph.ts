export interface Node {
  id: number;
  name: string;
  position_x: number;
  position_y: number;
  status: "in_progress" | "locked" | "completed";
}

export interface Arrow {
  id: number;
  start_node_id: number;
  end_node_id: number;
  active_rule_id: number;
  status: "completed" | "in_progress" | "locked";
}

export interface ActiveRule {
  id: number;
  name: string;
  target_nodes: number[];
}
