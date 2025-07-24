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
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: FirebaseFirestoreTypes.Timestamp;
  gender: 'male' | 'female' | 'other' | undefined;
  createdAt: string;
  fcmToken?: string;
  isPartyLeader: boolean; // Probably need to be removed after
  isPartyMember: boolean; // Probably need to be removed after
  isDisplayFullName: boolean;
  isDisplayAge: boolean;
  city: string;
  bio: string;
  languages: string;
  // selectedGroupId: string;   // Need to be removed after
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
