import {
  StyleSheet,
  Text,
  View,
  Alert,
  Modal,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Pressable
} from 'react-native';
import React, { useState, useEffect } from 'react';

//Navigation
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
// import StarRating from 'react-native-star-rating-widget';

//Components
import GroupNav from '../components/GroupNav';
import FooterGroupNav from '../components/FooterGroupNav';

//Firebase
import firestore from '@react-native-firebase/firestore';

//Context
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';
import { useModal } from '../context/ModalContext';

//Utils
import handleFirestoreError from '../utils/firebaseErrorHandler';

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
  lastName: string;
  skills: Skills[];
  note?: string;
};

interface Skills {
  sport: string;
  skillLevel: number
}

interface Member {
  uid: string;
  firstName: string;
  lastName: string;
  skillLevel: string;
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
  // const { delistModalVisible, setDelistModalVisible } = useModal();

  useEffect(() => {
    if (!currentUser) {
      console.log("No currentUser, skipping fetchApplicants.");
      setApplicants([]);
      return;
    }
    if (!currentGroup?.applicants?.length) {
      setApplicants([]); // Clear applicants if no data
      return;
    }

    const fetchApplicants = async () => {
      try {
        if (!currentGroup) return;
        if (currentGroup.applicants && currentGroup.applicants.length > 0) {
          const applicantsList = await Promise.all(
            currentGroup.applicants.map(async (applicant) => {
              try {
                const userDoc = await firestore()
                  .collection('users')
                  .doc(applicant.uid)
                  .get();

                if (!userDoc.exists) {
                  console.log(`Applicant ${applicant.uid} does not exist.`);
                  return null; // 🔹 Skip missing applicants
                }
                const userData = userDoc.data();

                const skill =
                  userData?.skills?.find(
                    (s: any) => s.sport.toLowerCase() === currentGroup.activity?.toLowerCase()
                  ) || {};

                return {
                  uid: applicant.uid,
                  firstName: userData?.firstName || 'Unknown',
                  lastName: userData?.lastName || 'Unknown',
                  skillLevel: skill.skillLevel || 'Unknown',
                  note: applicant.note || '',
                };
              } catch (error) {
                console.error(`Error fetching applicant ${applicant.uid}:`, error);
                return null; // 🔹 If there's an error fetching one applicant, don't crash everything
              }
            })
          );

          setApplicants(applicantsList);
        } else {
          setApplicants([]); // Clear the list if no applicants exist
        }
      } catch (error) {
        console.error('Error fetching applicant details:', error);
        Alert.alert('Error', 'Failed to fetch applicant details.');
        handleFirestoreError(error)

      }
    };

    fetchApplicants();
  }, [currentUser, currentGroup]);


  const handleCardPress = (item: Applicant) => {
    // if (userInGroup) {
    //   return;
    // }
    setModalVisible(true);
    setSelectedApplicant(item);
  };

  const inviteApplicant = async (selectedApplicant: Applicant | null) => {

    if (!currentUser) {
      console.log("User is not authenticated.");
      Alert.alert("Error", "User is not authenticated. Please log in.");
      return;
    }


    setModalVisible(false);
    if (!selectedApplicant) {
      Alert.alert('Error', 'No applicant selected');
      return;
    }

    try {

      if (!currentGroup) {
        Alert.alert('Error', 'Group not found. Please refresh the list or create a new group.');
        return;
      }

      try {
        // Generate a new ID for the invitation document
        const invitationId = firestore().collection('groupInvitations').doc().id;

        // Create the invitation document with a specific ID
        await firestore()
          .collection('groupInvitations')
          .doc(invitationId)
          .set({
            sender: currentUser.uid,
            receiver: selectedApplicant.uid,
            groupId: currentGroupId,
            activity: currentGroup?.activity || 'Unknown',
            location: currentGroup?.location || 'Unknown',
            fromDate: currentGroup?.fromDate || 'Unknown',
            fromTime: currentGroup?.fromTime || 'Unknown',
            toTime: currentGroup?.toTime || 'Unknown',
            status: 'pending', // Default status
            createdAt: firestore.FieldValue.serverTimestamp(),
          });

        console.log('Invitation sent successfully.');
      } catch (error) {
        console.error('Error sending invitation:', error);
        Alert.alert('Error', 'Failed to send invitation.');
      }

    } catch (error) {
      console.error('Error saving user data: ', error);
      Alert.alert('Error', 'Could not apply for group');
      handleFirestoreError(error)

    }
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



  return (
    <View style={styles.container}>

      {currentUser && <GroupNav />}
      <ImageBackground
        source={require('../assets/BackgroundImages/whiteBackground.jpg')} // Path to your background image
        style={styles.backgroundImage} // Style for the background image
      >
        <View style={styles.flatListContainer}>

          <FlatList
            data={applicants.filter((applicant) => applicant !== null)} // Prevents null errors
            keyExtractor={item => item.uid} // Unique key for each item
            renderItem={({ item }) => {
              if (!item || !item.uid) return null; // Skip invalid applicants

              return (
                // <View>
                <Pressable onPress={() => handleCardPress(item)}
                  android_ripple={{ color: "rgba(0, 0, 0, 0.2)", borderless: false }}
                  style={styles.card}>
                  {/* <View > */}
                  <View style={styles.column}>
                    <Text style={styles.cardText}>{item.firstName}</Text>
                    <Text style={styles.cardText}>
                      Skill Level: {item.skillLevel ?? "N/A"}
                    </Text>
                    {/* <Text style={styles.cardText}>{item.note}</Text> */}
                  </View>
                  {/* </View> */}
                  {/* <View style={styles.line} /> */}
                </Pressable>
                // </View>
              )
            }}
            ListEmptyComponent={
              <Text style={styles.noApplicantsText}>No applicants available</Text>
            }
          />
        </View>

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
                    inviteApplicant(selectedApplicant);
                  }}>
                  <Text style={styles.inviteBtnText}>Invite</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ImageBackground>
      <FooterGroupNav />
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
  cardText: {
    color: 'black',
    // fontWeight: "bold",
    fontSize: 20,
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
  }
});
