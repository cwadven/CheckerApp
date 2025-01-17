import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { AuthStackScreenProps } from "../../types/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { DevelopingModal } from "../../components/modals/DevelopingModal";
import { apiClient } from "../../api/client";
import { profileService } from "../../api/services/profileService";

export const LoginScreen = ({
  navigation,
}: AuthStackScreenProps<"LoginScreen">) => {
  const { login, setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isDevelopingModalVisible, setIsDevelopingModalVisible] =
    useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 1. 로그인 API 호출
      const response = await apiClient.login({
        username: email,
        password: password,
      });

      // 2. 토큰 저장
      await login(response.access_token, response.refresh_token);

      // 3. 프로필 정보 가져오기
      const profileResponse = await profileService.getProfile();
      const userData = {
        id: profileResponse.data.id,
        nickname: profileResponse.data.nickname,
        profile_image: profileResponse.data.profile_image
      };
      
      // 4. 유저 정보 저장
      setUser(userData);

      // 5. 프로필 화면으로 이동
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Main",
            params: {
              screen: "Profile"
            }
          }
        ]
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = () => {
    setIsDevelopingModalVisible(true);
  };

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.content, { paddingTop: 24 }]}>
          <Text style={styles.title}>로그인</Text>
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
            {error && <Text style={styles.errorText}>{error}</Text>}
            <Pressable
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? "로그인 중..." : "로그인"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <Pressable
              style={[styles.socialButton, styles.kakaoButton]}
              onPress={handleSocialLogin}
            >
              <Text style={styles.socialButtonText}>카카오로 계속하기</Text>
            </Pressable>
            <Pressable
              style={[styles.socialButton, styles.googleButton]}
              onPress={handleSocialLogin}
            >
              <Text style={styles.socialButtonText}>Google로 계속하기</Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>계정이 없으신가요?</Text>
            <Pressable onPress={() => navigation.navigate("RegisterScreen")}>
              <Text style={styles.registerText}>회원가입</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <DevelopingModal
        visible={isDevelopingModalVisible}
        onClose={() => setIsDevelopingModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  errorText: {
    color: "red",
    textAlign: "center",
  },
  loginButton: {
    height: 48,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#666",
  },
  socialButtons: {
    gap: 16,
  },
  socialButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  kakaoButton: {
    backgroundColor: "#FEE500",
  },
  googleButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  socialButtonText: {
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
  registerText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
});
