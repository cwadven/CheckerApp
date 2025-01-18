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
      style={[
        styles.container,
        {
          left: (node.position_x - layout.min_x) + GRAPH_PADDING,
          top: (node.position_y - layout.min_y) + GRAPH_PADDING,
          width,
          height,
          backgroundColor: theme.background,
          borderWidth: 2,
          borderColor: theme.border,
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
      ]}
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
});
