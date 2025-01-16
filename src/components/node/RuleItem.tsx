import React from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NodeDetail } from "../../types/node";
import QuestionItem from "./QuestionItem";

interface RuleItemProps {
  rule: NodeDetail["active_rules"][0];
  isExpanded: boolean;
  animatedHeight: Animated.Value;
  onToggle: () => void;
  variant: "completed" | "in_progress";
  expandedTargetIds: number[];
  animatedHeights: { [key: string]: Animated.Value };
  onToggleTarget: (targetId: number) => void;
  onViewAnswer: (questionId: number) => void;
  onMoveToNode: (nodeId: number) => void;
  nodeId: number;
  viewingAnswerId: number | null;
  variantStyle: any; // TODO: 정확한 타입 정의 필요
  onSubmitAnswer: (questionId: number) => void;
}

export const RuleItem: React.FC<RuleItemProps> = ({
  rule,
  isExpanded,
  animatedHeight,
  onToggle,
  variant,
  expandedTargetIds,
  animatedHeights,
  onToggleTarget,
  onViewAnswer,
  onMoveToNode,
  nodeId,
  viewingAnswerId,
  variantStyle,
  onSubmitAnswer,
}) => {
  return (
    <View style={styles.section}>
      <Pressable style={styles.ruleHeader} onPress={onToggle}>
        <View>
          <Text style={styles.sectionTitle}>{rule.name}</Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                variant === "completed"
                  ? { width: "100%" }
                  : { width: `${rule.progress.percentage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {variant === "completed"
              ? `100% 완료 (${rule.questions.length}/${rule.questions.length} 문제 해결)`
              : `${rule.progress.percentage}% 완료 (${rule.progress.completed_questions}/${rule.progress.total_questions} 문제 해결)`}
          </Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#666"
        />
      </Pressable>

      <Animated.View
        style={[
          styles.ruleContent,
          {
            maxHeight: animatedHeight?.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 5000],
            }) || 0,
            opacity: animatedHeight || 0,
          },
        ]}
      >
        <View style={styles.questionsContainer}>
          {rule.questions.map((question) => (
            <QuestionItem
              key={question.id}
              question={question}
              isExpanded={expandedTargetIds.includes(question.arrow_id)}
              animatedHeight={animatedHeights[`target-${question.arrow_id}`]}
              onToggle={() => onToggleTarget(question.arrow_id)}
              onViewAnswer={() => onViewAnswer(question.id)}
              onSubmitAnswer={() => onSubmitAnswer(question.id)}
              onMoveToNode={onMoveToNode}
              nodeId={nodeId}
              variant={variant}
              viewingAnswerId={viewingAnswerId}
              variantStyle={variantStyle}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  ruleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E8F5E9",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
  },
  ruleContent: {
    overflow: "hidden",
  },
  questionsContainer: {
    gap: 8,
    paddingBottom: 16,
  },
});

export default RuleItem;
