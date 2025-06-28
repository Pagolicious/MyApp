import { StyleSheet, View } from 'react-native';
import React from 'react';
import { verticalScale, moderateScale } from 'react-native-size-matters';

//Components
import ProfileButtons from '../components/ProfileButtons';

//Context
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const { currentUser, userData } = useAuth()

  return (
    <View style={styles.container}>
      <ProfileButtons />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    marginBottom: verticalScale(15),
  },
  profileNameText: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
  },
  profileEmailText: {
    fontSize: moderateScale(18),
    marginTop: verticalScale(5),
  },
  userInformation: {
    alignItems: 'center',
  },
});


export default ProfileScreen;
