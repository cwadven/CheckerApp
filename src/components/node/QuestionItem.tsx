import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NodeDetail } from "../../types/node";
import AnswerContent from "./AnswerContent";
import AnswerSubmitModal from './AnswerSubmitModal';
import * as DocumentPicker from 'expo-document-picker';

type DocumentPickerAsset = DocumentPicker.DocumentPickerAsset;

interface TargetItemProps {
  question: NodeDetail["active_rules"][0]["questions"][0];
  isExpanded: boolean;
  animatedHeight: Animated.Value;
  onToggle: () => void;
  onViewAnswer: () => void;
  onSubmitAnswer?: () => void;
  onMoveToNode: (nodeId: number) => void;
  nodeId: number;
  variant: "completed" | "in_progress" | "locked";
  viewingAnswerId: number | null;
  variantStyle: any;
}

export const QuestionItem: React.FC<TargetItemProps> = ({
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
  const [isAnswerSubmitModalVisible, setAnswerSubmitModalVisible] = useState(false);

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

  const handleSubmitAnswer = async (answer: string, files: DocumentPickerAsset[]) => {
    // TODO: API를 통해 답변 제출 로직 구현
    console.log('제출된 답변:', answer);
    console.log('제출된 파일들:', files);
  };

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
          <Pressable
            style={[styles.answerButton, styles.submitButton]}
            onPress={() => setAnswerSubmitModalVisible(true)}
          >
            <Text style={styles.answerButtonText}>
              {question.my_answers && question.my_answers.length > 0
                ? "정답 수정"
                : "정답 제출"}
            </Text>
          </Pressable>
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
        <Text style={styles.questionDescription}>{question.description}</Text>
        {renderActionButton()}
      </Animated.View>

      <AnswerSubmitModal
        visible={isAnswerSubmitModalVisible}
        onClose={() => setAnswerSubmitModalVisible(false)}
        question={question}
        onSubmit={handleSubmitAnswer}
      />
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
});

export default QuestionItem;
