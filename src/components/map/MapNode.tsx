import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Node } from "../../types/graph";
import type { MapGraphMeta } from "../../types/map";
import { GRAPH_PADDING } from "../../constants/layout";

// 노드 기본 크기 상수
export const DEFAULT_NODE_SIZE = {
  width: 100,
  height: 100,
} as const;

interface MapNodeProps {
  node: Node;
  layout: MapGraphMeta["layout"];
  theme: MapGraphMeta["theme"]["node"][keyof MapGraphMeta["theme"]["node"]];
  onPress: (node: Node) => void;
}

export const MapNode = ({ node, layout, theme, onPress }: MapNodeProps) => {
  const width = node.width || DEFAULT_NODE_SIZE.width;
  const height = node.height || DEFAULT_NODE_SIZE.height;

  return (
    <Pressable
      key={`node-${node.id}`}
      style={({ pressed }) => [
        styles.container,
        {
          left: (node.position_x - layout.min_x) + GRAPH_PADDING,
          top: (node.position_y - layout.min_y) + GRAPH_PADDING,
          width,
          height,
          backgroundColor: theme.background + 'FF',
          borderWidth: pressed ? 3 : 2,
          borderColor: pressed ? theme.text : theme.border,
          elevation: pressed ? 8 : 4,
          shadowColor: theme.border,
          shadowOffset: { width: 0, height: pressed ? 4 : 2 },
          shadowOpacity: pressed ? 0.3 : 0.1,
          shadowRadius: pressed ? 8 : 4,
          transform: [
            { scale: pressed ? 0.95 : 1 },
            { translateY: pressed ? 1 : 0 }
          ],
          backfaceVisibility: 'hidden',
          overflow: 'hidden',
        },
        styles.nodeStatus[node.status],
        pressed && styles.pressed,
      ]}
      android_ripple={{ 
        color: theme.text + '20',  // 테마 색상에 20% 투명도
        borderless: false,
        foreground: true
      }}
      onPress={() => onPress(node)}
    >
      <View style={styles.statusIconContainer}>
        <Ionicons name={theme.icon as any} size={16} color={theme.text} />
      </View>
      <Text
        style={[
          styles.text,
          {
            color: theme.text,
            fontWeight: node.status === "locked" ? "normal" : "bold",
          },
        ]}
        numberOfLines={2}
      >
        {node.name}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.95,
  },
  text: {
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  statusIconContainer: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  nodeStatus: {
    locked: {
      opacity: 1,
    },
    completed: {
      opacity: 1,
    },
    in_progress: {
      opacity: 1,
    },
  } as const,
});
