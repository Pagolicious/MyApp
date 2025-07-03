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
  isPartyLeader: boolean;
  isPartyMember: boolean;
  isGroupLeader: boolean;
  isGroupMember: boolean;
  groupId: string;
  skills: Skills[];
  friends?: Friend[];
}

export interface AuthUser {
  uid: string
}
