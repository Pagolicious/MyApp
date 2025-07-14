import { useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { AppState } from 'react-native';
import { collection, doc } from '@react-native-firebase/firestore';


export const useOnlineStatus = () => {
  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    const userDoc = firestore().collection('users').doc(user.uid);

    const setOnline = () =>
      userDoc.set({ isOnline: true }, { merge: true });

    const setOffline = () =>
      userDoc.set({ isOnline: false }, { merge: true });

    setOnline(); // when hook runs

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        setOffline();
      } else if (nextAppState === 'active') {
        setOnline();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      setOffline(); // when unmounted
      subscription.remove();
    };
  }, []);
};

export default useOnlineStatus;
