import firestore from '@react-native-firebase/firestore';
import { Group, Member } from '../types/groupTypes';
import { UserGroups } from '../types/userTypes';

export const fetchGroupById = async (groupId: string): Promise<Group | undefined> => {
  const doc = await firestore().collection('groups').doc(groupId).get();
  return doc.exists ? ({ id: doc.id, ...doc.data() } as Group) : undefined;
};

export const listenToUserGroupId = (
  userId: string,
  callback: (groupId: string | undefined) => void
) => {
  return firestore().collection('users').doc(userId).onSnapshot((doc) => {
    if (!doc || !doc.exists) {
      console.warn(`User ${userId} document does not exist`);
      return callback(undefined);
    }
    const userData = doc.data();
    const primaryGroupId = userData?.groups?.[0]?.groupId || undefined;
    callback(primaryGroupId);
  },
    error => {
      console.error(`Error listening to user ${userId}:`, error);
      callback(undefined);
    });
};

export const listenToGroupData = (
  groupId: string,
  callback: (group: Group | undefined) => void
) => {
  return firestore().collection('groups').doc(groupId).onSnapshot(
    (doc) => {
      if (!doc || doc.exists) {
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
  const userRef = firestore().collection('users').doc(leaderUid);
  const userSnap = await userRef.get();
  const userDoc = userSnap.data();
  const groupId = group.id;

  const updatedGroups = (userDoc?.groups || []).filter(
    (g: UserGroups) => g.groupId !== group.id
  );

  await userRef.update({
    groups: updatedGroups,
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
        groups: updatedGroups,
        selectedGroupId: firestore.FieldValue.delete()
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
