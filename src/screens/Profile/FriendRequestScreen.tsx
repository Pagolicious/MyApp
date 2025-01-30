import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import LinearGradient from 'react-native-linear-gradient';

//Components
import FooterGroupNav from '../../components/FooterGroupNav';
import FooterNav from '../../components/FooterNav';
import FriendNav from '../../components/FriendNav';

//Contexts
import { useAuth } from '../../context/AuthContext';
import { useGroup } from '../../context/GroupContext';

//Services
import { navigate } from '../../services/NavigationService';

//Icons
import Icon1 from 'react-native-vector-icons/AntDesign';

const FriendRequestScreen = () => {
  const { currentUser } = useAuth()
  const { userInGroup, currentGroup } = useGroup()
  const [userHasGroup, setUserHasGroup] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUserHasGroup(currentGroup?.createdBy === currentUser.uid);
    }
  }, [currentUser, currentGroup]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate("ProfileScreen")}>
          <Icon1 name="arrowleft" size={25} color="black" />
        </TouchableOpacity>
        <View style={styles.spacer} />

        <Text style={styles.headerText}>Friend requests</Text>
        <View style={styles.spacer} />
      </View>
      <FriendNav />
      <View style={styles.background}>

      </View>
      {(userHasGroup || userInGroup) && <FooterGroupNav />}
      {(!userHasGroup && !userInGroup) && <FooterNav />}
    </View>
  )
}

export default FriendRequestScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 65,
    backgroundColor: '#5f4c4c',
    padding: 15,
    alignItems: 'center',
    flexDirection: "row"
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 20,

  },
  spacer: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: "white"
  }
})
