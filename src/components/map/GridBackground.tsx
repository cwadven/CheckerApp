import React from "react";
import { View, StyleSheet } from "react-native";
import type { MapGraphMeta } from "../../types/map";
import { GRAPH_PADDING } from "../../constants/layout";

interface GridBackgroundProps {
  layout: MapGraphMeta["layout"];
  theme: MapGraphMeta["theme"];
}

export const GridBackground = ({ layout, theme }: GridBackgroundProps) => {
  const lines = [];
  const gridSize = layout.grid_size;

  // 가로선
  for (let i = Math.floor((layout.min_y - GRAPH_PADDING) / gridSize) * gridSize; 
       i <= layout.max_y + GRAPH_PADDING; 
       i += gridSize) {
    lines.push(
      <View
        key={`horizontal-${i}`}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: i - (layout.min_y - GRAPH_PADDING),
          height: 1,
          backgroundColor: theme.grid_color,
        }}
      />
    );
  }

  // 세로선
  for (let i = Math.floor((layout.min_x - GRAPH_PADDING) / gridSize) * gridSize; 
       i <= layout.max_x + GRAPH_PADDING; 
       i += gridSize) {
    lines.push(
      <View
        key={`vertical-${i}`}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: i - (layout.min_x - GRAPH_PADDING),
          width: 1,
          backgroundColor: theme.grid_color,
        }}
      />
    );
  }

  return (
    <>
      {/* 배경색 레이어 */}
      <View 
        style={[
          styles.background,
          {
            width: layout.max_x - layout.min_x + (GRAPH_PADDING * 2),
            height: layout.max_y - layout.min_y + (GRAPH_PADDING * 2),
            backgroundColor: theme.background_color,
          }
        ]}
      />
      {/* 그리드 라인 레이어 */}
      <View 
        style={[
          styles.container,
          {
            width: layout.max_x - layout.min_x + (GRAPH_PADDING * 2),
            height: layout.max_y - layout.min_y + (GRAPH_PADDING * 2),
          }
        ]}
      >
        {lines}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    opacity: 0.3,
  },
});
