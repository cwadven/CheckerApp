import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

export type AuthStackParamList = {
  LoginScreen: undefined;
  RegisterScreen: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  MySubscription: undefined;
  Profile: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<AuthStackParamList, T>,
    BottomTabScreenProps<MainTabParamList>
  >;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

export type RootStackParamList = {
  Main: undefined;
  MapList: { categoryId: number };
  MapDetail: { mapId: number };
  MapGraphLoading: { mapId: number };
  MapGraph: {
    mapId: number;
    graphData: {
      meta: MapGraphMeta;
      nodes: Node[];
      arrows: Arrow[];
      activeRules: ActiveRule[];
    };
  };
  NodeDetail: { nodeId: number };
  EditProfile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<RootStackParamList, T>,
    BottomTabScreenProps<MainTabParamList>
  >;
