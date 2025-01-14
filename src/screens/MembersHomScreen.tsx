import React, { useEffect, useState, useCallback, } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, } from 'react-native';
import firestore from '@react-native-firebase/firestore';


//Navigation
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

//Components
import GroupMemberNav from '../components/GroupMemberNav';
import FooterGroupNav from '../components/FooterGroupNav';
import CustomAvatar from '../components/CustomAvatar';

//Context
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';

//Hooks
import { useGroupData } from '../hooks/useGroupData';

//Icons
import Icon1 from 'react-native-vector-icons/MaterialIcons';

type MembersHomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'MembersHomeScreen'
>;

interface Member {
  uid: string;
  firstName: string;
  lastName: string;
  skillLevel: string;
}

const MembersHomeScreen = ({ route }: MembersHomeScreenProps) => {
  const { members, owner } = useGroupData();
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(true); // Loading state for data container
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh

  // Simulate data loading
  useEffect(() => {
    if (owner && members.length > 0) {
      setLoading(false); // Stop loading when both owner and members are available
    } else {
      setLoading(true); // Keep loading if either owner or members is missing
    }
  }, [owner, members]);

  // Refresh logic for the data container
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setLoading(true);
    setTimeout(() => {
      setRefreshing(false);
      setLoading(false); // Reset loading after refresh
    }, 1000); // Simulate a refresh delay
  }, []);

  const addFriend = () => {

  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Members Home Page</Text>
      </View>
      {currentUser && <GroupMemberNav route={route} />}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <>
          {/* <Text style={styles.textTitle}>Leader</Text> */}

          <View style={styles.ownerContainer}>
            <View style={styles.row}>
              <CustomAvatar
                uid={owner?.uid || 'default-uid'}
                firstName={owner?.firstName || 'Unknown'}
                size={60}
              />
              <Text style={styles.nameText}>{owner?.firstName || 'Unknown'}</Text>
            </View>

            <View style={styles.addFriendContainer}>
              <TouchableOpacity style={styles.addFriendBtn} onPress={() => addFriend()}>
                <Icon1 name="person-add" size={20} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          {/* <Text style={styles.textTitle}>Members</Text> */}
          <FlatList
            data={members}
            keyExtractor={(item) => item.uid}
            renderItem={({ item }) => (
              <View style={styles.memberContainer}>
                <View style={styles.row}>
                  <CustomAvatar
                    uid={item.uid || 'default-uid'}
                    firstName={item.firstName || 'Unknown'}
                    size={60}
                  />
                  <Text style={styles.nameText}>{item.firstName}</Text>
                </View>
                <View style={styles.addFriendContainer}>
                  <TouchableOpacity style={styles.addFriendBtn} onPress={() => addFriend()}>
                    <Icon1 name="person-add" size={20} color="black" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </>
      )}

      <FooterGroupNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 150,
    backgroundColor: '#EAD8B1',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberContainer: {
    justifyContent: 'space-between',
    alignItems: "center",
    borderBottomWidth: 1,
    padding: 10,
    flexDirection: "row",

  },
  ownerContainer: {
    justifyContent: 'space-between',
    alignItems: "center",
    borderBottomWidth: 10,
    borderColor: "grey",
    padding: 10,
    flexDirection: "row",
  },
  row: {
    flexDirection: "row",
    alignItems: 'center',
    // borderWidth: 1,

  },
  nameText: {
    fontSize: 30,
    textAlign: "center",
    marginLeft: 15,
    // borderWidth: 1,
  },
  // textTitle: {
  //   fontSize: 30,
  //   textAlign: "center",
  //   borderWidth: 1,

  // },
  addFriendContainer: {
    // borderWidth: 1
  },
  addFriendBtn: {
    backgroundColor: '#4CBB17',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  }

});

export default MembersHomeScreen;
