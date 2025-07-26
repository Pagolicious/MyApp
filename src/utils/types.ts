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
import { LocationParam } from "../types/apiTypes";

export type MyGroupStackParamList = {
  SelectGroupScreen: undefined;
  GroupTopTabs: { groupId: string };

};

export type GroupTopTabsParamList = {
  MyGroupScreen: { groupId: string };
  MembersHomeScreen: { groupId: string };
};


// export type PublicTabParamList = {
//   Home: undefined;
//   'Find a Group': undefined;
//   Chats: undefined;
//   More: undefined;
// };

export type FriendStackParamList = {
  FriendScreen: undefined;
  FriendRequestScreen: undefined;
};

export type RootStackParamList = {
  SignUpScreen: undefined;
  LoginScreen: undefined;
  NamePage: undefined;
  DateOfBirthScreen: undefined;
  FindOrStart: undefined;
  FindGroup: {
    activity?: undefined;
    location?: LocationParam;
  };
  StartGroup: {
    isEdit?: boolean;
    location?: LocationParam;
    activity?: string;
    title?: string;
  };
  GroupsScreen: {
    activity: string;
    location: LocationParam;
    date?: string;
    time?: string;
    groupSize?: number;
    ignoreSkillInSearch?: boolean;
  };
  MyGroupScreen: undefined;
  GroupChatScreen: undefined;
  ProfileScreen: undefined;
  SelectGroupScreen: undefined;
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
  EditProfileScreen: undefined;
  LocationSearchScreen: {
    previousActivity?: string;
    previousTitle?: string;
    fromScreen: string;
  };
  PresenceDebugScreen: undefined;


  // 👇 These are nested navigators that take a screen + params
  TabNav: { screen: keyof MyGroupStackParamList; params?: any };
  // PublicApp: { screen: keyof PublicTabParamList; params?: any };
  Friends: { screen: keyof FriendStackParamList; params?: any };
};
