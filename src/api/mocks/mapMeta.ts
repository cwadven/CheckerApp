import { MapGraphMeta } from "../../types/map";

export const mockMapMeta: { [key: number]: MapGraphMeta } = {
  1: {
    id: 1,
    title: "React 학습 로드맵",
    description: "React의 기초부터 심화까지 학습하는 로드맵입니다",
    stats: {
      total_nodes: 9,
      completed_nodes: 3,
      learning_period: {
        start_date: "2024-01-01T00:00:00Z",
        days: 60,
      },
      total_questions: 25,
      solved_questions: 12,
    },
    layout: {
      width: 3000,
      height: 3000,
      grid_size: 20,
    },
    theme: {
      background_color: "#f8f9fa",
      grid_color: "#ddd",
      node: {
        completed: {
          background: "#FFFFFF",
          border: "#4CAF50",
          text: "#4CAF50",
          icon: "checkmark-circle",
        },
        in_progress: {
          background: "#FFFFFF",
          border: "#2196F3",
          text: "#2196F3",
          icon: "play-circle",
        },
        locked: {
          background: "#f0f0f0",
          border: "#666666",
          text: "#666666",
          icon: "lock-closed",
        },
      },
      arrow: {
        completed: "#4CAF50",
        in_progress: "#2196F3",
        locked: "#666666",
      },
    },
    version: "20240301120532",
  },
};
