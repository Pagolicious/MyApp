import firestore from '@react-native-firebase/firestore';
import { useGroupStore } from '../../stores/groupStore';
import { Group } from '../../types/groupTypes';
import Toast from 'react-native-toast-message';

//Services
import { navigate } from '../NavigationService';

//Contexts
// import { useAuth } from '../../context/AuthContext';

let unsubscribeFromGroup: (() => void) | null = null;

export const listenToGroup = (groupId: string, currentUserUid: string) => {
  // Stop existing listener
  if (unsubscribeFromGroup) {
    unsubscribeFromGroup();
  }

  const { setGroup, clearGroup, userLeftManually } = useGroupStore.getState();
  const groupRef = firestore().collection('groups').doc(groupId);


  unsubscribeFromGroup = groupRef.onSnapshot((snapshot) => {
    if (!snapshot.exists) {
      clearGroup();
      Toast.show({ type: 'info', text1: 'You have been removed or the group has been disbanded.' });

      // if (userData.groups.length > 0) {
      //   navigate('GroupApp', {
      //     screen: 'My Group',
      //     params: {
      //       screen: 'SelectGroupScreen'
      //     }
      //   });
      // } else {
      //   navigate('PublicApp', { screen: 'FindOrStart' })
      // }
      navigate('GroupApp', {
        screen: 'My Group',
        params: {
          screen: 'SelectGroupScreen'
        }
      })
    }
    const groupData = snapshot.data();


    if (!groupData) {
      console.warn('No group data received.');
      return;
    }

    const dataChange = !groupData.memberUids.includes(currentUserUid);

    if (!userLeftManually && dataChange) {
      clearGroup();
      Toast.show({
        type: 'info',
        text1: 'Group disbanded or you were removed.',
        text2: 'Redirecting to Select Group...',
      });

      setTimeout(() => navigate('GroupApp', {
        screen: 'My Group',
        params: {
          screen: 'SelectGroupScreen'
        }
      }), 2000);

      return;
    }

    // ✅ Validate only required fields
    const requiredFields = [
      'activity',
      'location',
      'fromDate',
      'fromTime',
      'toTime',
      'toDate',
      'createdBy',
      'memberLimit',
      'details',
      'isDelisted',
      'gender',
      'visibility',
      'minAge',
      'maxAge',
      'isFriendsOnly',
      'isAutoAccept',
      'isVerifiedOnly',
      'members',
      'memberUids',
      'applicants',
    ];

    const hasAllRequired = requiredFields.every((key) => key in groupData);

    if (hasAllRequired) {
      // ✅ TypeScript-safe cast
      setGroup({ id: groupId, ...groupData } as Group);
    } else {
      console.warn('Incomplete group data received:', groupData);
    }

  });


  return unsubscribeFromGroup;
};

export const stopListeningToGroup = () => {
  if (unsubscribeFromGroup) {
    unsubscribeFromGroup();
    unsubscribeFromGroup = null;
  }
};
