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

//Navigation
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
// import StarRating from 'react-native-star-rating-widget';

//Components
import GroupNav from '../components/GroupNav';
import FooterGroupNav from '../components/FooterGroupNav';

//Firebase
import firestore from '@react-native-firebase/firestore';

// Context
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

const MyGroupScreen = ({ route }: MyGroupScreenProps) => {
  const { currentUser, userData } = useAuth();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null,
  );
  const { currentGroupId, currentGroup } = useGroup();

  useEffect(() => {
    if (!currentUser || !currentGroup) {
      return;
    }

    // Fetch applicant details if `applicants` exist
    const fetchApplicants = async () => {
      try {
        if (currentGroup.applicants && currentGroup.applicants.length > 0) {
          const applicantsList = await Promise.all(
            currentGroup.applicants.map(async (applicant) => {
              const userDoc = await firestore()
                .collection('users')
                .doc(applicant.uid)
                .get();

              const userData = userDoc.data();

              return {
                uid: applicant.uid,
                firstName: userData?.firstName || 'Unknown',
                lastName: userData?.lastName || 'Unknown',
                skillLevel:
                  userData?.[`${currentGroup.activity?.toLowerCase()}_skillLevel`] || 'Unknown',
                note: applicant.note || '',
              };
            })
          );

          setApplicants(applicantsList);
        } else {
          setApplicants([]); // Clear the list if no applicants exist
        }
      } catch (error) {
        console.error('Error fetching applicant details:', error);
        Alert.alert('Error', 'Failed to fetch applicant details.');
      }
    };

    fetchApplicants();
  }, [currentUser, currentGroup]);


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
        ListEmptyComponent={
          <Text style={styles.noApplicantsText}>No applicants available</Text>
        }
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
      <View>
        <Text>
          {currentGroup?.activity}
          {userData?.firstName}
        </Text>
      </View>
      <FooterGroupNav />
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
  noApplicantsText: {
    flex: 1,
    textAlign: "center",
    marginTop: 100,
    fontSize: 24

  }
});
