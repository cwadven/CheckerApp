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

interface RegisterResultModalProps {
  visible: boolean;
  isSuccess: boolean;
  message: string;
  onClose: () => void;
}

export const RegisterResultModal = ({
  visible,
  isSuccess,
  message,
  onClose,
}: RegisterResultModalProps) => {
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
            <View
              style={[
                styles.iconContainer,
                isSuccess ? styles.successIcon : styles.errorIcon,
              ]}
            >
              <Ionicons
                name={isSuccess ? "checkmark" : "close"}
                size={32}
                color="white"
              />
            </View>
            <Text style={styles.title}>
              {isSuccess ? "회원가입 성공" : "회원���입 실패"}
            </Text>
            <Text style={styles.message}>{message}</Text>
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successIcon: {
    backgroundColor: "#4CAF50",
  },
  errorIcon: {
    backgroundColor: "#FF3B30",
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
    color: "#4CAF50",
    fontWeight: "600",
  },
});
