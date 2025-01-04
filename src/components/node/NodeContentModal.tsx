import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Image,
  Animated,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NodeDetail } from "../../types/node";
import AnswerContent from "./AnswerContent";
import QuestionItem from "./QuestionItem";
import RuleItem from "./RuleItem";
import AnswerModal from "./AnswerModal";

interface NodeContentModalProps {
  isVisible: boolean;
  onClose: () => void;
  node: NodeDetail;
  onMoveToNode?: (nodeId: number) => void;
  variant: "completed" | "in_progress";
  isLoading?: boolean;
}

interface VariantStyles {
  statusIcon: {
    name: string;
    color: string;
  };
  progressBar: ViewStyle;
  actionButton: {
    container: ViewStyle;
    text: TextStyle;
    title: string;
  };
}

const VARIANT_STYLES: Record<"completed" | "in_progress", VariantStyles> = {
  completed: {
    statusIcon: {
      name: "checkmark-circle",
      color: "#4CAF50",
    },
    progressBar: {
      width: "100%",
      backgroundColor: "#4CAF50",
    },
    actionButton: {
      container: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#4CAF50",
      },
      text: {
        color: "#4CAF50",
      },
      title: "내 답변 보기",
    },
  },
  in_progress: {
    statusIcon: {
      name: "play-circle",
      color: "#2196F3",
    },
    progressBar: {
      backgroundColor: "#4CAF50",
    },
    actionButton: {
      container: {
        backgroundColor: "#4CAF50",
      },
      text: {
        color: "white",
      },
      title: "문제 풀기",
    },
  },
};

