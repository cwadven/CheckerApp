import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, StyleSheet, SafeAreaView, Dimensions, Platform, PanResponder, Animated, Modal } from "react-native";
import type { RootStackScreenProps } from "../../types/navigation";
import { GridBackground } from "../../components/map/GridBackground";
import { MapArrows } from "../../components/map/MapArrows";
import { MapNode } from "../../components/map/MapNode";
import { MapHeader } from "../../components/map/MapHeader";
import { NodeDetailModal } from "../../components/node/NodeDetailModal";
import type { Node, Arrow, ActiveRule } from "../../types/graph";
import type { MapGraphMeta } from "../../types/map";
import type { AnswerSubmitResponse } from '../../types/answer';
import { DEFAULT_NODE_SIZE } from "../../components/map/MapNode";
import { GRAPH_PADDING } from "../../constants/layout";
import { createMapPanResponder } from '../../utils/panResponderUtil';
import { AlertModal } from "../../components/common/AlertModal";
import { ApiError } from "api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { eventEmitter, MAP_EVENTS } from "../../utils/eventEmitter";

interface ViewportState {
  x: number;
  y: number;
  zoom: number;
  lastUpdated: number;
}

interface RouteParams {
  mapId: number;
  graphData: {
    meta: MapGraphMeta;
    nodes: Node[];
    arrows: Arrow[];
    activeRules: ActiveRule[];
  };
  mapPlayMemberId?: number;
  mapPlayMemberTitle?: string;
}

