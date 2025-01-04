import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { AuthStackScreenProps } from "../../types/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { RegisterResultModal } from "../../components/modals/RegisterResultModal";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RegisterScreen = ({
  navigation,
}: AuthStackScreenProps<"RegisterScreen">) => {
  const { register, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [registerResult, setRegisterResult] = useState<{
    visible: boolean;
    isSuccess: boolean;
    message: string;
  }>({
    visible: false,
    isSuccess: false,
    message: "",
  });

  const handleRegister = async () => {
    try {
      await register(email, password, nickname);
      setRegisterResult({
        visible: true,
        isSuccess: true,
        message: "회원가입이 완료되었습니다",
      });
    } catch (error: any) {
      setRegisterResult({
        visible: true,
        isSuccess: false,
        message: error.message || "회원가입에 실패했습니다",
      });
    }
  };

  const handleModalClose = () => {
    setRegisterResult((prev) => ({ ...prev, visible: false }));
    if (registerResult.isSuccess) {
      navigation.navigate("Main", { screen: "Profile" });
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.content, { paddingTop: 24 }]}>
            <Text style={styles.title}>회원가입</Text>
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="이메일"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="닉네임"
                  value={nickname}
                  onChangeText={setNickname}
                  maxLength={10}
                />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="비밀번호"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                />
                <Pressable
                  style={styles.visibilityButton}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  <Ionicons
                    name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color="#666"
                  />
                </Pressable>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="비밀번호 확인"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!isConfirmPasswordVisible}
                />
                <Pressable
                  style={styles.visibilityButton}
                  onPress={() =>
                    setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                  }
                >
                  <Ionicons
                    name={
                      isConfirmPasswordVisible
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={24}
                    color="#666"
                  />
                </Pressable>
              </View>
              <Pressable
                style={[
                  styles.registerButton,
                  isLoading && styles.registerButtonDisabled,
                ]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={styles.registerButtonText}>
                  {isLoading ? "가입 중..." : "가입하기"}
                </Text>
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>이미 계정이 있으신가요?</Text>
              <Pressable onPress={() => navigation.navigate("LoginScreen")}>
                <Text style={styles.loginText}>로그인</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <RegisterResultModal
        visible={registerResult.visible}
        isSuccess={registerResult.isSuccess}
        message={registerResult.message}
        onClose={handleModalClose}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  passwordInput: {
    paddingRight: 48,
  },
  visibilityButton: {
    position: "absolute",
    right: 12,
    height: 48,
    justifyContent: "center",
  },
  registerButton: {
    height: 48,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  registerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
    gap: 8,
  },
  footerText: {
    color: "#666",
  },
  loginText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
});
