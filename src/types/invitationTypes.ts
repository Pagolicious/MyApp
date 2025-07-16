import { Member } from './groupTypes';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface GroupInvitation {
  id: string;
  groupId: string;
  sender: string;
  receiver: string;
  activity: string;
  location: string;
  fromDate: string;
  fromTime: string;
  toTime: string;
  members: Member[];
  status: 'pending' | 'accepted' | 'declined';
}

export interface FriendRequest {
  sender: string;
  receiver: string;
  firstName: string;
  lastName: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface PartyInvitation {
  id: string;
  sender: string;
  receiver: string;
  firstName: string;
  lastName: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface GroupNotification {
  id: string;
  type: string;
  userId: string;
  groupId: string;
  read: boolean;
  groupData: {
    activity: string;
    location: string;
    title?: string;
  };
  message: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}
