import React, { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { RootStackParamList } from '../types/navigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface User {
  id: number;
  email: string;
  nickname: string;
  profile_image: string | null;
  subscribed_map_count: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (tokens: { access_token: string; refresh_token: string }) => Promise<void>;
  logout: () => Promise<void>;
  user: User | null;
  setUser: (user: User | null) => void;
  redirectToLogin: (message: string) => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigation = useNavigation<NavigationType>();

  const login = async (tokens: LoginResponse) => {
    try {
      await AsyncStorage.setItem('access_token', tokens.access_token);
      await AsyncStorage.setItem('refresh_token', tokens.refresh_token);
      await AsyncStorage.setItem('is_member', 'true');
      setUser(null);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to save tokens:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('is_member');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Failed to remove tokens:', error);
      throw error;
    }
  };

  const redirectToLogin = async (message: string) => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ 
        name: 'Auth' as const,
        params: { 
          screen: 'LoginScreen' as const,
          params: { message } 
        }
      }],
    });
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout, 
      user,
      setUser,
      redirectToLogin,
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
