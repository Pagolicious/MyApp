// import firestore from '@react-native-firebase/firestore';
import { Group, Member } from '../types/groupTypes';
import { UserGroups } from '../types/userTypes';
// import { useGroupStore } from '../stores/groupStore'
import { navigate } from '../services/NavigationService';
import { getDatabase } from '../firebase/getDatabase';

// services/groupService.ts

import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';

export const disbandGroup = async (groupId: string, leaderUid: string) => {
  const groupRef = firestore().collection('groups').doc(groupId);
  const groupSnap = await groupRef.get();
  const groupData = groupSnap.data();
  const three: string = '3';
  // console.log(three);
  if (!groupSnap.exists || !groupData) throw new Error("Group not found");

  const members = groupData.members || [];

  // const four: string = '4';
  // console.log(four);
  // Delete group

  // Notify & update each member
  await Promise.all(
    members.map(async (member: Member) => {
      const userDocRef = firestore().collection('users').doc(member.uid);
      const userDocSnap = await userDocRef.get();
      const userData = userDocSnap.data();

      const updatedGroups = (userData?.groups || []).filter(
        (g: UserGroups) => g.groupId !== groupData.id
      );
      // const five: string = '5';
      // console.log(five);
      const statusSnap = await getDatabase().ref(`status/${member.uid}`).once('value');
      const isOnline = statusSnap.val()?.online;

      // console.log(isOnline);

      // const message = groupData.activity === "Custom"
      //   ? `${groupData.title} at ${groupData.location} was disbanded by the leader.`
      //   : `${groupData.activity} group at ${groupData.location} was disbanded by the leader.`;

      if (!isOnline) {
        const six: string = '6';
        console.log(six);
        await firestore().collection('groupNotifications').add({
          userId: member.uid,
          type: "GROUP_DELETED",
          groupData: {
            activity: groupData.activity,
            title: groupData.title,
            location: groupData.location.name,
          },
          message: '',
          groupId,
          timestamp: firestore.FieldValue.serverTimestamp(),
          read: false,
        });
      }

      await firestore().collection("users").doc(member.uid).update({
        selectedGroupId: firestore.FieldValue.delete(),
        groups: updatedGroups
      });

    })
  );
  // const seven: string = '7';
  // console.log(seven);
  const chatRef = firestore().collection('chats').doc(groupId);
  const messages = await chatRef.collection('messages').get();

  if (!messages.empty) {
    const batch = firestore().batch();
    messages.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
  await chatRef.delete();

  await groupRef.delete();

};


// export const fetchGroupById = async (groupId: string): Promise<Group | undefined> => {
//   const doc = await firestore().collection('groups').doc(groupId).get();
//   return doc.exists ? ({ id: doc.id, ...doc.data() } as Group) : undefined;
// };

// export const listenToUserGroupId = (
//   userId: string,
//   callback: (groupId: string | undefined) => void
// ) => {
//   return firestore().collection('users').doc(userId).onSnapshot((doc) => {
//     if (!doc || !doc.exists) {
//       console.warn(`User ${userId} document does not exist`);
//       return callback(undefined);
//     }
//     const userData = doc.data();
//     const primaryGroupId = userData?.groups?.[0]?.groupId || undefined;
//     callback(primaryGroupId);
//   },
//     error => {
//       console.error(`Error listening to user ${userId}:`, error);
//       callback(undefined);
//     });
// };

// export const listenToGroupData = (
//   groupId: string,
//   callback: (group: Group | undefined) => void
// ) => {
//   return firestore().collection('groups').doc(groupId).onSnapshot(
//     (doc) => {
//       if (!doc || doc.exists) {
//         callback({ id: doc.id, ...doc.data() } as Group);
//       } else {
//         callback(undefined);
//       }
//     },
//     (error) => {
//       console.error('Error listening to group data:', error);
//     }
//   );
// };


// export const disbandGroup = async (group: Group, uid: string) => {
//   const groupDocRef = firestore().collection('groups').where('createdBy.uid', '==', uid);
//   const snapshot = await groupDocRef.get();

//   if (snapshot.empty) throw new Error('Group not found');

//   const groupDoc = snapshot.docs[0];
//   const groupData = groupDoc.data();
//   const groupId = groupDoc.id;
//   const memberUids = groupData.memberUids || [];

//   // Notify and update all members
//   const updates = memberUids.map(async (memberUid: string) => {

//     const userDocSnap = await firestore().collection('users').doc(memberUid).get();
//     const userDoc = userDocSnap.data();

//     await firestore().collection('users').doc(memberUid).update({
//       selectedGroupId: null,
//     });

//     const message = group.activity === "Custom"
//       ? `${group.title} at ${group.location} was disbanded by the leader.`
//       : `${group.activity} group at ${group.location} was disbanded by the leader.`;

//     await firestore().collection('groupNotifications').add({
//       userId: memberUid,
//       type: "GROUP_DELETED",
//       groupActivity: group.activity,
//       groupTitle: group.title,
//       groupLocation: group.location,
//       message: message,
//       groupId,
//       timestamp: firestore.FieldValue.serverTimestamp(),
//       read: false,
//     });

//     const updatedGroups = (userDoc?.groups || []).filter(
//       (g: UserGroups) => g.groupId !== group.id
//     );

//     await firestore().collection("users").doc(memberUid).update({
//       groups: updatedGroups,
//       selectedGroupId: firestore.FieldValue.delete()
//     });
//   });

//   await Promise.all(updates);

//   // Delete the group
//   await firestore().collection('groups').doc(groupId).delete();

//   const messagesSnapshot = await firestore()
//     .collection('chats')
//     .doc(groupId)
//     .collection('messages')
//     .get();

//   const deleteMessages = messagesSnapshot.docs.map((doc) => doc.ref.delete());
//   await Promise.all(deleteMessages);

//   // Reset local Zustand state
//   const { resetGroup } = useGroupStore.getState();
//   resetGroup();
// };
