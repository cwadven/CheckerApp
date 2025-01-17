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

// 노드 관련 기본 상수
const DEFAULT_NODE_SIZE = {
  width: 100,
  height: 100,
};

// 화살표 관련 상수
const ARROW_HEAD_LENGTH = 15;
const ARROW_STROKE_WIDTH = 2;

const getNodeCenter = (node: Node) => {
  const width = node.width || DEFAULT_NODE_SIZE.width;
  const height = node.height || DEFAULT_NODE_SIZE.height;
  return {
    x: node.position_x + width / 2,
    y: node.position_y + height / 2,
  };
};

const getNodeRadius = (node: Node) => {
  const width = node.width || DEFAULT_NODE_SIZE.width;
  const height = node.height || DEFAULT_NODE_SIZE.height;
  return Math.min(width, height) / 2;
};

export const calculateArrowPath = (
  arrow: Arrow,
  nodes: Node[],
  arrows: Arrow[]
): { startX: number; startY: number; endX: number; endY: number } | null => {
  const startNode = nodes.find((n) => n.id === arrow.start_node_id);
  const endNode = nodes.find((n) => n.id === arrow.end_node_id);

  if (!startNode || !endNode) return null;

  const sameRuleArrows = arrows.filter(a => 
    a.end_node_id === arrow.end_node_id && 
    a.active_rule_id === arrow.active_rule_id
  );

  const endCenter = getNodeCenter(endNode);
  const startCenter = getNodeCenter(startNode);

  const angles = sameRuleArrows.map(a => {
    const node = nodes.find(n => n.id === a.start_node_id);
    if (!node) return null;
    const nodeCenter = getNodeCenter(node);
    const dx = nodeCenter.x - endCenter.x;
    const dy = nodeCenter.y - endCenter.y;
    return Math.atan2(dy, dx);
  }).filter(Boolean) as number[];

  const avgAngle = angles.reduce((sum, angle) => sum + angle, 0) / angles.length;

  const endNodeRadius = getNodeRadius(endNode);
  const startNodeRadius = getNodeRadius(startNode);

  const targetX = endCenter.x + Math.cos(avgAngle) * endNodeRadius;
  const targetY = endCenter.y + Math.sin(avgAngle) * endNodeRadius;

  const angle = Math.atan2(targetY - startCenter.y, targetX - startCenter.x);
  const adjustedStartX = startCenter.x + Math.cos(angle) * startNodeRadius;
  const adjustedStartY = startCenter.y + Math.sin(angle) * startNodeRadius;

  return {
    startX: adjustedStartX,
    startY: adjustedStartY,
    endX: targetX,
    endY: targetY,
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
          const path = calculateArrowPath(arrow, nodes, arrows);
          if (!path) return null;

          const startNode = nodes.find((n) => n.id === arrow.start_node_id);
          const isStartNodeCompleted = startNode?.status === "completed";

          return (
            <Path
              key={arrow.id}
              d={`M ${path.startX} ${path.startY} L ${path.endX} ${path.endY}`}
              stroke={isStartNodeCompleted ? theme.arrow.completed : theme.arrow.locked}
              strokeWidth={ARROW_STROKE_WIDTH}
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
          const path = calculateArrowPath(arrow, nodes, arrows);
          if (!path) return null;

          const startNode = nodes.find((n) => n.id === arrow.start_node_id);
          const isStartNodeCompleted = startNode?.status === "completed";

          const dx = path.endX - path.startX;
          const dy = path.endY - path.startY;
          const length = Math.sqrt(dx * dx + dy * dy);
          const ratio = ARROW_HEAD_LENGTH / length;
          const headStartX = path.endX - dx * ratio;
          const headStartY = path.endY - dy * ratio;

          return (
            <Path
              key={`head-${arrow.id}`}
              d={`M ${headStartX} ${headStartY} L ${path.endX} ${path.endY}`}
              stroke={isStartNodeCompleted ? theme.arrow.completed : theme.arrow.locked}
              strokeWidth={ARROW_STROKE_WIDTH}
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

export default MapArrows;