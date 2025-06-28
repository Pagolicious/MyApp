import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../utils/types';

interface RemoteMessageData {
  type: string;
  groupId: string;
  groupName: string;
  invitedBy: string;
}

class FirebaseMessagingService {
  static async setupMessagingHandlers(navigation: NavigationProp<RootStackParamList>) {
    messaging().onMessage(async remoteMessage => {
      if (remoteMessage && remoteMessage.data) {
        const data = remoteMessage.data as Partial<RemoteMessageData>;

        if (data.type && data.groupId && data.groupName && data.invitedBy) {
          FirebaseMessagingService.handleGroupInvitation(data as RemoteMessageData, navigation);
        }
      }
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });

    const authStatus = await messaging().requestPermission();
    console.log('Authorization status:', authStatus);
  }

  static handleGroupInvitation(data: RemoteMessageData, navigation: NavigationProp<any>) {
    Alert.alert(
      "Group Invitation",
      `You've been invited to join ${data.groupName} by ${data.invitedBy}`,
      [
        { text: "View", onPress: () => navigation.navigate('MyGroupScreen') }
      ]
    );
  }
}

export default FirebaseMessagingService;
