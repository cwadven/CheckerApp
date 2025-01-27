import React from "react";
import { StyleSheet, Platform } from "react-native";
import Svg, { Path, Marker, Defs } from "react-native-svg";
import type { MapGraphMeta } from "../../types/map";
import type { Node, Arrow } from "../../types/graph";
import { GRAPH_PADDING } from "../../constants/layout";

interface MapArrowsProps {
  layout: MapGraphMeta["layout"];
  arrows: Arrow[];
  nodes: Node[];
  theme: MapGraphMeta["theme"];
}

// 노드 관련 기본 상수
const DEFAULT_NODE_SIZE = {
  width: 100,
  height: 100,
};

// 플랫폼별 화살표 스타일 상수
const ARROW_STYLES = {
  ios: {
    headLength: 20,
    strokeWidth: 3,
    markerSize: 8
  },
  android: {
    headLength: 18,  // iOS보다 약간 작게
    strokeWidth: 2,
    markerSize: 7    // iOS보다 약간 작게
  },
  web: {
    headLength: 15,
    strokeWidth: 2,
    markerSize: 6
  }
};

// 현재 플랫폼에 따른 스타일 선택
const currentStyle = Platform.select({
  ios: ARROW_STYLES.ios,
  android: ARROW_STYLES.android,
  web: ARROW_STYLES.web,
  default: ARROW_STYLES.web
});

// 화살표 관련 상수
const ARROW_HEAD_LENGTH = currentStyle.headLength;
const ARROW_STROKE_WIDTH = currentStyle.strokeWidth;

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
  arrows: Arrow[],
  layout: MapGraphMeta["layout"]
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

  // 현재 화살표의 기본 방향 계산
  const baseAngle = Math.atan2(
    endCenter.y - startCenter.y,
    endCenter.x - startCenter.x
  );

  // 화살표가 하나면 기본 방향 사용
  if (sameRuleArrows.length <= 1) {
    const endNodeRadius = getNodeRadius(endNode);
    const startNodeRadius = getNodeRadius(startNode);

    return {
      startX: (startCenter.x + Math.cos(baseAngle) * startNodeRadius - layout.min_x) + GRAPH_PADDING,
      startY: (startCenter.y + Math.sin(baseAngle) * startNodeRadius - layout.min_y) + GRAPH_PADDING,
      endX: (endCenter.x - Math.cos(baseAngle) * endNodeRadius - layout.min_x) + GRAPH_PADDING,
      endY: (endCenter.y - Math.sin(baseAngle) * endNodeRadius - layout.min_y) + GRAPH_PADDING,
    };
  }

  // 여러 화살표의 평균 방향 계산
  const validAngles = sameRuleArrows
    .map(a => {
      const node = nodes.find(n => n.id === a.start_node_id);
      if (!node) return null;
      const nodeCenter = getNodeCenter(node);
      return Math.atan2(
        endCenter.y - nodeCenter.y,
        endCenter.x - nodeCenter.x
      );
    })
    .filter((angle): angle is number => angle !== null);

  const avgAngle = validAngles.length > 0
    ? validAngles.reduce((sum, angle) => sum + angle, 0) / validAngles.length
    : baseAngle;

  const endNodeRadius = getNodeRadius(endNode);
  const startNodeRadius = getNodeRadius(startNode);

  const targetX = endCenter.x - Math.cos(avgAngle) * endNodeRadius;
  const targetY = endCenter.y - Math.sin(avgAngle) * endNodeRadius;

  return {
    startX: (startCenter.x + Math.cos(baseAngle) * startNodeRadius - layout.min_x) + GRAPH_PADDING,
    startY: (startCenter.y + Math.sin(baseAngle) * startNodeRadius - layout.min_y) + GRAPH_PADDING,
    endX: (targetX - layout.min_x) + GRAPH_PADDING,
    endY: (targetY - layout.min_y) + GRAPH_PADDING,
  };
};

export const MapArrows = ({
  layout,
  arrows,
  nodes,
  theme,
}: MapArrowsProps) => {
  const width = layout.max_x - layout.min_x + (GRAPH_PADDING * 2);
  const height = layout.max_y - layout.min_y + (GRAPH_PADDING * 2);

  return (
    <>
      <Svg width={width} height={height} style={styles.container}>
        {arrows.map((arrow) => {
          if (arrow.start_node_id === arrow.end_node_id) return null;
          const path = calculateArrowPath(arrow, nodes, arrows, layout);
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
                markerWidth={currentStyle.markerSize}
                markerHeight={currentStyle.markerSize}
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
          const path = calculateArrowPath(arrow, nodes, arrows, layout);
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