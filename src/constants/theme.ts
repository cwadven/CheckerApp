// 색상 정의
export const colors = {
  primary: "#2196F3", // 진행 중
  success: "#4CAF50", // 완료
  disabled: "#666", // 잠김
  white: "#FFFFFF",
  background: "#f5f5f5",
  border: "#eee",
  lockedBackground: "#f0f0f0", // locked 상태 배경색 추가
  text: {
    primary: "#333333",
    secondary: "#666666",
  },
} as const;

// Node 상태별 스타일
export const nodeStatus = {
  completed: {
    color: colors.success,
    icon: "checkmark-circle",
    background: colors.white,
  },
  in_progress: {
    color: colors.primary,
    icon: "play-circle",
    background: colors.white,
  },
  locked: {
    color: colors.disabled,
    icon: "lock-closed",
    background: colors.lockedBackground,
  },
} as const;

// 공통 스타일
export const shadows = {
  default: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
} as const;
