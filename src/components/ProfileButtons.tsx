import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';

//Context
import { useAuth } from '../context/AuthContext';

//Services
import { navigate } from '../services/NavigationService';

//Icons
import Icon1 from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon3 from 'react-native-vector-icons/FontAwesome5';

//Context
import { useGroup } from '../context/GroupContext';

//Hooks
import { useGroupData } from '../hooks/useGroupData';

const ProfileButtons = () => {
  const { signOut } = useAuth()
  const { clearGroupData } = useGroup()
  // const { userInGroup } = useGroupData()

  const logout = async () => {
    try {
      // console.log("////////////", currentGroup)
      // console.log("///////////", userInGroup)

      // if (currentGroup) {
      //   await AsyncStorage.setItem('currentGroup', JSON.stringify(currentGroup));
      // }
      // await checkUserInGroup();
      // await clearGroupData();

      // setCurrentGroup(undefined);
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
      <TouchableOpacity onPress={() => navigate("FriendScreen")}>
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
      <TouchableOpacity onPress={() => navigate("MessageScreen")}>
        <View style={[styles.btnBorder, styles.row]}>
          <Icon3 name="envelope" size={30} color="black" />
          <Text style={styles.profileBtnText}>Messages</Text>
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
      <TouchableOpacity onPress={logout}>
        <View style={[styles.btnBorder, styles.row]}>
          <Icon2 name="logout" size={30} color="black" />
          <Text style={styles.profileSignOutText}>Logout</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default ProfileButtons

const styles = StyleSheet.create({

  container: {
    // flex: 1,
    // justifyContent: "flex-start",
    marginBottom: 15
  },
  btnBorder: {
    // flexDirection: "row",
    // alignItems: "center",
    // marginBottom: 10,
    // borderWidth: 2,
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  btnBorderSmall: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    // borderWidth: 2,
  },
  profileBtnText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    marginLeft: 10,
  },
  profileSignOutText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#C41E3A",
    marginLeft: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
})
