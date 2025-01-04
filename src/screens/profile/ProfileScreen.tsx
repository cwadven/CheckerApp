import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MainTabScreenProps } from "../../types/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { LogoutModal } from "../../components/modals/LogoutModal";

export const ProfileScreen = ({
  navigation,
}: MainTabScreenProps<"Profile">) => {
  const { user, isLoading, logout } = useAuth();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  if (isLoading || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    setIsLogoutModalVisible(false);
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            {user.profile_image ? (
              <Image
                source={{ uri: user.profile_image }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={40} color="#666" />
              </View>
            )}
          </View>
          <Text style={styles.nickname}>{user.nickname}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.subscription_count}</Text>
            <Text style={styles.statLabel}>구독중인 맵</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.completed_map_count}</Text>
            <Text style={styles.statLabel}>완료한 맵</Text>
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
});
