import {
  StyleSheet,
  Text,
  View,
  Alert,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import functions from '@react-native-firebase/functions';

//Navigation
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
// import StarRating from 'react-native-star-rating-widget';

//Components
import GroupNav from '../components/GroupNav';
import FooterNav from '../components/FooterNav';

//Firebase
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// AuthContext
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';

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

type Applicant = {
  uid: string;
  firstName: string;
  lastName: string;
  skillLevel: string | number;
  note?: string;
};

interface Member {
  uid: string;
  firstName: string;
  lastName: string;
  skillLevel: string;
}

const MyGroupScreen = ({ route }: MyGroupScreenProps) => {
  const { currentUser } = useAuth();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null,
  );
  const [currentGroupData, setCurrentGroupData] = useState<Group | null>(null);
  const { currentGroupId } = useGroup(); // Access the current group ID

  useEffect(() => {
    if (!currentUser) {
      return;
    } // Make sure the current user is defined

    const unsubscribe = firestore()
      .collection('groups')
      .where('createdBy', '==', currentUser.uid)
      .onSnapshot(
        async groupsSnapshot => {
          const applicantsPromises = groupsSnapshot.docs.flatMap(async doc => {
            const groupData = {
              id: doc.id,
              ...doc.data(),
            } as Group;

            setCurrentGroupData(groupData);

            const groupActivity = groupData.activity.toLowerCase();

            const applicantsList = (groupData.applicants || []).map(
              async (applicant: { uid: string; note?: string }) => {
                // Fetch first name based on uid
                const userDoc = await firestore()
                  .collection('users')
                  .doc(applicant.uid)
                  .get();
                const userData = userDoc.data();
                const skillLevel =
                  userData?.[`${groupActivity}_skillLevel`] || 'Unknown';

                return {
                  uid: applicant.uid,
                  firstName: userData?.firstName || 'Unknown',
                  lastName: userData?.lastName || 'Unknown',
                  note: applicant.note || '',
                  skillLevel: skillLevel,
                };
              },
            );

            return Promise.all(applicantsList);
          });

          const resolvedApplicants = await Promise.all(applicantsPromises);
          setApplicants(resolvedApplicants.flat()); // Flatten the array
        },
        error => {
          const errorMessage =
            (error as { message?: string }).message ||
            'An unknown error occurred';
          Alert.alert(errorMessage);
        },
      );

    // Clean up the listener when the component unmounts
    return () => unsubscribe();

    // Set up a real-time listener
  }, [currentUser]);

  const handleCardPress = (item: Applicant) => {
    setModalVisible(true);
    setSelectedApplicant(item);
  };

  const inviteToGroup = async (selectedApplicant: Applicant | null) => {

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
      const groupRef = firestore().collection('groups').doc(currentGroupId);
      const groupDoc = await groupRef.get();
      const idToken = await auth().currentUser?.getIdToken(true); // Force refresh the token

      if (!groupDoc.exists) {
        Alert.alert('Error', 'Group not found. Please refresh the list or create a new group.');
        return;
      }
      const memberToAdd = {
        uid: selectedApplicant.uid,
        firstName: selectedApplicant.firstName,
        lastName: selectedApplicant.lastName,
        skillLevel: selectedApplicant.skillLevel,
      };

      // Fetch user's device token
      const userRef = firestore()
        .collection('users')
        .doc(selectedApplicant.uid);
      const userDoc = await userRef.get();
      const userToken = userDoc.data()?.fcmToken;

      if (!userToken) {
        throw new Error('Device token not found');
      }

      // Send notification to the user
      const sendInvitation = functions().httpsCallable('sendGroupInvitation');

      await sendInvitation({
        fcmToken: userToken,
        title: 'Group Invitation',
        body: `You have been invited to join the group ${currentGroupData?.activity}`,
        data: {
          type: 'groupInvitation', // Specify the type for the handler
          groupId: currentGroupData?.id,
          groupName: currentGroupData?.activity,
          invitedBy: currentUser.uid, // or however you get the inviter's name
        },

      });

      // Update group with the new member
      await groupRef.update({
        members: firestore.FieldValue.arrayUnion(memberToAdd),
      });

      if (currentGroupData && currentGroupData.applicants) {
        const applicantToRemove = currentGroupData.applicants.find(
          applicant => applicant.uid === selectedApplicant.uid,
        );
        if (applicantToRemove) {
          // Remove the applicant from the applicants list
          await groupRef.update({
            applicants: firestore.FieldValue.arrayRemove(applicantToRemove),
          });
        }
      }
    } catch (error) {
      console.error('Error saving user data: ', error);
      Alert.alert('Error', 'Could not apply for group');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Group</Text>
      </View>
      <GroupNav route={route} />
      <FlatList
        data={applicants}
        keyExtractor={item => item.uid} // Unique key for each item
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity onPress={() => handleCardPress(item)}>
              <View style={styles.card}>
                <View style={styles.column}>
                  <Text style={styles.cardText}>{item.firstName}</Text>
                  <Text style={styles.cardText}>
                    Skill Level: {item.skillLevel}
                  </Text>
                  {/* <Text style={styles.cardText}>{item.note}</Text> */}
                </View>
              </View>
              <View style={styles.line} />
            </TouchableOpacity>
          </View>
        )}
      />
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
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={async () => {
                inviteToGroup(selectedApplicant);
              }}>
              <Text style={styles.submitBtnText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FooterNav />
    </View>
  );
};

export default MyGroupScreen;

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
  card: {
    backgroundColor: '#6A9AB0',
    padding: 15,
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
  line: {
    height: 1,
    width: '100%',
    backgroundColor: 'black',
  },
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
  input: {
    height: 120,
    width: 300,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    fontSize: 16,
  },
  modalNoteText: {
    padding: 10,
    color: 'black',
  },
  submitBtn: {
    backgroundColor: 'green',
    padding: 10,
    width: 100,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 15,
  },
  submitBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
