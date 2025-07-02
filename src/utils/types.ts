// import { Friend } from "../types/userTypes";

// export type RootStackParamList = {
//   SignUpScreen: undefined;
//   LoginScreen: undefined;
//   NamePage: undefined;
//   FindOrStart: undefined;
//   FindGroup: undefined;
//   StartGroup: undefined;
//   GroupsScreen: {
//     activity: string;
//     date?: string;
//     time?: string;
//     groupSize?: number;
//   };
//   MyGroupScreen: undefined;
//   GroupChatScreen: undefined;
//   ProfileScreen: undefined;
//   MembersHomeScreen: undefined;
//   FriendScreen: undefined;
//   SearchPartyScreen: undefined;
//   ChatListScreen: undefined;
//   ChatRoomScreen: undefined;
//   SettingScreen: undefined;
//   AboutAppScreen: undefined;
//   RequestScreen: undefined;
//   FriendRequestScreen: undefined;
//   ProfilePageScreen: { userId: string };
//   LabelScreen: { friend: Friend };



//   GroupApp: { screen: keyof RootStackParamList } | undefined;
//   PublicApp: undefined;
//   Friends: undefined
// };

import { Friend } from "../types/userTypes";

export type GroupTabParamList = {
  MyGroupScreen: undefined;
  MembersHomeScreen: undefined;
};

export type PublicTabParamList = {
  Home: undefined;
  'Find a Group': undefined;
  Chats: undefined;
  More: undefined;
};

export type FriendStackParamList = {
  FriendScreen: undefined;
  FriendRequestScreen: undefined;
};

export type RootStackParamList = {
  SignUpScreen: undefined;
  LoginScreen: undefined;
  NamePage: undefined;
  FindOrStart: undefined;
  FindGroup: undefined;
  StartGroup: undefined;
  GroupsScreen: {
    activity: string;
    date?: string;
    time?: string;
    groupSize?: number;
    ignoreSkillInSearch?: boolean;
  };
  MyGroupScreen: undefined;
  GroupChatScreen: undefined;
  ProfileScreen: undefined;
  MembersHomeScreen: undefined;
  FriendScreen: undefined;
  SearchPartyScreen: undefined;
  ChatListScreen: undefined;
  ChatRoomScreen: undefined;
  SettingScreen: undefined;
  AboutAppScreen: undefined;
  RequestScreen: undefined;
  FriendRequestScreen: undefined;
  ProfilePageScreen: { userId: string };
  LabelScreen: { friend: Friend };

  // 👇 These are nested navigators that take a screen + params
  GroupApp: { screen: keyof GroupTabParamList; params?: any };
  PublicApp: { screen: keyof PublicTabParamList; params?: any };
  Friends: { screen: keyof FriendStackParamList; params?: any };
};