export const MapGraphScreen = ({
  route,
  navigation,
}: RootStackScreenProps<"MapGraph">) => {
  const params = route.params as RouteParams;
  const { mapId, graphData, mapPlayMemberId, mapPlayMemberTitle } = params;
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [nodes, setNodes] = useState<Node[]>(graphData.nodes);
  const [arrows, setArrows] = useState<Arrow[]>(graphData.arrows);
  const { width: windowWidth, height: windowHeight } = Dimensions.get("window");
  const [isPanning, setIsPanning] = useState(false);

  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);
  const lastDistance = useRef(0);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // graphData 유효성 검사
  if (
    !graphData?.meta ||
    !Array.isArray(graphData?.nodes) ||
    !Array.isArray(graphData?.arrows)
  ) {
    console.error("Invalid graphData:", graphData);
    navigation.goBack();
    return null;
  }

  const panResponder = useRef(
    createMapPanResponder({
      pan,
      scale,
      lastScale,
      lastDistance,
      setIsPanning,
    })
  ).current;

  const handleNodePress = (node: Node) => {
    setSelectedNodeId(node.id);
  };

  const moveToNode = (nodeId: number) => {
    const node = nodes.find((n: Node) => n.id === nodeId);
    if (node) {
      const nodeWidth = node.width || DEFAULT_NODE_SIZE.width;
      const nodeHeight = node.height || DEFAULT_NODE_SIZE.height;

      // 노드의 중심점 계산 (패딩 포함)
      const nodeCenterX = (node.position_x - graphData.meta.layout.min_x) + GRAPH_PADDING + (nodeWidth / 2);
      const nodeCenterY = (node.position_y - graphData.meta.layout.min_y) + GRAPH_PADDING + (nodeHeight / 2);

      // 화면의 상단 부분에 헤더가 있는 것을 고려하여 위치 조정
      const verticalOffset = windowHeight * 0.4;

      // 현재 위치에서 목표 위치까지 부드럽게 이동
      Animated.parallel([
        Animated.spring(pan, {
          toValue: {
            x: -nodeCenterX + (windowWidth / 2),
            y: -nodeCenterY + verticalOffset,
          },
          useNativeDriver: true,
          friction: 8,  // 마찰력 조정
          tension: 35,  // 장력 조정
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        }),
        // 줌 레벨도 함께 조정
        Animated.spring(scale, {
          toValue: 1,  // 기본 줌 레벨로 리셋
          useNativeDriver: true,
          friction: 8,
          tension: 35,
        })
      ]).start();

      // 마지막 스케일 값 업데이트
      lastScale.current = 1;
    }
  };

  const handleTokenExpired = () => {
    setAlertConfig({
      visible: true,
      title: '세션 만료',
      message: '로그인이 만료되었습니다. 다시 로그인해주세요.',
      onConfirm: () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      },
    });
  };

  const handleAnswerSubmit = async (response: AnswerSubmitResponse) => {
    try {
      if (response.data.status === 'success') {
        setNodes(prevNodes => 
          prevNodes.map(node => {
            if (response.data.completed_node_ids.includes(node.id)) {
              eventEmitter.emit(MAP_EVENTS.NODE_COMPLETED, {
                mapId,
                nodeId: node.id,
                name: node.name,
                completedAt: new Date().toISOString(),
                mapPlayTitle: graphData.meta.map_play_title
              });
              return { ...node, status: 'completed' };
            }
            if (response.data.going_to_in_progress_node_ids.includes(node.id)) {
              return { ...node, status: 'in_progress' };
            }
            return node;
          })
        );

        setArrows(prevArrows => 
          prevArrows.map(arrow => ({
            ...arrow,
            status: response.data.completed_arrow_ids.includes(arrow.id) 
              ? 'completed' 
              : arrow.status
          }))
        );
      }
    } catch (error) {
      if ((error as ApiError).status === 401) {
        handleTokenExpired();
      } else {
        console.error('Failed to update nodes and arrows:', error);
      }
    }
  };

  const handleNodeDetailError = (error: unknown) => {
    if ((error as ApiError).status === 401) {
      handleTokenExpired();
    } else {
      setSelectedNodeId(null);  // 에러 발생 시 모달 닫기
      console.error('Failed to fetch node details:', error);
    }
  };

  const saveViewportState = useCallback(async () => {
    if (!mapId) return;
    
    const viewportState: ViewportState = {
      x: pan.x._value,
      y: pan.y._value,
      zoom: scale._value,
      lastUpdated: Date.now()
    };
    
    try {
      await AsyncStorage.setItem(
        `map_viewport_${mapId}`,
        JSON.stringify(viewportState)
      );
    } catch (error) {
      console.error('Failed to save viewport state:', error);
    }
  }, [mapId, pan.x, pan.y, scale]);

  const loadViewportState = useCallback(async () => {
    if (!mapId) return;
    
    try {
      const savedState = await AsyncStorage.getItem(`map_viewport_${mapId}`);
      if (savedState) {
        const viewportState = JSON.parse(savedState) as ViewportState;
        
        // 유효성 검사 추가
        if (typeof viewportState.x === 'number' && 
            typeof viewportState.y === 'number' && 
            typeof viewportState.zoom === 'number') {
          pan.x.setValue(viewportState.x);
          pan.y.setValue(viewportState.y);
          scale.setValue(viewportState.zoom);
        }
      }
    } catch (error) {
      console.error('Failed to load viewport state:', error);
    }
  }, [mapId, pan.x, pan.y, scale]);

  // 컴포넌트 마운트 시 저장된 상태 로드
  useEffect(() => {
    loadViewportState();
  }, [loadViewportState]);

  // 뷰포트 변경 시 상태 저장 (디바운스 적용)
  useEffect(() => {
    const timeoutId = setTimeout(saveViewportState, 500);
    return () => clearTimeout(timeoutId);
  }, [pan.x._value, pan.y._value, scale._value, saveViewportState]);

  return (
    <SafeAreaView style={styles.container}>
      <MapHeader
        mapMeta={graphData.meta}
        title={graphData.meta.title}
        subtitle={mapPlayMemberId && mapPlayMemberTitle ? `플레이: ${mapPlayMemberTitle}` : undefined}
        onBack={() => navigation.goBack()}
      />

      <View 
        style={styles.graphWrapper}
        {...panResponder.panHandlers}  // 전체 영역으로 이동
      >
        <Animated.View
          style={[
            styles.graphContainer,
            {
              transform: [
                { scale },
                { translateX: pan.x },
                { translateY: pan.y },
              ],
            },
          ]}
        >
          <View style={[styles.graphContent, {
            width: Math.max(windowWidth * 2, 
              (graphData.meta.layout.max_x - graphData.meta.layout.min_x) + (GRAPH_PADDING * 2)),
            height: Math.max(windowHeight * 2,
              (graphData.meta.layout.max_y - graphData.meta.layout.min_y) + (GRAPH_PADDING * 2)),
          }]}>
            <GridBackground
              layout={graphData.meta.layout}
              theme={graphData.meta.theme}
            />

            <MapArrows
              layout={graphData.meta.layout}
              arrows={arrows}
              nodes={nodes}
              theme={graphData.meta.theme}
            />

            {nodes.map((node) => (
              <MapNode
                key={node.id}
                node={node}
                layout={graphData.meta.layout}
                theme={graphData.meta.theme.node[node.status]}
                onPress={handleNodePress}
              />
            ))}
          </View>
        </Animated.View>
      </View>

      <NodeDetailModal
        visible={selectedNodeId !== null}
        onClose={() => setSelectedNodeId(null)}
        nodeId={selectedNodeId}
        onMoveToNode={moveToNode}
        onAnswerSubmit={handleAnswerSubmit}
        onError={handleNodeDetailError}
        mapPlayMemberId={mapPlayMemberId}
      />

      <Modal 
        visible={alertConfig.visible} 
        transparent 
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertContainer}>
            <AlertModal
              visible={alertConfig.visible}
              title={alertConfig.title}
              message={alertConfig.message}
              onConfirm={alertConfig.onConfirm}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  graphWrapper: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "relative",
    zIndex: 1,
  },
  graphContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
  },
  graphContent: {
    position: "relative",
    minWidth: "100%",
    minHeight: "100%",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    padding: 24,
  },
  alertOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'transparent',
  },
});
