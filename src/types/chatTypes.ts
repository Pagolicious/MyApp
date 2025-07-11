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
