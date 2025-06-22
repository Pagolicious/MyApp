import { StyleSheet, Text, View, TouchableOpacity, FlatList, Modal, TouchableWithoutFeedback, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'

//Navigation
import { useNavigation } from '@react-navigation/native';

//Firebase
import firestore from '@react-native-firebase/firestore';

//Components
import FooterGroupNav from '../../components/FooterGroupNav';
import FooterNav from '../../components/FooterNav';
import FriendNav from '../../components/FriendNav';
import CustomAvatar from '../../components/CustomAvatar';
import DisbandModal from '../../components/DisbandModal';
import LeaveModal from '../../components/LeaveModal';

//Contexts
import { useAuth } from '../../context/AuthContext';
import { useGroup } from '../../context/GroupContext';

//Hooks
import useOnlineStatus from '../../hooks/useOnlineStatus';

//Services
import { navigate } from '../../services/NavigationService';

//Icons
import Icon1 from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/Feather';

interface SearchParty {
  leaderUid: string;
  leaderFirstName: string;
  leaderLastName: string;
  members: Member[];
}

interface Member {
  uid: string;
  firstName: string;
  lastName: string;
}

const SearchPartyScreen = () => {
  const { currentUser, userData } = useAuth();
  const [userParty, setUserParty] = useState<SearchParty | null>(null);
  const [moreModalVisible, setMoreModalVisible] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedLeader, setSelectedLeader] = useState<SearchParty | null>(null);
  const navigation = useNavigation();


  useEffect(() => {
    if (!currentUser) return;

    const fetchUserParty = async () => {
      try {
        const snapshot = await firestore().collection("searchParties").get();

        let foundParty: SearchParty | null = null;
        snapshot.forEach((doc) => {
          const data = doc.data();
          const members: Member[] = data.members || [];

          // Check if user is either the leader or a member
          if (data.leaderUid === currentUser.uid || members.some((m) => m.uid === currentUser.uid)) {
            foundParty = {
              leaderUid: data.leaderUid,
              leaderFirstName: data.leaderFirstName,
              leaderLastName: data.leaderLastName,
              members,
            };
          }
        });

        setUserParty(foundParty);
      } catch (error) {
        console.error("Error fetching user search party:", error);
      }
    };

    fetchUserParty();
  }, [currentUser]);

  const handleRemoveMember = async (member: Member) => {

  }

  // const handleGoBackButton = () => {
  //   if (!userData) return;

  //   if (userData.isGroupLeader || userData.isGroupMember) {
  //     navigate('GroupApp', { screen: 'More' })
  //   } else {
  //     navigate('PublicApp', { screen: 'More' })
  //   }
  // }

  const handleGoBackButton = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => handleGoBackButton()}>
          <Icon1 name="arrowleft" size={25} color="white" />
        </TouchableOpacity>
        <View style={styles.spacer} />
        <Text style={styles.headerText}>Search Party</Text>
        <View style={styles.spacer} />

      </View>
      {/* Display the User's Party */}
      {/* <View style={styles.partyCard}> */}
      {userParty &&
        <View style={styles.partyLeaderContainer}>
          <View style={styles.row}>
            <CustomAvatar
              uid={userParty?.leaderUid || 'default-uid'}
              firstName={userParty?.leaderFirstName || 'Unknown'}
              size={60}
            />

            <Text style={styles.nameText}>{userParty?.leaderFirstName}</Text>
          </View>
          <TouchableOpacity onPress={() => {
            setMoreModalVisible(true)
            setSelectedLeader(userParty)
          }}>
            {currentUser && currentUser.uid !== userParty?.leaderUid ? (
              <Icon2 name="more-vertical" size={25} color="black" />
            ) : (
              <DisbandModal userParty={userParty} />
            )}
          </TouchableOpacity>
        </View>
      }

      {/* <Text style={styles.memberHeader}>Members:</Text> */}
      <FlatList
        data={userParty?.members}
        keyExtractor={(member) => member.uid}
        renderItem={({ item }) => {
          if (!item || !item.uid) return null;

          return (
            <View style={styles.partyContainer}>
              <View style={styles.row}>
                <CustomAvatar
                  uid={item.uid || 'default-uid'}
                  firstName={item.firstName || 'Unknown'}
                  size={60}
                />
                <Text style={styles.nameText}>{item.firstName}</Text>
              </View>
              {/* <Text style={{ color: item.isOnline ? 'green' : 'gray' }}>
              {item.isOnline ? '🟢 Online' : '⚪ Offline'}
            </Text> */}
              <TouchableOpacity onPress={() => {
                setMoreModalVisible(true)
                setSelectedMember(item)
              }}>
                {currentUser && currentUser.uid !== item.uid ? (
                  <Icon2 name="more-vertical" size={25} color="black" />
                ) : (
                  <LeaveModal userParty={userParty} />
                )}

              </TouchableOpacity>
            </View>
          )
        }}
        ListEmptyComponent={
          <Text style={styles.noPartyText}>You are not in a search party</Text>
        }
      />
      {currentUser && (
        <Modal
          animationType="fade"
          transparent
          visible={moreModalVisible}
          onRequestClose={() => setMoreModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setMoreModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalView}>
                {/* <Pressable
                        style={styles.buttonMid}
                        onPress={() => {
                          setMoreModalVisible(false)
                          if (selectedMember) {
                            handleInviteToSeacrhParty(selectedMember)
                          }
                        }}
                        android_ripple={{ color: "rgba(0, 0, 0, 0.2)", borderless: false }}>
                        <Text style={styles.buttonText}>Invite to search party</Text>
                      </Pressable> */}
                <Pressable
                  style={styles.buttonMid}
                  onPress={() => setMoreModalVisible(false)}
                  android_ripple={{ color: "rgba(0, 0, 0, 0.2)", borderless: false }}>
                  <Text style={styles.buttonText}>Add Friend</Text>
                </Pressable>
                {currentUser.uid === userParty?.leaderUid && (
                  <Pressable
                    style={styles.buttonBottom}
                    onPress={() => {
                      setMoreModalVisible(false)
                      if (selectedMember) {
                        handleRemoveMember(selectedMember);
                      }
                    }}
                    android_ripple={{ color: "rgba(0, 0, 0, 0.2)", borderless: false }}>
                    <Text style={styles.buttonRedText}>Remove member</Text>
                  </Pressable>
                )}

              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

      )}
    </View>
    // </View >

  )
}

