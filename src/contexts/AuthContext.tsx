import React, { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  user: {
    id?: number;
    nickname?: string;
    profile_image?: string | null;
  } | null;
  setUser: (user: AuthContextType['user']) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthContextType['user']>(null);

  const login = async (accessToken: string, refreshToken: string) => {
    await AsyncStorage.setItem("guest_token", accessToken);
    await AsyncStorage.setItem("refresh_token", refreshToken);
    setUser({});
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("guest_token");
    await AsyncStorage.removeItem("refresh_token");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, setUser }}>
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
