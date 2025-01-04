import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { RootStackScreenProps } from "../../types/navigation";
import { useAuth } from "../../contexts/AuthContext";

export const EditProfileScreen = ({
  navigation,
}: RootStackScreenProps<"EditProfile">) => {
  const { user, isLoading } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname || "");

  const handleUpdateProfile = async () => {
    if (nickname.length < 2) {
      Alert.alert("오류", "닉네임은 2자 이상이어야 합니다.");
      return;
    }

    try {
      // TODO: 프로필 업데이트 API 호출
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("오류", "프로필 수정에 실패했습니다.");
    }
  };

  const handleChangeProfileImage = () => {
    // TODO: 이미지 선택/업로드 기능 구현
    Alert.alert("알림", "프로필 이미지 변��� 기능은 준비 중입니다.");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable
            style={styles.profileImageContainer}
            onPress={handleChangeProfileImage}
          >
            {user?.profile_image ? (
              <Image
                source={{ uri: user.profile_image }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={40} color="#666" />
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </Pressable>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={user?.email}
              editable={false}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>닉네임</Text>
            <TextInput
              style={styles.input}
              value={nickname}
              onChangeText={setNickname}
              maxLength={10}
              placeholder="닉네임을 입력하세요"
            />
          </View>
        </View>

        <Pressable
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleUpdateProfile}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? "저장 중..." : "저장하기"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  editBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
    color: "#666",
  },
  saveButton: {
    height: 48,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
