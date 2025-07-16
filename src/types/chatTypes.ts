import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type ParticipantDetails = {
  [uid: string]: {
    firstName: string;
    lastName: string;
  };
};

export type ChatItem = {
  id: string;
  isGroup: boolean;
  activity?: string;
  title?: string;
  chatName?: string;
  groupId?: string;
  participants: string[];
  participantsDetails: ParticipantDetails;
  lastMessage?: {
    text: string;
    createdAt: any; // or use FirebaseFirestoreTypes.Timestamp
  };
};

export interface MessageData {
  id: string;
  text: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  readBy?: { [uid: string]: boolean };
}


export type ChatParameter = {
  chatId: string;
  participantsDetails: ParticipantDetails;
}

export type GroupChatParameter = {
  chatId: string;
  groupId: string;
  participantsDetails: ParticipantDetails;
  activity?: string;
  title?: string;
  chatName?: string;
}
