import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';


export interface Friend {
  uid: string;
  firstName: string;
  lastName: string;
  isOnline?: boolean;
  labels?: string[];
}

export interface Skills {
  sport: string;
  skillLevel: number;
}

export interface User {
  uid: string;
  firstName: string;
  lastName: string;
  DateOfBirth: FirebaseFirestoreTypes.Timestamp;
  email: string;
  createdAt: string;
  fcmToken?: string;
  isPartyLeader: boolean; // Probably need to be removed after
  isPartyMember: boolean; // Probably need to be removed after
  // isGroupLeader: boolean;
  // isGroupMember: boolean;
  selectedGroupId: string;   // Need to be removed after
  groups: UserGroups[];
  skills: Skills[];
  friends?: Friend[];
}

export interface UserGroups {
  groupId: string;
  role: 'leader' | 'member';
  joinedAt: string;
  status?: 'active' | 'invited' | 'banned'; // Could be usefull (later)

}

export interface AuthUser {
  uid: string
}
