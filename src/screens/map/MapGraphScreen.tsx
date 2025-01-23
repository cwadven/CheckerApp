import React, { useState, useRef } from "react";
import { View, StyleSheet, SafeAreaView, Dimensions, Platform, PanResponder, Animated } from "react-native";
import type { RootStackScreenProps } from "../../types/navigation";
import { GridBackground } from "../../components/map/GridBackground";
import { MapArrows } from "../../components/map/MapArrows";
import { MapNode } from "../../components/map/MapNode";
import { MapHeader } from "../../components/map/MapHeader";
import { NodeDetailModal } from "../../components/node/NodeDetailModal";
import type { Node, Arrow } from "../../types/graph";
import { nodeService } from "../../api/services/nodeService";
import type { AnswerSubmitResponse } from '../../types/answer';
import { DEFAULT_NODE_SIZE } from "../../components/map/MapNode";
import { GRAPH_PADDING } from "../../constants/layout";
import { createMapPanResponder } from '../../utils/panResponderUtil';

export const MapGraphScreen = ({
  route,
  navigation,
}: RootStackScreenProps<"MapGraph">) => {
  const { mapId, graphData } = route.params;
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [nodes, setNodes] = useState<Node[]>(graphData.nodes);
  const [arrows, setArrows] = useState<Arrow[]>(graphData.arrows);
  const { width: windowWidth, height: windowHeight } = Dimensions.get("window");
  const [isPanning, setIsPanning] = useState(false);

  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);
  const lastDistance = useRef(0);

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

  const animatedStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { scale: scale },
    ],
  };

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

  const handleAnswerSubmit = (response: AnswerSubmitResponse) => {
    if (response.data.status === 'success') {
      setNodes(prevNodes => 
        prevNodes.map(node => {
          if (response.data.completed_node_ids.includes(node.id)) {
            return { ...node, status: 'completed' };
          }
          if (response.data.going_to_in_progress_node_ids.includes(node.id)) {
            return { ...node, status: 'in_progress' };
          }
          return node;
        })
      );

      setArrows((prevArrows: Arrow[]) => 
        prevArrows.map(arrow => ({
          ...arrow,
          status: response.data.completed_arrow_ids.includes(arrow.id) 
            ? 'completed' 
            : arrow.status
        }))
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapHeader mapMeta={graphData.meta} onBack={() => navigation.goBack()} />

      <View 
        style={styles.graphWrapper}
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={[styles.graphContainer, animatedStyle]}
        >
          <View
            style={[
              styles.graphContent,
              {
                width: Math.max(
                  windowWidth,
                  (graphData.meta.layout.max_x - graphData.meta.layout.min_x) + (GRAPH_PADDING * 2)
                ),
                height: Math.max(
                  windowHeight,
                  (graphData.meta.layout.max_y - graphData.meta.layout.min_y) + (GRAPH_PADDING * 2)
                ),
              },
            ]}
          >
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
      />
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
    zIndex: 1,  // 그래프 영역의 z-index 설정
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
});
