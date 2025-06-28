import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

//Context
import { useAuth } from '../context/AuthContext';

//Services
import { navigate } from '../services/NavigationService';

//Icons
import Icon1 from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon3 from 'react-native-vector-icons/FontAwesome5';
import Icon4 from 'react-native-vector-icons/Ionicons';
import Icon5 from 'react-native-vector-icons/AntDesign';


const ProfileButtons = () => {
  const { signOut, currentUser } = useAuth()

  const logout = async () => {
    try {
      await signOut()
      navigate("LoginScreen")

    } catch (error) {
      const errorMessage =
        (error as { message?: string }).message || 'An unknown error occurred';
      Alert.alert(errorMessage);
    }
  }

  return (
    <View style={styles.container}>
      {currentUser && (
        <View style={styles.content}>
          <View style={styles.topSection}>

            <TouchableOpacity onPress={() => navigate('ProfilePageScreen', { userId: currentUser.uid })}>
              <View style={[styles.btnBorder, styles.row]}>
                <Icon5 name="profile" size={30} color="black" />
                <Text style={styles.profileBtnText}>Profile</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigate("Friends")}>
              <View style={[styles.btnBorder, styles.row]}>
                <Icon3 name="user-friends" size={30} color="black" />
                <Text style={styles.profileBtnText}>Friends</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigate("SearchPartyScreen")}>
              <View style={[styles.btnBorderSmall, styles.row]}>
                <Icon1 name="person-search" size={35} color="black" />
                <Text style={styles.profileBtnText}>Search Party</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigate("SettingScreen")}>
              <View style={[styles.btnBorder, styles.row]}>
                <Icon1 name="settings" size={30} color="black" />
                <Text style={styles.profileBtnText}>Settings</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigate("AboutAppScreen")}>
              <View style={[styles.btnBorder, styles.row]}>
                <Icon1 name="perm-device-information" size={30} color="black" />
                <Text style={styles.profileBtnText}>About App</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.bottomSection}>
            <TouchableOpacity onPress={logout}>
              <View style={[styles.btnBorder, styles.row]}>
                <Icon2 name="logout" size={30} color="black" />
                <Text style={styles.profileSignOutText}>Logout</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}

export default ProfileButtons

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    marginVertical: verticalScale(20),
  },
  topSection: {
  },
  bottomSection: {
  },
  btnBorder: {
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(15),
  },
  btnBorderSmall: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(15),
  },
  profileBtnText: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: 'black',
    marginLeft: scale(10),
  },
  profileSignOutText: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#C41E3A',
    marginLeft: scale(10),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
