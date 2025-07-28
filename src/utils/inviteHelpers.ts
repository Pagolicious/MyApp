import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';

//Utils
import handleFirestoreError from './firebaseErrorHandler';

//Types
import { Group, Applicant } from '../types/groupTypes';
import { AuthUser, User } from '../types/userTypes';

export const inviteApplicant = async (
  senderUid: string,
  currentGroup: Group,
  currentGroupId: string,
  selectedApplicant: Applicant
) => {
  // if (!currentUser) {
  //   Alert.alert("Error", "User is not authenticated. Please log in.");
  //   return;
  // }

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
        sender: senderUid,
        receiver: selectedApplicant.uid,
        groupId: currentGroupId,
        activity: currentGroup?.activity || 'Unknown',
        title: currentGroup?.title || '',
        locationName: currentGroup?.location.name || 'Unknown',
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
