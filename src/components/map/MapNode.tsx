import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Node } from "../../types/graph";
import type { MapGraphMeta } from "../../types/map";
import { layout } from "../../constants/layout";

interface MapNodeProps {
  node: Node;
  theme: MapGraphMeta["theme"]["node"][keyof MapGraphMeta["theme"]["node"]];
  onPress: (node: Node) => void;
}

export const MapNode = ({ node, theme, onPress }: MapNodeProps) => {
  return (
    <Pressable
      key={`node-${node.id}`}
      style={[
        styles.container,
        {
          left: node.position_x,
          top: node.position_y,
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
    width: layout.node.width,
    height: layout.node.height,
    borderRadius: layout.node.borderRadius,
    padding: layout.node.padding,
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
