import React from "react";
import { View, Text, StyleSheet, Modal, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NodeDetail } from "../../types/node";

interface LockedNodeModalProps {
  isVisible: boolean;
  onClose: () => void;
  node: NodeDetail;
}

export const LockedNodeModal: React.FC<LockedNodeModalProps> = ({
  isVisible,
  onClose,
  node,
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, styles.lockedModalContainer]}>
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
                <Text
                  style={[styles.headerTitle, styles.headerTitleWithBackground]}
                  numberOfLines={1}
                >
                  {node.title}
                </Text>
                <View style={styles.headerRight} />
              </View>
            </>
          ) : (
            <View style={styles.header}>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Ionicons name="arrow-back" size={24} color="#666" />
              </Pressable>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {node.title}
              </Text>
              <View style={styles.headerRight} />
            </View>
          )}
          <View
            style={[
              styles.lockedContent,
              node.background_image ? styles.lockedContentWithBackground : null,
            ]}
          >
            <Ionicons name="lock-closed" size={48} color="#666" />
            <Text style={styles.lockedText}>
              아직 해당 내용을 알 수 없습니다.
            </Text>
            {node.statistic && (
              <View style={styles.lockedStatisticContainer}>
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
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 1000,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1001,
  },
  lockedModalContainer: {
    minHeight: 300,
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
  lockedContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
    backgroundColor: "white",
  },
  lockedContentWithBackground: {
    marginTop: 100,
  },
  lockedText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  lockedStatisticContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
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
});

export default LockedNodeModal;
