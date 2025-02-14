import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import type { RootStackScreenProps } from "../../types/navigation";
import { mapGraphService } from "../../api/services/mapGraphService";
import type { MapGraphMeta } from "../../types/map";
import type { Node, Arrow, ActiveRule } from "../../types/graph";
import { ErrorModal } from "../../components/common/ErrorModal";

interface LoadingStepTextProps {
  step: number;
  currentProgress: number;
  text: string;
}

interface RouteParams {
  mapId: number;
  mapPlayMemberId?: number;  // playId를 mapPlayMemberId로 변경
  mode?: 'preview' | 'play';
  mapPlayMemberTitle?: string;
}

export const MapGraphLoadingScreen = ({
  route,
  navigation,
}: RootStackScreenProps<"MapGraphLoading">) => {
  const { mapId, mapPlayMemberId, mode = 'preview', mapPlayMemberTitle } = route.params as RouteParams;
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<{
    meta: MapGraphMeta | null;
    nodes: Node[];
    arrows: Arrow[];
    activeRules: ActiveRule[];
  }>({
    meta: null,
    nodes: [],
    arrows: [],
    activeRules: [],
  });

  useEffect(() => {
    const loadGraphData = async () => {
      try {
        setLoadingProgress(10);
        
        // URL 구성 함수
        const getUrl = (base: string) => {
          if (mode === 'play' && mapPlayMemberId) {
            return `${base}/${mapId}/member-play/${mapPlayMemberId}`;
          }
          return `${base}/${mapId}`;
        };

        // 메타데이터 로딩
        const metaResponse = await mapGraphService.getMeta(
          getUrl('/v1/map-graph/meta')
        );
        const meta = metaResponse.data;

        // 노드 데이터 로딩
        setLoadingProgress(40);
        const nodesResponse = await mapGraphService.getNodes(
          getUrl('/v1/map-graph/node')
        );
        const nodes = nodesResponse.data.nodes;

        // 엣지 데이터 로딩
        setLoadingProgress(70);
        const arrowsResponse = await mapGraphService.getArrows(
          getUrl('/v1/map-graph/arrow')
        );
        const arrows = arrowsResponse.data.arrows;

        // ActiveRule 데이터 로딩 (기존 URL 유지)
        setLoadingProgress(90);
        const rulesResponse = await mapGraphService.getActiveRules(mapId);
        const activeRules = rulesResponse.data.node_complete_rules;

        // 모든 데이터가 준비되었는지 확인
        if (
          !meta ||
          !Array.isArray(nodes) ||
          !Array.isArray(arrows) ||
          !Array.isArray(activeRules)
        ) {
          throw new Error("Invalid data format received from API");
        }

        const graphData = {
          meta,
          nodes,
          arrows,
          activeRules,
        };

        console.log("Final graphData:", JSON.stringify(graphData, null, 2));

        // 5. 완료 (100%)
        setLoadingProgress(100);
        await new Promise((resolve) => setTimeout(resolve, 200));

        // MapGraphScreen으로 이동
        navigation.replace("MapGraph", {
          mapId: route.params.mapId,
          graphData,
          mapPlayMemberId: route.params.mapPlayMemberId,
          mapPlayMemberTitle: route.params.mapPlayMemberTitle,
        });
      } catch (err) {
        console.error("Error loading graph data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "데이터를 불러오는데 실패했습니다"
        );
      }
    };

    loadGraphData();
  }, [navigation, mapId, mapPlayMemberId, mode, mapPlayMemberTitle]);

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4CAF50" />
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${loadingProgress}%` }]} />
      </View>
      <View style={styles.progressTextContainer}>
        <LoadingStepText
          step={1}
          currentProgress={loadingProgress}
          text="메타데이터 로딩 중..."
        />
        <LoadingStepText
          step={2}
          currentProgress={loadingProgress}
          text="노드 데이터 로딩 중..."
        />
        <LoadingStepText
          step={3}
          currentProgress={loadingProgress}
          text="엣지 데이터 로딩 중..."
        />
        <LoadingStepText
          step={4}
          currentProgress={loadingProgress}
          text="활성화 규칙 로딩 중..."
        />
      </View>

      <ErrorModal
        visible={!!error}
        message={error || ""}
        onClose={() => navigation.goBack()}
      />
    </View>
  );
};

const LoadingStepText = ({
  step,
  currentProgress,
  text,
}: LoadingStepTextProps) => {
  const getStepProgress = (step: number) => {
    switch (step) {
      case 1:
        return 10;
      case 2:
        return 40;
      case 3:
        return 70;
      case 4:
        return 90;
      default:
        return 0;
    }
  };

  const isCurrentStep =
    currentProgress >= getStepProgress(step) &&
    currentProgress < getStepProgress(step + 1);
  const isCompleted = currentProgress >= getStepProgress(step + 1);

  return (
    <View
      style={[
        styles.stepTextContainer,
        isCurrentStep && styles.currentStep,
        isCompleted && styles.completedStep,
      ]}
    >
      <Text
        style={[
          styles.stepText,
          isCurrentStep && styles.currentStepText,
          isCompleted && styles.completedStepText,
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "#E8F5E9",
    borderRadius: 4,
    marginTop: 32,
    marginBottom: 24,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  progressTextContainer: {
    width: "100%",
    gap: 12,
  },
  stepTextContainer: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  currentStep: {
    backgroundColor: "#E8F5E9",
  },
  completedStep: {
    backgroundColor: "#C8E6C9",
  },
  stepText: {
    fontSize: 14,
    color: "#666",
  },
  currentStepText: {
    color: "#4CAF50",
    fontWeight: "500",
  },
  completedStepText: {
    color: "#2E7D32",
    fontWeight: "500",
  },
});
