import React from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NodeDetail } from "../../types/node";
import AnswerContent from "./AnswerContent";

interface AnswerModalProps {
  visible: boolean;
  onClose: () => void;
  answers?: NodeDetail["active_rules"][0]["questions"][0]["my_answers"];
}

export const AnswerModal: React.FC<AnswerModalProps> = ({
  visible,
  onClose,
  answers,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="arrow-back" size={24} color="#666" />
            </Pressable>
            <Text style={styles.headerTitle}>내 답변</Text>
            <View style={styles.headerRight} />
          </View>
          <ScrollView style={styles.content}>
            {answers?.map((answer) => (
              <AnswerContent key={answer.id} answer={answer} />
            ))}
          </ScrollView>
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
  content: {
    padding: 16,
  },
});

export default AnswerModal;
