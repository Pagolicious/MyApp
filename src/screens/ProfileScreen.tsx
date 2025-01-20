import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';

//Components
import GroupMemberNav from '../components/GroupMemberNav';
import FooterGroupNav from '../components/FooterGroupNav';
import CustomAvatar from '../components/CustomAvatar';
import MembersHomeScreen from './MembersHomScreen';
import ProfileButtons from '../components/ProfileButtons';
import FooterNav from '../components/FooterNav';

//Context
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';

//Hooks
import { useGroupData } from '../hooks/useGroupData';

const ProfileScreen = () => {
  const { currentUser, userData } = useAuth()
  const { owner } = useGroupData()
  const { userInGroup } = useGroup()

  return (
    <View style={styles.container}>

      <View style={styles.topSection}>
        <View style={styles.avatar}>
          <CustomAvatar
            uid={currentUser?.uid || 'default-uid'}
            firstName={userData?.firstName || 'Unknown'}
            size={200}
          />
        </View>
        <View style={styles.userInformation}>
          <Text style={styles.profileNameText}>{userData?.firstName} {userData?.lastName}</Text>
          <Text style={styles.profileEmailText}>{userData?.email}</Text>
        </View>
      </View>
      <ProfileButtons />
      {(owner?.uid === currentUser?.uid || userInGroup) && <FooterGroupNav />}
      {(owner?.uid !== currentUser?.uid && !userInGroup) && <FooterNav />}
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    marginBottom: 15,
  },
  profileNameText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  profileEmailText: {
    fontSize: 18,
    marginTop: 5,
  },
  userInformation: {
    alignItems: "center",
  },

});
