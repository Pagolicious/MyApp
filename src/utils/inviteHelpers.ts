import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';
import handleFirestoreError from './firebaseErrorHandler';

//Types
import { Group, Applicant, Member } from '../types/groupTypes';
import { AuthUser } from '../types/userTypes';

// interface Group {
//   id: string;
//   activity: string;
//   location: string;
//   fromDate: string;
//   fromTime: string;
//   toTime: string;
//   createdBy: string;
//   memberLimit: number;
//   details: string;
//   applicants: Applicant[];
//   memberUids: string[];
// }

// interface Applicant {
//   uid: string;
//   firstName: string;
//   lastName?: string;
//   // skills: Skills[];
//   note?: string;
//   role?: "leader" | "member";
//   members?: Member[];
// }

// interface Member {
//   uid: string;
//   firstName: string;
//   lastName: string;
//   skillLevel?: string;
// }


export const inviteApplicant = async (
  currentUser: AuthUser,
  currentGroup: Group,
  currentGroupId: string,
  selectedApplicant: Applicant
) => {
  if (!currentUser) {
    Alert.alert("Error", "User is not authenticated. Please log in.");
    return;
  }

  try {
    if (!currentGroup || !currentGroupId) {
      Alert.alert('Error', 'Group not found. Please refresh the list or create a new group.');
      return;
    }

    const invitationId = firestore().collection('groupInvitations').doc().id;

    await firestore()
      .collection('groupInvitations')
      .doc(invitationId)
      .set({
        sender: currentUser.uid,
        receiver: selectedApplicant.uid,
        groupId: currentGroupId,
        activity: currentGroup?.activity || 'Unknown',
        location: currentGroup?.location || 'Unknown',
        fromDate: currentGroup?.fromDate || 'Unknown',
        fromTime: currentGroup?.fromTime || 'Unknown',
        toTime: currentGroup?.toTime || 'Unknown',
        status: 'pending',
        createdAt: firestore.FieldValue.serverTimestamp(),
        members: selectedApplicant.members || null
      });

    console.log('Invitation sent successfully.');
  } catch (error) {
    console.error('Error sending invitation:', error);
    Alert.alert('Error', 'Failed to send invitation.');
    handleFirestoreError(error);
  }
};
