import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

export type AuthStackParamList = {
  LoginScreen: undefined;
  RegisterScreen: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
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
  Auth: undefined;
  Main: {
    screen?: string;
  };
  MapGraphLoading: {
    mapId: number;
    mapPlayMemberId?: number;
    mapPlayMemberTitle?: string;
    mode?: 'preview' | 'play';
  };
  PlayManage: {
    play: MapPlayMember;
  };
  PlayMembers: {
    play: MapPlayMember;
  };
  PlayInvites: {
    play: MapPlayMember;
  };
  PlayTransferOwnership: {
    play: MapPlayMember;
  };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<RootStackParamList, T>,
    BottomTabScreenProps<MainTabParamList>
  >;
