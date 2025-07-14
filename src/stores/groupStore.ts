import { create } from 'zustand';
// import firestore from '@react-native-firebase/firestore';
// import Toast from 'react-native-toast-message';
// import { navigate } from '../services/NavigationService';
// import {
//   listenToGroupData,
//   listenToUserGroupId,
//   disbandGroup as disbandGroupService,
// } from '../services/groupService';
// import handleFirestoreError from '../utils/firebaseErrorHandler';
import { Group } from '../types/groupTypes';
import { disbandGroup as disbandGroupService } from '../services/groupService';

// interface GroupStore {
//   currentGroupId: string | undefined;
//   currentGroup: Group | undefined;
//   userLeftManually: boolean;
//   notificationModal: boolean;
//   notificationMessage: string | null;
//   notificationId: string | null;

//   setGroupId: (id: string | undefined) => void;
//   setGroup: (group: Group | undefined) => void;
//   setUserLeftManually: (flag: boolean) => void;
//   resetGroup: () => void;
//   setNotificationModal: (value: boolean) => void;
//   setNotificationMessage: (msg: string | null) => void;
//   setNotificationId: (id: string | null) => void;
//   initGroupListeners: (uid: string, userData: any) => void;
//   disbandGroup: (uid: string) => Promise<void>;
//   closeNotificationModal: () => void;
// }

// export const useGroupStore = create<GroupStore>((set, get) => ({
//   currentGroupId: undefined,
//   currentGroup: undefined,
//   userLeftManually: false,
//   notificationModal: false,
//   notificationMessage: null,
//   notificationId: null,

//   setGroupId: (id) => set({ currentGroupId: id }),
//   setGroup: (group) => set({ currentGroup: group }),
//   setUserLeftManually: (flag) => set({ userLeftManually: flag }),
//   resetGroup: () => set({ currentGroup: undefined, currentGroupId: undefined }),
//   setNotificationModal: (value) => set({ notificationModal: value }),
//   setNotificationMessage: (msg) => set({ notificationMessage: msg }),
//   setNotificationId: (id) => set({ notificationId: id }),

// import { create } from 'zustand';
// import { Group } from '../types/Group';

interface GroupStore {
  currentGroupId: string | null;
  currentGroup: Group | null;
  userLeftManually: boolean;

  setGroup: (group: Group) => void;
  clearGroup: () => void;
  setUserLeftManually: (flag: boolean) => void;

  setGroupId: (id: string) => void;
  disbandGroup: (groupId: string, leaderUid: string) => Promise<void>;
}

export const useGroupStore = create<GroupStore>((set) => ({
  currentGroupId: null,
  currentGroup: null,
  userLeftManually: false,

  setGroup: (group) =>
    set({
      currentGroupId: group.id,
      currentGroup: group,
    }),

  clearGroup: () => set({ currentGroupId: null, currentGroup: null }),
  setUserLeftManually: (flag) => set({ userLeftManually: flag }),

  setGroupId: (id) => set({ currentGroupId: id }),

  disbandGroup: async (groupId, leaderUid) => {
    await disbandGroupService(groupId, leaderUid);
    set({ currentGroup: null, currentGroupId: null });
  },
}));




// initGroupListeners: (uid, userData) => {
//   const previousGroupId = { current: undefined as string | undefined };

// listenToUserGroupId(uid, (groupId) => {
//   if (!groupId && previousGroupId.current && !get().userLeftManually) {
//     Toast.show({ type: 'info', text1: 'You have been removed from the group.' });
//     navigate(userData.groups.length > 0 ? 'GroupApp' : 'PublicApp', {
//       screen: userData.groups.length > 0 ? 'SelectGroupScreen' : 'FindOrStart',
//     });
//   }
//   set({ currentGroupId: groupId, userLeftManually: false });
//   previousGroupId.current = groupId;
// });

// listenToGroupData(userData.selectedGroupId, (group) => {
//   set({ currentGroup: group });
// });
// },

//   initGroupDataListeners: (uid: string, userData: any) => {
//   const { setCurrentGroupId, setCurrentGroup } = get();

//   if (!uid) return;

//   // 1. Listen for group ID
//   const unsubGroupId = listenToUserGroupId(uid, (groupId) => {
//     setCurrentGroupId(groupId);
//   });

//   // 2. Listen for group data
//   let unsubGroupData: () => void;

//   const runGroupDataListener = (groupId: string) => {
//     unsubGroupData?.(); // Clean previous listener
//     unsubGroupData = listenToGroupData(groupId, (groupData) => {
//       setCurrentGroup(groupData);
//     });
//   };

//   const groupId = userData?.selectedGroupId || userData?.groups?.[0]?.groupId;
//   if (groupId) {
//     setCurrentGroupId(groupId);
//     runGroupDataListener(groupId);
//   }

//   return () => {
//     unsubGroupId?.();
//     unsubGroupData?.();
//   };
// };


// disbandGroup: async (uid) => {
//   const { currentGroupId, currentGroup } = get();
//   if (!uid || !currentGroupId || !currentGroup) return;

//   set({ userLeftManually: true });

//   try {
//     await disbandGroupService(currentGroup, uid);
//     const chatRef = firestore().collection('chats').doc(currentGroupId);
//     const messages = await chatRef.collection('messages').get();

//     const batch = firestore().batch();
//     messages.forEach(doc => batch.delete(doc.ref));
//     await batch.commit();
//     await chatRef.delete();

//     set({ currentGroupId: undefined, currentGroup: undefined });

//     const userRef = firestore().collection('users').doc(uid);
//     const userSnap = await userRef.get();
//     const groups = userSnap.data()?.groups || [];

//     navigate(groups.length > 0 ? 'GroupApp' : 'PublicApp', {
//       screen: groups.length > 0 ? 'SelectGroupScreen' : 'FindOrStart',
//     });

//   } catch (err) {
//     handleFirestoreError(err);
//   }
// },

// closeNotificationModal: () =>
//   set({
//     notificationModal: false,
//     notificationMessage: null,
//     notificationId: null,
//   }),
// }));
