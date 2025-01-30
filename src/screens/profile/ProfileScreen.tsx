import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MainTabScreenProps } from "../../types/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { LogoutModal } from "../../components/modals/LogoutModal";
import { profileService } from "../../api/services/profileService";
import { eventEmitter, MAP_EVENTS } from "../../utils/eventEmitter";

interface ProfileData {
  id: number;
  nickname: string;
  profile_image: string | null;
  subscribed_map_count: number;
}

export const ProfileScreen = ({
  navigation,
}: MainTabScreenProps<"Profile">) => {
  const { logout } = useAuth();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    const handleSubscriptionUpdate = ({
      isSubscribed
    }: {
      mapId: number;
      isSubscribed: boolean;
      subscriberCount: number;
    }) => {
      setProfileData(prev => prev ? {
        ...prev,
        subscribed_map_count: prev.subscribed_map_count + (isSubscribed ? 1 : -1)
      } : null);
    };

    eventEmitter.on(MAP_EVENTS.SUBSCRIPTION_UPDATED, handleSubscriptionUpdate);
    return () => {
      eventEmitter.off(MAP_EVENTS.SUBSCRIPTION_UPDATED, handleSubscriptionUpdate);
    };
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await profileService.getProfile();
      setProfileData(response.data);
    } catch (error: any) {
      console.error('Profile loading error:', error);
      if (error.status_code === 'login-required') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigation]);

  const handleLogout = () => {
    logout();
    setIsLogoutModalVisible(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  if (isLoading || !profileData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            {profileData.profile_image ? (
              <Image
                source={{ uri: profileData.profile_image }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={40} color="#666" />
              </View>
            )}
          </View>
          <Text style={styles.nickname}>{profileData.nickname}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profileData.subscribed_map_count}</Text>
            <Text style={styles.statLabel}>구독중인 맵</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <Pressable
            style={styles.menuItem}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Ionicons name="person-outline" size={24} color="#666" />
            <Text style={styles.menuText}>프로필 수정</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Ionicons name="settings-outline" size={24} color="#666" />
            <Text style={styles.menuText}>설정</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={24} color="#666" />
            <Text style={styles.menuText}>도움말</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </Pressable>
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={() => setIsLogoutModalVisible(true)}
        >
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </Pressable>
      </ScrollView>

      <LogoutModal
        visible={isLogoutModalVisible}
        onClose={() => setIsLogoutModalVisible(false)}
        onLogout={handleLogout}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loginPrompt: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  loginDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  loginButton: {
    width: "100%",
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
  header: {
    alignItems: "center",
    padding: 24,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  nickname: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 24,
    backgroundColor: "#f5f5f5",
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#ddd",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  menuContainer: {
    paddingHorizontal: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    margin: 24,
    height: 48,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
