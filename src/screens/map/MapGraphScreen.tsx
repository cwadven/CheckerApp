import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView, Dimensions, Platform } from "react-native";
import type { RootStackScreenProps } from "../../types/navigation";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
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

  // 줌/패닝 관련 값들
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const offset = useSharedValue({ x: 0, y: 0 });
  const start = useSharedValue({ x: 0, y: 0 });
  const savedOffset = useSharedValue({ x: 0, y: 0 });

  // 제스처 핸들러
  const gesture = Gesture.Race(
    // 핀치 줌 제스처
    Gesture.Pinch()
      .onStart(() => {
        savedScale.value = scale.value;
      })
      .onUpdate((e) => {
        const newScale = savedScale.value * e.scale;
        scale.value = Math.min(Math.max(newScale, 0.5), 3);
      }),

    // 패닝 제스처
    Gesture.Pan()
      .minPointers(1)
      .onStart(() => {
        setIsPanning(true);
        start.value = { x: offset.value.x, y: offset.value.y };
      })
      .onUpdate((e) => {
        offset.value = {
          x: start.value.x + e.translationX,
          y: start.value.y + e.translationY,
        };
      })
      .onEnd(() => {
        setIsPanning(false);
        savedOffset.value = offset.value;
      })
      .onFinalize(() => {
        setIsPanning(false);
      })
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset.value.x },
      { translateY: offset.value.y },
      { scale: scale.value },
    ],
  }));

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

      offset.value = withSpring({
        x: -nodeCenterX + (windowWidth / 2),
        y: -nodeCenterY + verticalOffset,
      });
      savedOffset.value = offset.value;
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

      <GestureDetector gesture={gesture}>
        <Animated.View style={[
          styles.graphWrapper,
          Platform.OS === 'web' && { cursor: isPanning ? 'grabbing' : 'grab' }
        ]}>
          <Animated.View style={[styles.graphContainer, animatedStyle]}>
            <View
              style={[
                styles.graphContent,
                {
                  width: (graphData.meta.layout.max_x - graphData.meta.layout.min_x) + (GRAPH_PADDING * 2),
                  height: (graphData.meta.layout.max_y - graphData.meta.layout.min_y) + (GRAPH_PADDING * 2),
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
        </Animated.View>
      </GestureDetector>

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
    overflow: "hidden",
  },
  graphContainer: {
    flex: 1,
  },
  graphContent: {
    position: "relative",
  },
});
