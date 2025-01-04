import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Answer {
  id: number;
  answer: string;
  is_correct: boolean | null;
  feedback?: string;
  submitted_at: string;
}

interface AnswerContentProps {
  answer: Answer;
}

export const AnswerContent: React.FC<AnswerContentProps> = ({ answer }) => {
  const getAnswerStatus = (answer: { is_correct: boolean | null }) => {
    if (answer.is_correct === null) return "검토중";
    return answer.is_correct ? "승인됨" : "거절됨";
  };

  const getAnswerStatusColor = (answer: { is_correct: boolean | null }) => {
    if (answer.is_correct === null) return "#2196F3";
    return answer.is_correct ? "#4CAF50" : "#F44336";
  };

  return (
    <View style={styles.answerItem}>
      <View style={styles.answerHeader}>
        <Text style={styles.answerDate}>
          {new Date(answer.submitted_at).toLocaleString()}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: getAnswerStatusColor(answer) + "20",
            },
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              { color: getAnswerStatusColor(answer) },
            ]}
          >
            {getAnswerStatus(answer)}
          </Text>
        </View>
      </View>
      <View style={styles.answerTextContainer}>
        <Text style={styles.answerText}>{answer.answer}</Text>
      </View>
      {answer.feedback ? (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>관리자 피드백</Text>
          <Text style={styles.feedbackText}>{answer.feedback}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  answerItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  answerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  answerDate: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  answerText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
  },
  feedbackContainer: {
    backgroundColor: "#FFF8E1",
    padding: 12,
    borderRadius: 8,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#F57C00",
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  answerTextContainer: {
    marginBottom: 12,
  },
});

export default AnswerContent;
