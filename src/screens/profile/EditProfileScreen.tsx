import React, { useState, useEffect } from "react";
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
  Modal,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import type { RootStackScreenProps } from "../../types/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { apiClient, ApiError } from "../../api/client";
import { profileService } from "../../api/services/profileService";

interface ProfileData {
  id: number;
  nickname: string;
  profile_image: string | null;
  subscribed_map_count: number;
}

interface ProfileUpdateResponse {
  status_code: string;
  data: {
    id: number;
    nickname: string;
    profile_image: string;
    subscribed_map_count: number;
  };
}

export const EditProfileScreen = ({
  navigation,
}: RootStackScreenProps<"EditProfile">) => {
  const { updateUser } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [nickname, setNickname] = useState("");
  const [selectedImage, setSelectedImage] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await profileService.getProfile();
        setProfileData(response.data);
        setNickname(response.data.nickname);
      } catch (error) {
        console.error('Profile loading error:', error);
      }
    };

    loadProfile();
  }, []);

  const handleUpdateProfile = async () => {
    if (nickname.length < 2) {
      setErrorModal({
        visible: true,
        message: "닉네임은 2자 이상이어야 합니다."
      });
      return;
    }

    if (nickname === profileData?.nickname && !selectedImage) {
      navigation.goBack();
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      
      if (nickname !== profileData?.nickname) {
        formData.append('nickname', nickname);
      }

      if (selectedImage) {
        if (!selectedImage.uri) {
          setErrorModal({
            visible: true,
            message: "이미지 파일을 불러오는데 실패했습니다."
          });
          return;
        }
        
        if (Platform.OS === 'web') {
          const response = await fetch(selectedImage.uri);
          const blob = await response.blob();
          formData.append('profile_image', blob, selectedImage.fileName);
        } else {
          formData.append('profile_image', {
            uri: selectedImage.uri,
            type: selectedImage.type || 'application/octet-stream',
            name: selectedImage.fileName || 'profile.jpg',
          } as any);
        }
      }

      const response = await apiClient.patch<ProfileUpdateResponse>('/v1/member/profile', formData);

      if (response.status_code === 'success') {
        updateUser(response.data);
        navigation.goBack();
      }
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        const firstError = Object.values(error.errors)[0]?.[0];
        if (firstError) {
          setErrorModal({
            visible: true,
            message: firstError
          });
        }
      } else {
        setErrorModal({
          visible: true,
          message: error instanceof ApiError ? error.message : '프로필 수정에 실패했습니다.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeProfileImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
      selectionLimit: 1,
    });

    if (!result.didCancel && result.assets?.[0]) {
      setSelectedImage(result.assets[0]);
    }
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
            {selectedImage?.uri || profileData?.profile_image ? (
              <Image
                source={{ uri: selectedImage?.uri || profileData?.profile_image }}
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
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>저장하기</Text>
          )}
        </Pressable>
      </ScrollView>

      <Modal
        visible={errorModal.visible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>오류</Text>
            <Text style={styles.modalMessage}>{errorModal.message}</Text>
            <Pressable 
              style={styles.modalButton}
              onPress={() => setErrorModal(prev => ({ ...prev, visible: false }))}
            >
              <Text style={styles.modalButtonText}>확인</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
