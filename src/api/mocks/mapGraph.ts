import { Node, Arrow, ActiveRule } from "../../types/graph";

export const mockNodes: Node[] = [
  {
    id: 1,
    name: "HTML 기초",
    position_x: 100,
    position_y: 100,
    status: "completed",
  },
  {
    id: 2,
    name: "CSS 기초",
    position_x: 300,
    position_y: 100,
    status: "in_progress",
  },
  {
    id: 3,
    name: "JS 기초",
    position_x: 100,
    position_y: 300,
    status: "completed",
  },
  {
    id: 4,
    name: "React",
    position_x: 300,
    position_y: 300,
    status: "in_progress",
  },
  {
    id: 5,
    name: "React Hooks",
    position_x: 500,
    position_y: 300,
    status: "locked",
  },
  {
    id: 6,
    name: "상태 관리",
    position_x: 500,
    position_y: 500,
    status: "completed",
  },
  {
    id: 7,
    name: "React Router",
    position_x: 300,
    position_y: 500,
    status: "locked",
  },
  {
    id: 8,
    name: "React Query",
    position_x: 700,
    position_y: 500,
    status: "locked",
  },
  {
    id: 9,
    name: "실전 프로젝트",
    position_x: 500,
    position_y: 700,
    status: "in_progress",
  },
];

export const mockArrows: Arrow[] = [
  {
    id: 1,
    start_node_id: 1,
    end_node_id: 2,
    active_rule_id: 1,
    status: "completed",
  },
  {
    id: 2,
    start_node_id: 1,
    end_node_id: 3,
    active_rule_id: 2,
    status: "completed",
  },
  {
    id: 3,
    start_node_id: 2,
    end_node_id: 4,
    active_rule_id: 3,
    status: "in_progress",
  },
  {
    id: 4,
    start_node_id: 3,
    end_node_id: 4,
    active_rule_id: 3,
    status: "completed",
  },
  {
    id: 5,
    start_node_id: 4,
    end_node_id: 5,
    active_rule_id: 4,
    status: "locked",
  },
  {
    id: 6,
    start_node_id: 5,
    end_node_id: 7,
    active_rule_id: 5,
    status: "locked",
  },
  {
    id: 7,
    start_node_id: 5,
    end_node_id: 8,
    active_rule_id: 5,
    status: "locked",
  },
  {
    id: 8,
    start_node_id: 6,
    end_node_id: 9,
    active_rule_id: 10,
    status: "completed",
  },
  {
    id: 9,
    start_node_id: 7,
    end_node_id: 9,
    active_rule_id: 10,
    status: "locked",
  },
  {
    id: 10,
    start_node_id: 8,
    end_node_id: 9,
    active_rule_id: 11,
    status: "locked",
  },
];

export const mockActiveRules: ActiveRule[] = [
  { id: 1, name: "HTML 기초 완료", target_nodes: [2] },
  { id: 2, name: "HTML 기초 완료", target_nodes: [3] },
  { id: 3, name: "CSS & JS 완료", target_nodes: [4] },
  { id: 4, name: "React 기초 완료", target_nodes: [5] },
  { id: 5, name: "React Hooks 완료", target_nodes: [7, 8] },
  { id: 10, name: "상태 관리 & Router 완료", target_nodes: [9] },
  { id: 11, name: "Query 완료", target_nodes: [9] },
];

export const mockNodeDetails = {
  // ... 기존 nodeDetails 객체 내용
};
