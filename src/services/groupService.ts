import firestore from '@react-native-firebase/firestore';
import { Group, Member } from '../types/groupTypes';

export const fetchGroupById = async (groupId: string): Promise<Group | undefined> => {
  const doc = await firestore().collection('groups').doc(groupId).get();
  return doc.exists ? ({ id: doc.id, ...doc.data() } as Group) : undefined;
};

export const listenToUserGroupId = (
  userId: string,
  callback: (groupId: string | undefined) => void
) => {
  return firestore().collection('users').doc(userId).onSnapshot((doc) => {
    const userData = doc.data();
    callback(userData?.groupId || undefined);
  });
};

export const listenToGroupData = (
  groupId: string,
  callback: (group: Group | undefined) => void
) => {
  return firestore().collection('groups').doc(groupId).onSnapshot(
    (doc) => {
      if (doc.exists) {
        callback({ id: doc.id, ...doc.data() } as Group);
      } else {
        callback(undefined);
      }
    },
    (error) => {
      console.error('Error listening to group data:', error);
    }
  );
};

export const disbandGroup = async (group: Group, leaderUid: string): Promise<void> => {
  const groupId = group.id;

  await firestore().collection("users").doc(leaderUid).update({
    isGroupLeader: false,
    groupId: ""
  });

  const message = group.activity === "Custom"
    ? `${group.title} at ${group.location} was disbanded by the leader.`
    : `${group.activity} group at ${group.location} was disbanded by the leader.`;

  await Promise.all(
    group.members.map(async (member: Member) => {
      await firestore().collection("groupNotifications").add({
        userId: member.uid,
        type: "GROUP_DELETED",
        groupActivity: group.activity,
        groupTitle: group.title,
        groupLocation: group.location,
        message: message,
        groupId,
        timestamp: firestore.FieldValue.serverTimestamp(),
        read: false,
      });

      await firestore().collection("users").doc(member.uid).update({
        isGroupMember: false,
        groupId: ""
      });
    })
  );

  await firestore().collection('groups').doc(groupId).delete();

  const messagesSnapshot = await firestore()
    .collection('chats')
    .doc(groupId)
    .collection('messages')
    .get();

  const deleteMessages = messagesSnapshot.docs.map((doc) => doc.ref.delete());
  await Promise.all(deleteMessages);
};
