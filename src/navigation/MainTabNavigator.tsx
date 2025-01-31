import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { HomeScreen } from "../screens/home/HomeScreen";
import { MySubscriptionScreen } from "../screens/subscription/MySubscriptionScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { MapListScreen } from "../screens/map/MapListScreen";
import { MapDetailScreen } from "../screens/map/MapDetailScreen";
import { MapGraphScreen } from "../screens/map/MapGraphScreen";
import { MapGraphLoadingScreen } from "../screens/map/MapGraphLoadingScreen";
import { EditProfileScreen } from "../screens/profile/EditProfileScreen";
import { MapSettingsScreen } from "../screens/map/MapSettingsScreen";
import { useAuth } from "../contexts/AuthContext";
import { MainTabParamList, RootStackParamList } from "../types/navigation";

const Tab = createBottomTabNavigator<MainTabParamList>();
const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator<RootStackParamList>();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
      <AuthStack.Screen
        name="RegisterScreen"
        component={RegisterScreen}
        options={{ presentation: "modal" }}
      />
    </AuthStack.Navigator>
  );
};

export const MainTabNavigator = () => {
  const { isAuthenticated } = useAuth();

  const renderProfileScreen = () => {
    if (!isAuthenticated) {
      return AuthNavigator;
    }
    return ProfileScreen;
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "gray",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "홈",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MySubscription"
        component={MySubscriptionScreen}
        options={{
          title: "구독",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="bookmark-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={renderProfileScreen()}
        options={{
          title: "프로필",
          tabBarIcon: ({ color, size } : { color: string; size: number }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const MainStackNavigator = () => {
  return (
    <MainStack.Navigator>
      <MainStack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="MapList"
        component={MapListScreen}
        options={{
          headerShown: true,
          headerTitle: "",
          headerBackTitle: "뒤로",
        }}
      />
      <MainStack.Screen
        name="MapDetail"
        component={MapDetailScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="MapGraphLoading"
        component={MapGraphLoadingScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="MapGraph"
        component={MapGraphScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="MapSettings"
        component={MapSettingsScreen}
        options={{
          headerShown: true,
          title: "맵 설정",
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      />
      <MainStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: true,
          title: "프로필 수정",
          headerBackTitle: "뒤로",
        }}
      />
    </MainStack.Navigator>
  );
};
