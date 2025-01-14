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
import LoginScreen from '../screens/LoginScreen';

//Context
import { useGroup } from '../context/GroupContext';

//Hooks
import { useGroupData } from '../hooks/useGroupData';

const ProfileButtons = () => {
  const { signOut, currentUser } = useAuth()
  const { setCurrentGroup, currentGroup } = useGroup()
  const { userInGroup } = useGroupData()

  const logout = async () => {
    try {
      if (currentGroup) {
        await AsyncStorage.setItem('currentGroup', JSON.stringify(currentGroup));
      }
      if (userInGroup) {
        await AsyncStorage.setItem('userInGroup', JSON.stringify(userInGroup));
      }

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
      <TouchableOpacity onPress={() => navigate("MembersHomeScreen")}>
        <View style={[styles.btnBorder, styles.row]}>
          <Icon3 name="user-friends" size={30} color="black" />
          <Text style={styles.profileBtnText}>Friends</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigate("MembersHomeScreen")}>
        <View style={[styles.btnBorder, styles.row]}>
          <Icon3 name="envelope" size={30} color="black" />
          <Text style={styles.profileBtnText}>Messages</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigate("MembersHomeScreen")}>
        <View style={[styles.btnBorder, styles.row]}>
          <Icon1 name="settings" size={30} color="black" />
          <Text style={styles.profileBtnText}>Settings</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigate("MembersHomeScreen")}>
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
    flex: 1,
    justifyContent: "flex-start",
  },
  btnBorder: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
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
