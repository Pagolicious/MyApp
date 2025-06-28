import { StyleSheet, Text, View, TouchableOpacity, Keyboard } from 'react-native';
import React, { useState, useEffect } from 'react';

//Navigation
import { RootStackParamList } from '../utils/types';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

//Icons
import Icon1 from 'react-native-vector-icons/FontAwesome5';
import Icon2 from 'react-native-vector-icons/FontAwesome6';
import Icon3 from 'react-native-vector-icons/AntDesign';

const FooterNav = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    // Listen for keyboard events
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    // Cleanup listeners on unmount
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const isActive = (screenName: string) => route.name === screenName;

  if (isKeyboardVisible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.footer}>
        <View style={styles.contentRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('FindOrStart')}
            style={styles.button}>
            <Icon1
              name="home"
              size={30}
              color={isActive('FindOrStart') ? '#00BFFF' : 'lightgray'}
            />
            <Text
              style={[
                styles.title,
                isActive('FindOrStart') ? { color: '#00BFFF' } : {},
              ]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('FindGroup')}
            style={styles.button}>
            <Icon2
              name="users-viewfinder"
              size={30}
              color={isActive('FindGroup') ? '#00BFFF' : 'lightgray'}
            />
            <Text
              style={[
                styles.title,
                isActive('FindGroup') ? { color: '#00BFFF' } : {},
              ]}>
              Find a group
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProfileScreen')}
            style={styles.button}>
            <Icon3
              name="profile"
              size={30}
              color={isActive('ProfileScreen') ? '#00BFFF' : 'lightgray'}
            />
            <Text
              style={[
                styles.title,
                isActive('ProfileScreen') ? { color: '#00BFFF' } : {},
              ]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default FooterNav;

const styles = StyleSheet.create({
  container: {

  },
  footer: {
    height: 75,
    width: '100%',
    backgroundColor: '#5f4c4c',
    justifyContent: 'center',

  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  button: {
    height: 75,
    width: 120,
    borderRadius: 5,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    color: 'lightgrey',
    fontWeight: 'bold',
  },
});
