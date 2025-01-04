import React from "react";
import { StyleSheet } from "react-native";
import Svg, { Path, Marker, Defs } from "react-native-svg";
import type { MapGraphMeta } from "../../types/map";
import type { Node, Arrow } from "../../types/graph";

interface MapArrowsProps {
  width: number;
  height: number;
  arrows: Arrow[];
  nodes: Node[];
  theme: MapGraphMeta["theme"];
}

export const calculateArrowPath = (
  arrow: Arrow,
  nodes: Node[]
): { startX: number; startY: number; endX: number; endY: number } | null => {
  const startNode = nodes.find((n) => n.id === arrow.start_node_id);
  const endNode = nodes.find((n) => n.id === arrow.end_node_id);

  if (!startNode || !endNode) return null;

  const startX = startNode.position_x + 50;
  const startY = startNode.position_y + 40;
  const endX = endNode.position_x + 50;
  const endY = endNode.position_y + 40;

  const angle = Math.atan2(endY - startY, endX - startX);
  const nodeRadius = 40;

  const adjustedStartX = startX + Math.cos(angle) * nodeRadius;
  const adjustedStartY = startY + Math.sin(angle) * nodeRadius;

  const adjustedEndX = endX - Math.cos(angle) * nodeRadius;
  const adjustedEndY = endY - Math.sin(angle) * nodeRadius;

  return {
    startX: adjustedStartX,
    startY: adjustedStartY,
    endX: adjustedEndX,
    endY: adjustedEndY,
  };
};

export const MapArrows = ({
  width,
  height,
  arrows,
  nodes,
  theme,
}: MapArrowsProps) => {
  return (
    <>
      <Svg width={width} height={height} style={styles.container}>
        {arrows.map((arrow) => {
          if (arrow.start_node_id === arrow.end_node_id) return null;
          const path = calculateArrowPath(arrow, nodes);
          if (!path) return null;

          const startNode = nodes.find((n) => n.id === arrow.start_node_id);
          const isStartNodeCompleted = startNode?.status === "completed";

          return (
            <Path
              key={arrow.id}
              d={`M ${path.startX} ${path.startY} L ${path.endX} ${path.endY}`}
              stroke={
                isStartNodeCompleted
                  ? theme.arrow.completed
                  : theme.arrow.locked
              }
              strokeWidth="2"
              fill="none"
            />
          );
        })}
      </Svg>

      <Svg
        width={width}
        height={height}
        style={[styles.container, { zIndex: 3 }]}
        pointerEvents="none"
      >
        <Defs>
          {arrows.map((arrow) => {
            if (arrow.start_node_id === arrow.end_node_id) return null;
            const startNode = nodes.find((n) => n.id === arrow.start_node_id);
            const isStartNodeCompleted = startNode?.status === "completed";

            return (
              <Marker
                key={`marker-${arrow.id}`}
                id={`arrow-${arrow.id}`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <Path
                  d="M 0 0 L 10 5 L 0 10 z"
                  fill={
                    isStartNodeCompleted
                      ? theme.arrow.completed
                      : theme.arrow.locked
                  }
                />
              </Marker>
            );
          })}
        </Defs>
        {arrows.map((arrow) => {
          if (arrow.start_node_id === arrow.end_node_id) return null;
          const path = calculateArrowPath(arrow, nodes);
          if (!path) return null;

          const startNode = nodes.find((n) => n.id === arrow.start_node_id);
          const isStartNodeCompleted = startNode?.status === "completed";

          const headLength = 15;
          const dx = path.endX - path.startX;
          const dy = path.endY - path.startY;
          const length = Math.sqrt(dx * dx + dy * dy);
          const ratio = headLength / length;
          const headStartX = path.endX - dx * ratio;
          const headStartY = path.endY - dy * ratio;

          return (
            <Path
              key={`head-${arrow.id}`}
              d={`M ${headStartX} ${headStartY} L ${path.endX} ${path.endY}`}
              stroke={
                isStartNodeCompleted
                  ? theme.arrow.completed
                  : theme.arrow.locked
              }
              strokeWidth="2"
              fill="none"
              markerEnd={`url(#arrow-${arrow.id})`}
            />
          );
        })}
      </Svg>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
});
