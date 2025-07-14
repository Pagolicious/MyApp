import firebase from '@react-native-firebase/app';
import '@react-native-firebase/database';

export const getDatabase = () =>
  firebase
    .app()
    .database('https://react-native-myapp-29737-default-rtdb.europe-west1.firebasedatabase.app');
