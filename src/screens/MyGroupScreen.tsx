import {
  StyleSheet,
  Text,
  View,
  Alert,
  Modal,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Pressable,
  SafeAreaView
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';

//Navigation
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/types';
import { navigate } from '../services/NavigationService';

//Components
import GroupNav from '../components/GroupNav';
import FooterGroupNav from '../components/FooterGroupNav';
import CustomSlider from '../components/CustomSlider';

//Firebase
import firestore from '@react-native-firebase/firestore';

//Context
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';
import { useModal } from '../context/ModalContext';

//Utils
import handleFirestoreError from '../utils/firebaseErrorHandler';
import { inviteApplicant } from '../utils/inviteHelpers';

//Icons
import Icon1 from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/Entypo';

type MyGroupScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'MyGroupScreen'
>;

interface Group {
  id: string;
  activity: string;
  location: string;
  fromDate: string;
  fromTime: string;
  toTime: string;
  createdBy: string;
  details: string;
  applicants: Applicant[];
  members: Member[];
}

interface Applicant {
  uid: string;
  firstName: string;
  lastName?: string;
  // skills: Skills[];
  note?: string;
  role?: "leader" | "member";
  members?: Member[];
}

interface Skills {
  sport: string;
  skillLevel: number
}

interface Member {
  uid: string;
  firstName: string;
  lastName: string;
  skillLevel?: string;
}

interface Invitation {
  id: string;
  groupId: string;
  sender: string;
  receiver: string;
  activity: string;
  location: string;
  fromDate: string;
  fromTime: string;
  toTime: string;
  status: 'pending' | 'accepted' | 'declined';
}

const MyGroupScreen = () => {
  const { currentUser, userData } = useAuth();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null,
  );
  const { currentGroupId, currentGroup } = useGroup();
  // const [isDelisted, setIsDelisted] = useState(false);

  // const { delistModalVisible, setDelistModalVisible } = useModal();

  // useEffect(() => {
  //   if (!currentUser) {
  //     console.log("No currentUser, skipping fetchApplicants.");
  //     setApplicants([]);
  //     return;
  //   }
  //   if (!currentGroup?.applicants?.length) {
  //     setApplicants([]); // Clear applicants if no data
  //     return;
  //   }

  //   const fetchApplicants = async () => {
  //     try {
  //       if (!currentGroup) return;
  //       if (currentGroup.applicants && currentGroup.applicants.length > 0) {
  //         const applicantsList = await Promise.all(
  //           currentGroup.applicants.map(async (applicant) => {
  //             try {
  //               const userDoc = await firestore()
  //                 .collection('users')
  //                 .doc(applicant.uid)
  //                 .get();

  //               if (!userDoc.exists) {
  //                 console.log(`Applicant ${applicant.uid} does not exist.`);
  //                 return null; // 🔹 Skip missing applicants
  //               }
  //               const userData = userDoc.data();

  //               const skill =
  //                 userData?.skills?.find(
  //                   (s: any) => s.sport.toLowerCase() === currentGroup.activity?.toLowerCase()
  //                 ) || {};

  //               return {
  //                 uid: applicant.uid,
  //                 firstName: userData?.firstName || 'Unknown',
  //                 lastName: userData?.lastName || 'Unknown',
  //                 skillLevel: skill.skillLevel || 'Unknown',
  //                 note: applicant.note || '',
  //               };
  //             } catch (error) {
  //               console.error(`Error fetching applicant ${applicant.uid}:`, error);
  //               return null; // 🔹 If there's an error fetching one applicant, don't crash everything
  //             }
  //           })
  //         );

  //         setApplicants(applicantsList);
  //       } else {
  //         setApplicants([]); // Clear the list if no applicants exist
  //       }
  //     } catch (error) {
  //       console.error('Error fetching applicant details:', error);
  //       Alert.alert('Error', 'Failed to fetch applicant details.');
  //       handleFirestoreError(error)

  //     }
  //   };

  //   fetchApplicants();
  // }, [currentUser, currentGroup]);

  useEffect(() => {
    if (!currentGroup?.applicants) {
      setApplicants([]); // Clear list if no applicants
      return;
    }

    setApplicants(currentGroup.applicants);
  }, [currentGroup]); // ✅ Runs only when `currentGroup` changes




  const handleCardPress = (item: Applicant) => {
    if (!userData?.isGroupLeader) {
      return;
    }
    setModalVisible(true);
    setSelectedApplicant(item);
  };

  // const inviteApplicant = async (selectedApplicant: Applicant | null) => {

  //   if (!currentUser) {
  //     console.log("User is not authenticated.");
  //     Alert.alert("Error", "User is not authenticated. Please log in.");
  //     return;
  //   }


  //   setModalVisible(false);
  //   if (!selectedApplicant) {
  //     Alert.alert('Error', 'No applicant selected');
  //     return;
  //   }

  //   try {

  //     if (!currentGroup) {
  //       Alert.alert('Error', 'Group not found. Please refresh the list or create a new group.');
  //       return;
  //     }

  //     try {
  //       // Generate a new ID for the invitation document
  //       const invitationId = firestore().collection('groupInvitations').doc().id;

  //       // Create the invitation document with a specific ID
  //       await firestore()
  //         .collection('groupInvitations')
  //         .doc(invitationId)
  //         .set({
  //           sender: currentUser.uid,
  //           receiver: selectedApplicant.uid,
  //           groupId: currentGroupId,
  //           activity: currentGroup?.activity || 'Unknown',
  //           location: currentGroup?.location || 'Unknown',
  //           fromDate: currentGroup?.fromDate || 'Unknown',
  //           fromTime: currentGroup?.fromTime || 'Unknown',
  //           toTime: currentGroup?.toTime || 'Unknown',
  //           status: 'pending', // Default status
  //           createdAt: firestore.FieldValue.serverTimestamp(),
  //           members: selectedApplicant.members || null
  //         });

  //       console.log('Invitation sent successfully.');
  //     } catch (error) {
  //       console.error('Error sending invitation:', error);
  //       Alert.alert('Error', 'Failed to send invitation.');
  //     }

  //   } catch (error) {
  //     console.error('Error saving user data: ', error);
  //     Alert.alert('Error', 'Could not apply for group');
  //     handleFirestoreError(error)

  //   }
  // };

  const handleInvite = (selectedApplicant: Applicant | null) => {
    if (!currentUser) {
      Alert.alert("Error", "User is not authenticated. Please log in.");
      return;
    }

    if (!currentGroup || !currentGroupId) {
      Alert.alert('Error', 'Group not found. Please refresh the list or create a new group.');
      return;
    }

    if (!selectedApplicant) {
      Alert.alert('Error', 'No applicant selected.');
      return;
    }
    setModalVisible(false);
    inviteApplicant(currentUser, currentGroup, currentGroupId, selectedApplicant);
    // console.log("DAWDWADAWDADWWDAWD", typeof currentGroupId, typeof currentGroup, typeof currentUser)
  };

  const declineApplicant = async (selectedApplicant: Applicant | null) => {
    setModalVisible(false);
    try {
      await firestore()
        .collection('groups')
        .doc(currentGroupId)
        .update({
          applicants: currentGroup?.applicants.filter((applicant) => applicant.uid !== selectedApplicant?.uid),
        });
    } catch {
      Alert.alert('Error', 'Something went wrong.');
    }
  }

  const handleDelistGroup = async () => {
    try {
      await firestore().collection('groups').doc(currentGroupId).update({
        applicants: [],
        isDelisted: true
      })
    } catch (error) {
      console.log("Coudn't remove applicants from the group", error)
    }

  }

  const handleActivateGroup = async () => {
    if (!currentGroup) return

    const currentMembers = currentGroup?.members ?? [];


    if (currentMembers.length < currentGroup?.memberLimit) {
      try {
        await firestore().collection('groups').doc(currentGroupId).update({
          isDelisted: false
        })
      } catch (error) {
        console.log("Coudn't remove applicants from the group", error)
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Cannot Activate Group 😕',
        text2: 'This group is full. Edit the group to increase the member limit.',
        visibilityTime: 4000,
      });
      console.log("22222")
    }


  }





  return (
    <View style={styles.container}>
      {/* <GroupNav /> */}

      {/* {currentUser && <GroupNav />} */}
      <ImageBackground
        source={require('../assets/BackgroundImages/whiteBackground.jpg')} // Path to your background image
        style={styles.backgroundImage} // Style for the background image

      >
        {currentGroup?.isDelisted && (
          <View style={styles.overlay} />
        )}
        <View style={styles.flatListContainer}>
          <FlatList
            data={applicants.filter((applicant) => applicant !== null)} // Prevents null errors
            keyExtractor={(item) => item.uid} // Unique key for each item
            renderItem={({ item }) => {
              if (!item || !item.uid) return null; // Skip invalid applicants

              if (item.role === "leader" && item.members?.length > 0) {
                // 🔥 Render party leader with stacked members
                return (
                  <View>
                    {/* Party Leader Card */}
                    <Pressable
                      onPress={() => handleCardPress(item)}
                      android_ripple={{ color: "rgba(0, 0, 0, 0.2)", borderless: false }}
                      style={styles.card}>
                      <View style={styles.column}>
                        <Text style={styles.cardText}>{item.firstName} (Leader)</Text>
                        <Text style={styles.cardText}>
                          {item.skillLevel ?? "N/A"}
                        </Text>
                        <View style={styles.cardStar}>
                          <Icon2 name="star" size={23} color="black" />
                        </View>
                      </View>
                      {/* Stacked Members Below */}
                      <View style={styles.memberContainer}>
                        {item.members.map((member: Member) => (
                          <View
                            key={member.uid}
                            style={styles.memberCard}>
                            <Text style={styles.cardText}>{member.firstName}</Text>
                          </View>
                        ))}
                      </View>
                    </Pressable>
                  </View>
                );
              }

              // 🔥 Render Individual Applicants
              return (
                <Pressable
                  onPress={() => handleCardPress(item)}
                  android_ripple={{ color: "rgba(0, 0, 0, 0.2)", borderless: false }}
                  style={styles.card}>
                  <View style={styles.column}>
                    <Text style={styles.cardText}>{item.firstName}</Text>
                    <View style={styles.column}>
                      <Text style={styles.cardText}>
                        {item.skillLevel ?? "N/A"}
                      </Text>
                      <View style={styles.cardStar}>
                        <Icon2 name="star" size={23} color="black" />
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.noApplicantsText}>No applicants available</Text>
            }
          />
        </View>

        {userData?.isGroupLeader && currentGroup?.isDelisted && (
          <View style={styles.activateGroupContainer}>
            <Text style={styles.activateGroupText}>
              This group is currently delisted.{"\n"}
              You've either chosen to pause it or it reached the member limit.{"\n\n"}
              If you're looking for more members, tap "Activate".{"\n"}
              Want to allow more people? Go to "Edit Group" and increase the member limit.
            </Text>

            <TouchableOpacity
              style={styles.activateGroupButton}
              onPress={() => handleActivateGroup()}
              activeOpacity={0.7} // Slight opacity on press
            >
              <Text style={styles.activateButtonText}>Activate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editDelistedGroupButton}
              onPress={() => navigate("StartGroup")}
              activeOpacity={0.7} // Slight opacity on press
            >
              <Text style={styles.activateButtonText}>Edit</Text>
              <Icon1 name="edit" size={25} color="white" />
            </TouchableOpacity>
          </View>

        )}

        {userData?.isGroupLeader && !currentGroup?.isDelisted && (
          <TouchableOpacity
            style={styles.editGroupButton}
            onPress={() => navigate("StartGroup")}
            activeOpacity={0.7} // Slight opacity on press
          >
            <Icon1 name="edit" size={40} color="white" />
          </TouchableOpacity>
        )}
        {userData?.isGroupLeader && !currentGroup?.isDelisted && (
          <TouchableOpacity
            style={styles.closeGroupButton}
            onPress={() => handleDelistGroup()}
            activeOpacity={0.7} // Slight opacity on press
          >
            <Icon1 name="close" size={40} color="white" />
          </TouchableOpacity>
        )}
        {/* {userData?.isGroupLeader && isDelisted && (
          <TouchableOpacity
            style={styles.closeTestGroupButton}
            onPress={() => setIsDelisted(false)}
            activeOpacity={0.7} // Slight opacity on press
          >
            <Icon1 name="close" size={40} color="white" />
          </TouchableOpacity>
        )} */}
        {/* {userData?.isGroupLeader && (
          <SafeAreaView style={styles.slider}>

            <CustomSlider
              onDelist={() => console.log('Group delisted ❌')}
              onReactivate={() => console.log('Group activated 🔍')}
            />
          </SafeAreaView>
        )} */}
        <Modal
          animationType="fade"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              {/* Close Button in top-right corner */}
              <TouchableOpacity
                style={styles.closeIcon}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.closeText}>✖</Text>
              </TouchableOpacity>

              {/* Modal Content */}
              <Text style={styles.modalTitleText}>Invite</Text>
              <Text style={styles.modalText}>
                Do you want to invite this person to your group?
              </Text>
              <View style={styles.modalNoteContainer}>
                <Text style={styles.modalNoteText}>
                  {selectedApplicant?.note}
                </Text>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.declineBtn}
                  onPress={async () => {
                    declineApplicant(selectedApplicant);
                  }}>
                  <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.inviteBtn}
                  onPress={async () => {
                    handleInvite(selectedApplicant);
                  }}>
                  <Text style={styles.inviteBtnText}>Invite</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ImageBackground>
      {/* <FooterGroupNav /> */}
    </View>
  );
};

