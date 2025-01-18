// 레이아웃 관련 상수
export const layout = {
  node: {
    width: 100,
    height: 80,
    borderRadius: 8,
    padding: 12,
  },
  grid: {
    size: 20,
    opacity: 0.3,
  },
  arrow: {
    width: 2,
    headLength: 15,
  },
} as const;

// 그래프 여백 상수 추가
export const GRAPH_PADDING = 100;  // 각 방향으로 100px의 여유 공간
