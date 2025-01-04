import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DevelopingModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DevelopingModal = ({ visible, onClose }: DevelopingModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="construct" size={32} color="white" />
            </View>
            <Text style={styles.title}>개발 진행 중</Text>
            <Text style={styles.message}>
              조금만 기다려주세요. 아직 개발 중입니다.
            </Text>
          </View>
          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>확인</Text>
          </Pressable>
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
    width: "80%",
    backgroundColor: "white",
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  content: {
    padding: 24,
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  button: {
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  buttonText: {
    fontSize: 16,
    color: "#2196F3",
    fontWeight: "600",
  },
});
