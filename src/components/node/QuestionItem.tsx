import React from "react";
import { View, Text, Pressable, StyleSheet, Animated, ViewStyle, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NodeDetail } from "../../types/node";

interface QuestionItemProps {
  question: NodeDetail["active_rules"][0]["questions"][0];
  isExpanded: boolean;
  animatedHeight: Animated.Value;
  onToggle: () => void;
  onViewAnswer: () => void;
  onSubmitAnswer: (questionId: number) => void;
  onMoveToNode: (nodeId: number) => void;
  nodeId: number;
  variant: "completed" | "in_progress" | "locked";
  viewingAnswerId: number | null;
  variantStyle: {
    actionButton: {
      container: ViewStyle;
      text: TextStyle;
    };
  };
}

export const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  isExpanded,
  animatedHeight,
  onToggle,
  onViewAnswer,
  onSubmitAnswer,
  onMoveToNode,
  nodeId,
  variant,
  viewingAnswerId,
  variantStyle,
}) => {
  const getStatusIcon = () => {
    if (variant === "locked") {
      return {
        name: "lock-closed",
        color: "#9E9E9E",
      };
    }

    if (question.status === "completed") {
      return {
        name: "checkmark-circle",
        color: "#4CAF50",
      };
    }

    if (variant === "in_progress") {
      return {
        name: "time",
        color: "#2196F3",
      };
    }

    return {
      name: "help-circle",
      color: "#666",
    };
  };

  const statusIcon = getStatusIcon();

  const renderActionButton = () => {
    if (variant === "locked") return null;

    if (question.by_node_id === nodeId) {
      if (variant === "completed") {
        return (
          <Pressable
            style={[styles.answerButton, variantStyle.actionButton.container]}
            onPress={onViewAnswer}
          >
            <Text
              style={[styles.answerButtonText, variantStyle.actionButton.text]}
            >
              {viewingAnswerId === question.id ? "답변 닫기" : "내 답변 보기"}
            </Text>
          </Pressable>
        );
      } else if (variant === "in_progress") {
        return (
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.answerButton, styles.submitButton]}
              onPress={() => onSubmitAnswer(question.id)}
            >
              <Text style={styles.answerButtonText}>
                {question.my_answers && question.my_answers.length > 0
                  ? "정답 수정"
                  : "정답 제출"}
              </Text>
            </Pressable>
            {question.my_answers && question.my_answers.length > 0 && (
              <Pressable
                style={[styles.answerButton, styles.viewAnswerButton]}
                onPress={onViewAnswer}
              >
                <Text style={styles.viewAnswerButtonText}>
                  {viewingAnswerId === question.id ? "답변 닫기" : "내 답변 보기"}
                </Text>
              </Pressable>
            )}
          </View>
        );
      }
    } else if (question.by_node_id) {
      return (
        <Pressable
          style={[styles.answerButton, styles.viewNodeButton]}
          onPress={() => onMoveToNode(question.by_node_id)}
        >
          <Text style={[styles.answerButtonText, styles.viewNodeButtonText]}>
            Node 보기
          </Text>
        </Pressable>
      );
    }

    return null;
  };

  return (
    <View style={[styles.questionItem]}>
      <Pressable style={styles.questionHeader} onPress={onToggle}>
        <View style={styles.questionTitleContainer}>
          <Ionicons name={statusIcon.name} size={16} color={statusIcon.color} />
          <Text style={styles.questionTitle}>{question.title}</Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={16}
          color="#666"
        />
      </Pressable>

      <Animated.View
        style={[
          styles.questionContent,
          {
            maxHeight:
              animatedHeight?.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 500],
              }) || 0,
            opacity: animatedHeight || 0,
          },
        ]}
      >
        <Text style={styles.questionDescription}>
          {question.description?.replace(/\\n/g, '\n')}
        </Text>
        {renderActionButton()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  questionItem: {
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  questionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  questionTitle: {
    fontSize: 14,
    color: "#333",
  },
  questionContent: {
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  questionDescription: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
  },
  answerButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  answerButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  viewNodeButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  viewNodeButtonText: {
    color: "#2196F3",
  },
  questionCompleted: {
    borderColor: "#4CAF50",
  },
  questionLocked: {
    borderColor: "#9E9E9E",
    opacity: 0.7,
  },
  questionInProgress: {
    borderColor: "#2196F3",
  },
  submitButton: {
    backgroundColor: "#2196F3",
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  viewAnswerButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  viewAnswerButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default QuestionItem;
