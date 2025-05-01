import { Member } from './groupTypes';

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
