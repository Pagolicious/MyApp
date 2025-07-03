import firestore from '@react-native-firebase/firestore';
import { GroupInvitation, FriendRequest, PartyInvitation } from '../types/invitationTypes';

export const listenToGroupInvitations = (userId: string, onUpdate: (inv: GroupInvitation | null) => void) => {
  return firestore()
    .collection('groupInvitations')
    .where('receiver', '==', userId)
    .where('status', '==', 'pending')
    .onSnapshot(snapshot => {
      if (!snapshot) return;
      if (!snapshot.empty) {
        const doc = snapshot.docs[0]; // Assumes one active invitation per user
        const data = doc.data() as Omit<GroupInvitation, 'id'>;
        onUpdate({ id: doc.id, ...data });
      } else {
        onUpdate(null);
      }
    }, error => {
      console.error('Error listening to groupInvitations:', error);
    });
};

export const listenToFriendRequests = (userId: string, onUpdate: (list: FriendRequest[]) => void) => {
  return firestore()
    .collection('friendRequests')
    .where('receiver', '==', userId)
    .where('status', '==', 'pending')
    .onSnapshot(snapshot => {
      if (!snapshot || snapshot.empty) return;

      const requests: FriendRequest[] = snapshot.docs.map(doc => doc.data() as FriendRequest);
      onUpdate(requests);
    }, error => {
      console.error('Error listening to friendRequests:', error);
    });
};

export const listenToPartyInvitations = (userId: string, onNew: (invite: PartyInvitation) => void) => {
  return firestore()
    .collection('searchPartyInvitation')
    .where('receiver', '==', userId)
    .where('status', '==', 'pending')
    .onSnapshot(snapshot => {
      if (!snapshot || snapshot.empty) return;

      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const invite = { id: change.doc.id, ...change.doc.data() } as PartyInvitation;
          onNew(invite);
        }
      });
    }, error => {
      console.error('Error listening to searchPartyInvitation:', error);
    });
};

export const updateGroupInvitationStatus = async (id: string, status: 'accepted' | 'declined') => {
  await firestore().collection('groupInvitations').doc(id).update({ status });
};

export const updatePartyInvitationStatus = async (id: string, status: 'accepted' | 'declined') => {
  await firestore().collection('searchPartyInvitation').doc(id).update({ status });
};