export const NodeContentModal: React.FC<NodeContentModalProps> = ({
  isVisible,
  onClose,
  node,
  onMoveToNode,
  variant,
  isLoading = false,
}) => {
  const [expandedRuleId, setExpandedRuleId] = useState<number | null>(null);
  const [expandedTargetId, setExpandedTargetId] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const animatedHeights = useRef<{ [key: string]: Animated.Value }>({}).current;
  const [viewingAnswerId, setViewingAnswerId] = useState<number | null>(null);

  // 초기화 로직
  React.useEffect(() => {
    setExpandedTargetId(null);
    setExpandedRuleId(null);

    Object.keys(animatedHeights).forEach((key) => {
      animatedHeights[key].setValue(0);
    });

    if (node?.active_rules) {
      node.active_rules.forEach((rule) => {
        animatedHeights[`rule-${rule.id}`] = new Animated.Value(0);
        rule.questions.forEach((target) => {
          animatedHeights[`target-${target.id}`] = new Animated.Value(0);
        });
      });
    }
  }, [node]);

  // 토글 함수들
  const toggleRule = (ruleId: number) => {
    const isExpanding = expandedRuleId !== ruleId;

    if (!animatedHeights[`rule-${ruleId}`]) {
      animatedHeights[`rule-${ruleId}`] = new Animated.Value(0);
    }

    if (expandedRuleId && expandedRuleId !== ruleId) {
      if (!animatedHeights[`rule-${expandedRuleId}`]) {
        animatedHeights[`rule-${expandedRuleId}`] = new Animated.Value(0);
      }
      Animated.timing(animatedHeights[`rule-${expandedRuleId}`], {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }

    Animated.timing(animatedHeights[`rule-${ruleId}`], {
      toValue: isExpanding ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    setExpandedRuleId(isExpanding ? ruleId : null);
  };

  const toggleTarget = (targetId: number) => {
    const isExpanding = expandedTargetId !== targetId;

    if (!animatedHeights[`target-${targetId}`]) {
      animatedHeights[`target-${targetId}`] = new Animated.Value(0);
    }

    if (expandedTargetId && expandedTargetId !== targetId) {
      if (!animatedHeights[`target-${expandedTargetId}`]) {
        animatedHeights[`target-${expandedTargetId}`] = new Animated.Value(0);
      }
      Animated.timing(animatedHeights[`target-${expandedTargetId}`], {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }

    Animated.timing(animatedHeights[`target-${targetId}`], {
      toValue: isExpanding ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    setExpandedTargetId(isExpanding ? targetId : null);
  };

  const handleMoveToNode = (nodeId: number) => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });

    // 모달 상태 초기화
    setExpandedTargetId(null);
    setExpandedRuleId(null);
    setViewingAnswerId(null);

    Object.keys(animatedHeights).forEach((key) => {
      animatedHeights[key].setValue(0);
    });

    // 새로운 노드로 이동
    onMoveToNode?.(nodeId);
  };

  // 답변 보기 핸들러
  const handleViewAnswer = (targetId: number) => {
    const target = node.active_rules
      .flatMap((rule) => rule.questions)
      .find((q) => q.id === targetId);

    if (target?.my_answers && target.my_answers.length > 0) {
      setViewingAnswerId(targetId);
    }
  };

  // 답변 보기 모달 닫기
  const handleCloseAnswer = () => {
    setViewingAnswerId(null);
  };

  // 답변 상태에 따른 스타일
  const getAnswerStatus = (answer: { is_correct: boolean | null }) => {
    if (answer.is_correct === null) return "검토중";
    return answer.is_correct ? "승인됨" : "거절됨";
  };

  const getAnswerStatusColor = (answer: { is_correct: boolean | null }) => {
    if (answer.is_correct === null) return "#2196F3";
    return answer.is_correct ? "#4CAF50" : "#F44336";
  };

  const variantStyle = VARIANT_STYLES[variant];
  const statusText = variant === "completed" ? "완료됨" : "진행 중";

  const answers = viewingAnswerId
    ? node.active_rules
        .flatMap((rule) => rule.questions)
        .find((q) => q.id === viewingAnswerId)?.my_answers
    : undefined;

  return (
    <>
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            {node.background_image ? (
              <>
                <Image
                  source={{ uri: node.background_image }}
                  style={styles.backgroundImage}
                  resizeMode="cover"
                />
                <View style={[styles.header, styles.headerWithBackground]}>
                  <Pressable onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                  </Pressable>
                  <View style={styles.headerRight} />
                </View>
              </>
            ) : (
              <View style={styles.header}>
                <Pressable onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="arrow-back" size={24} color="#666" />
                </Pressable>
                <View style={styles.headerRight} />
              </View>
            )}

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>
                  노드 정보를 불러오는 중...
                </Text>
              </View>
            ) : (
              <ScrollView
                ref={scrollViewRef}
                style={[
                  styles.content,
                  node.background_image ? styles.contentWithBackground : null,
                ]}
              >
                <View style={styles.section}>
                  <View style={styles.statusSection}>
                    <View style={styles.statusContainer}>
                      <Ionicons
                        name={variantStyle.statusIcon.name as any}
                        size={20}
                        color={variantStyle.statusIcon.color}
                      />
                      <Text style={styles.statusText}>{statusText}</Text>
                    </View>
                    {node.statistic && (
                      <View style={styles.statisticContainer}>
                        <View style={styles.statisticItem}>
                          <Ionicons name="people" size={16} color="#2196F3" />
                          <Text style={styles.statisticText}>
                            {node.statistic.activated_member_count}명 진행 중
                          </Text>
                        </View>
                        <Text style={styles.statisticDivider}>•</Text>
                        <View style={styles.statisticItem}>
                          <Ionicons
                            name="checkmark-done-circle"
                            size={16}
                            color="#4CAF50"
                          />
                          <Text style={styles.statisticText}>
                            {node.statistic.completed_member_count}명 완료
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  <Text style={styles.title}>{node.title}</Text>
                  <Text style={styles.description}>{node.description}</Text>

                  {/* Active Rules 목록 */}
                  {node.active_rules.map((rule) => (
                    <RuleItem
                      key={rule.id}
                      rule={rule}
                      isExpanded={expandedRuleId === rule.id}
                      animatedHeight={animatedHeights[`rule-${rule.id}`]}
                      onToggle={() => toggleRule(rule.id)}
                      variant={variant}
                      expandedTargetId={expandedTargetId}
                      animatedHeights={animatedHeights}
                      onToggleTarget={toggleTarget}
                      onViewAnswer={handleViewAnswer}
                      onMoveToNode={handleMoveToNode}
                      nodeId={node.id}
                      viewingAnswerId={viewingAnswerId}
                      variantStyle={variantStyle}
                      onSubmitAnswer={(questionId: number) => {
                        // TODO: 답변 제출/수정 모달 열기
                        console.log(
                          "Submit/Edit answer for question:",
                          questionId
                        );
                      }}
                    />
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <AnswerModal
        visible={viewingAnswerId !== null}
        onClose={handleCloseAnswer}
        answers={answers}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerWithBackground: {
    backgroundColor: "transparent",
    borderBottomWidth: 0,
  },
  closeButton: {
    padding: 8,
    width: 40,
  },
  headerRight: {
    width: 40,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 40,
  },
  headerTitleWithBackground: {
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  content: {
    padding: 16,
  },
  contentWithBackground: {
    marginTop: 100,
  },
  section: {
    marginBottom: 16,
  },
  statusSection: {
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#666",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 16,
  },
  statisticContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statisticItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statisticText: {
    fontSize: 13,
    color: "#666",
  },
  statisticDivider: {
    color: "#666",
    fontSize: 12,
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
  },
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
});

export default NodeContentModal;
