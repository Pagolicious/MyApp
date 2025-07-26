import React, { useEffect, useState } from 'react';
import { View, } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import inAppMessaging from '@react-native-firebase/in-app-messaging';
import Toast from 'react-native-toast-message';
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';


//Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import PublicTabNavigator from './navigation/PublicTabNavigator';
import GroupTabNavigator from './navigation/TabNavigator';
import RootStackNavigator from './navigation/RootStackNavigator';

//Components
import { useAuth } from './context/AuthContext';
import GroupNotificationModal from './components/GroupNotificationModal';

//Contexts
import { AuthProvider } from './context/AuthContext';
// import { GroupProvider } from './context/GroupContext';
import { InvitationProvider } from './context/InvitationContext';
// import { ModalProvider } from './context/ModalContext';

//Services
import { navigationRef } from './services/NavigationService';

//Hooks
import useOnlineStatus from './hooks/useOnlineStatus';

function App(): React.JSX.Element {
  // const [initialState, setInitialState] = useState();
  // const [isReady, setIsReady] = useState(false);

  // useEffect(() => {
  //   const restoreNavState = async () => {
  //     try {
  //       const savedState = await AsyncStorage.getItem('NAVIGATION_STATE');
  //       if (savedState) {
  //         setInitialState(JSON.parse(savedState));
  //       }
  //     } catch (e) {
  //       console.warn('Failed to restore navigation state', e);
  //     } finally {
  //       setIsReady(true);
  //     }
  //   };

  //   restoreNavState();
  // }, []);

  // if (!isReady) {
  //   return <View style={{ flex: 1, backgroundColor: 'white' }} />;
  // }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <OnlineStatusWrapper />
        {/* <GroupProvider> */}
        <InvitationProvider>
          {/* <ModalProvider> */}
          <GroupNotificationModal />

          <NavigationContainer
            ref={navigationRef}
          // initialState={initialState}
          // onStateChange={(state) =>
          //   AsyncStorage.setItem('NAVIGATION_STATE', JSON.stringify(state))
          // }
          >


            <RootStackNavigator />
            {/* <AppNavigator /> */}
          </NavigationContainer>
          <Toast position="top" topOffset={50} />
          {/* </ModalProvider> */}
        </InvitationProvider>
        {/* </GroupProvider> */}
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const OnlineStatusWrapper = () => {
  useOnlineStatus();
  return null; // No UI needed, just runs the hook
};

export default App;
