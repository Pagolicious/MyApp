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


  GroupApp: { screen: keyof RootStackParamList } | undefined;
  PublicApp: undefined;
  Friends: undefined
};