export default SearchPartyScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    height: 65,
    backgroundColor: "#5f4c4c",
    padding: 15,
    alignItems: "center",
    flexDirection: "row",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginRight: 20,
  },
  spacer: {
    flex: 1,
  },
  partyLeaderContainer: {
    justifyContent: 'space-between',
    alignItems: "center",
    borderBottomWidth: 10,
    borderColor: "grey",
    padding: 10,
    flexDirection: "row",
  },
  partyContainer: {
    justifyContent: 'space-between',
    alignItems: "center",
    borderBottomWidth: 1,
    padding: 10,
    flexDirection: "row",
  },
  row: {
    flexDirection: "row",
    alignItems: 'center',
  },
  nameText: {
    fontSize: 30,
    textAlign: "center",
    marginLeft: 15,
  },
  noPartyText: {
    flex: 1,
    textAlign: "center",
    marginTop: 200,
    fontSize: 24
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: 300,
    // padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',

  },
  buttonTop: {
    height: 50,
    width: "100%",
    borderStartStartRadius: 10,
    borderEndStartRadius: 10,
    justifyContent: 'center',
    // backgroundColor: "#6200ea",


  },
  buttonMid: {
    height: 50,
    width: "100%",
    justifyContent: 'center',

  },
  buttonBottom: {
    height: 50,
    width: "100%",
    borderEndEndRadius: 10,
    borderStartEndRadius: 10,
    justifyContent: 'center',

  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16
  },
  buttonRedText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
    color: "#C41E3A",
  },
  leaveButton: {
    width: 110,
    height: 50,
    backgroundColor: "#C41E3A",
    // alignItems: "center",
    justifyContent: "center",
    borderRadius: 10
  },
  leaveText: {
    fontSize: 15,
    color: "white",
    fontWeight: "bold",
    textAlign: "center"

  }
})
