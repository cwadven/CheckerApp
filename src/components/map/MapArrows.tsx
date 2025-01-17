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

// 노드 관련 상수
const NODE_WIDTH = 100;
const NODE_HEIGHT = 80;
const NODE_CENTER_X = NODE_WIDTH / 2;  // 50
const NODE_CENTER_Y = NODE_HEIGHT / 2;  // 40
const NODE_RADIUS = 40;

// 화살표 관련 상수
const ARROW_HEAD_LENGTH = 15;
const ARROW_STROKE_WIDTH = 2;

export const calculateArrowPath = (
  arrow: Arrow,
  nodes: Node[],
  arrows: Arrow[]
): { startX: number; startY: number; endX: number; endY: number } | null => {
  const startNode = nodes.find((n) => n.id === arrow.start_node_id);
  const endNode = nodes.find((n) => n.id === arrow.end_node_id);

  if (!startNode || !endNode) return null;

  // 같은 active_rule_id를 가진 화살표들의 시작점들 찾기
  const sameRuleArrows = arrows.filter(a => 
    a.end_node_id === arrow.end_node_id && 
    a.active_rule_id === arrow.active_rule_id
  );

  // 시작점들의 중심점 계산
  const centerX = endNode.position_x + NODE_CENTER_X;
  const centerY = endNode.position_y + NODE_CENTER_Y;

  // 현재 화살표의 시작점
  const startX = startNode.position_x + NODE_CENTER_X;
  const startY = startNode.position_y + NODE_CENTER_Y;

  // 시작점들의 평균 각도 계산
  const angles = sameRuleArrows.map(a => {
    const node = nodes.find(n => n.id === a.start_node_id);
    if (!node) return null;
    const dx = (node.position_x + NODE_CENTER_X) - centerX;
    const dy = (node.position_y + NODE_CENTER_Y) - centerY;
    return Math.atan2(dy, dx);
  }).filter(Boolean) as number[];

  const avgAngle = angles.reduce((sum, angle) => sum + angle, 0) / angles.length;

  // 평균 각도를 사용하여 도착점 계산
  const targetX = centerX + Math.cos(avgAngle) * NODE_RADIUS;
  const targetY = centerY + Math.sin(avgAngle) * NODE_RADIUS;

  // 개별 화살표의 시작점 조정
  const angle = Math.atan2(targetY - startY, targetX - startX);
  const adjustedStartX = startX + Math.cos(angle) * NODE_RADIUS;
  const adjustedStartY = startY + Math.sin(angle) * NODE_RADIUS;

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
          const path = calculateArrowPath(arrow, nodes, arrows);
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

export default MapArrows;