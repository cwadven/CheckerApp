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
import type { Node } from "../../types/graph";
import { nodeService } from "../../api/services/nodeService";

export const MapGraphScreen = ({
  route,
  navigation,
}: RootStackScreenProps<"MapGraph">) => {
  const { mapId, graphData } = route.params;
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
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
    const node = graphData.nodes.find((n) => n.id === nodeId);
    if (node) {
      offset.value = withSpring({
        x: -node.position_x + windowWidth / 2 - 50,
        y: -node.position_y + windowHeight / 2 - 40,
      });
      savedOffset.value = offset.value;
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
                  width: graphData.meta.layout.width,
                  height: graphData.meta.layout.height,
                  backgroundColor: graphData.meta.theme.background_color,
                },
              ]}
            >
              <GridBackground
                layout={graphData.meta.layout}
                theme={graphData.meta.theme}
              />

              <MapArrows
                width={graphData.meta.layout.width}
                height={graphData.meta.layout.height}
                arrows={graphData.arrows}
                nodes={graphData.nodes}
                theme={graphData.meta.theme}
              />

              {graphData.nodes.map((node) => (
                <MapNode
                  key={node.id}
                  node={node}
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