export default MyGroupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover"
  },
  flatListContainer: {
    marginTop: 10
  },
  card: {
    backgroundColor: '#6A9AB0',
    padding: 20,
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 15,


    // Shadow for iOS
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow position
    shadowOpacity: 0.25, // Shadow transparency
    shadowRadius: 3.84, // Shadow blur radius

    // Shadow for Android
    elevation: 5, // Elevation for Android shadow
  },
  column: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  memberContainer: {
    marginTop: 15,
    // borderRadius: 20,
    borderWidth: 1
  },
  memberCard: {
    backgroundColor: '#6CB4EE',
    padding: 10,
    // marginHorizontal: 10,
    // width: "100%",
    // borderRadius: 15,
    // position: 'relative',
    // zIndex: -1,
    // borderBottomEndRadius: 15

    // opacity: 0.85, // Slightly faded to indicate stacking

    // // ✅ Add Shadow for iOS
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,

    // // ✅ Add Shadow for Android
    // elevation: 5,

  },
  cardText: {
    color: 'black',
    // fontWeight: "bold",
    fontSize: 20,
  },
  cardStar: {
    // borderWidth: 2
    marginLeft: 4
  },
  // line: {
  //   height: 1,
  //   width: '100%',
  //   backgroundColor: 'black',
  // },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: 350,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
  },
  closeIcon: {
    position: 'absolute',
    top: 5,
    right: 15,
    padding: 5,
  },
  closeText: {
    fontSize: 24,
    color: '#888',
  },
  modalTitleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  modalText: {
    marginTop: 20,
    fontSize: 18,
    // fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
  },
  modalNoteContainer: {
    width: 300,
    height: 120,
    borderRadius: 5,
    backgroundColor: '#F9F6EE',
    borderWidth: 1,
    borderColor: 'grey',
  },
  // input: {
  //   height: 120,
  //   width: 300,
  //   borderColor: 'gray',
  //   borderWidth: 1,
  //   padding: 10,
  //   borderRadius: 5,
  //   backgroundColor: 'white',
  //   fontSize: 16,
  // },
  modalNoteText: {
    padding: 10,
    color: 'black',
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    // paddingHorizontal: 30,
    width: '100%',
    marginTop: 5,
  },
  inviteBtn: {
    backgroundColor: 'green',
    padding: 10,
    width: 100,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 15,
  },
  inviteBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  declineBtn: {
    backgroundColor: 'red',
    padding: 10,
    width: 100,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 15,
  },
  declineBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noApplicantsText: {
    flex: 1,
    textAlign: "center",
    marginTop: 200,
    fontSize: 24
  },
  editGroupButton: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
    backgroundColor: "green",
    bottom: 20,
    right: 20,
    position: "absolute",
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,          // Adds shadow on Android
    shadowColor: '#000',   // Adds shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  closeGroupButton: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
    backgroundColor: '#C41E3A',
    bottom: 20,
    left: 20,
    position: "absolute",
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,          // Adds shadow on Android
    shadowColor: '#000',   // Adds shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  slider: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 20,
    left: 20,
    position: "absolute",
  },
  // closeTestGroupButton: {
  //   width: 60,
  //   height: 60,
  //   borderRadius: 60 / 2,
  //   backgroundColor: '#C41E3A',
  //   bottom: 20,
  //   left: 200,
  //   position: "absolute",
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   elevation: 10,          // Adds shadow on Android
  //   shadowColor: '#000',   // Adds shadow on iOS
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.3,
  //   shadowRadius: 3,
  // },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // darker overlay
    zIndex: 1, // put this below buttons
    pointerEvents: 'none', // ✅ allows clicks to pass through!
  },
  activateGroupContainer: {
    zIndex: 5, // 🔝 Make sure it's above the overlay's zIndex: 1
    position: 'absolute', // Important to make zIndex work properly
    top: '20%', // position it visually center-ish (adjust as needed)
    alignSelf: 'center',
    // justifyContent: 'center',
    // alignItems: 'center',
    padding: 20,
    paddingTop: 25,
    width: 330,
    height: 350,
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    elevation: 10, // shadow on Android
    shadowColor: '#000', // iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  activateGroupButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    alignSelf: 'center',
    backgroundColor: '#0f5e9c',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
    flexDirection: 'row', // 🔥 put text and icon side-by-side
    alignItems: 'center', // vertically align them
    justifyContent: 'center',
    gap: 10, // optional spacing between text and icon (React Native 0.71+)
  },
  editDelistedGroupButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignSelf: 'center',
    backgroundColor: 'green',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
    flexDirection: 'row', // 🔥 put text and icon side-by-side
    alignItems: 'center', // vertically align them
    justifyContent: 'center',
    gap: 10, // optional spacing between text and icon (React Native 0.71+)
  },

  activateButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  activateGroupText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 15,
    paddingHorizontal: 10,
    lineHeight: 22,
    fontWeight: '500',
  },






});
