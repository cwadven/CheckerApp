import React from "react";
import { View, StyleSheet } from "react-native";
import type { MapGraphMeta } from "../../types/map";

interface GridBackgroundProps {
  layout: MapGraphMeta["layout"];
  theme: MapGraphMeta["theme"];
}

export const GridBackground = ({ layout, theme }: GridBackgroundProps) => {
  const lines = [];
  const gridSize = layout.grid_size;

  // 가로선
  for (let i = Math.floor(layout.min_y / gridSize) * gridSize; i <= layout.max_y; i += gridSize) {
    lines.push(
      <View
        key={`horizontal-${i}`}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: i - layout.min_y,
          height: 1,
          backgroundColor: theme.grid_color,
        }}
      />
    );
  }

  // 세로선
  for (let i = Math.floor(layout.min_x / gridSize) * gridSize; i <= layout.max_x; i += gridSize) {
    lines.push(
      <View
        key={`vertical-${i}`}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: i - layout.min_x,
          width: 1,
          backgroundColor: theme.grid_color,
        }}
      />
    );
  }

  return (
    <View 
      style={[
        styles.container,
        {
          width: layout.max_x - layout.min_x,
          height: layout.max_y - layout.min_y,
        }
      ]}
    >
      {lines}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    opacity: 0.3,
  },
});
