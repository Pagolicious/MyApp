import { StyleSheet, Text, View, Alert, Modal, TouchableOpacity, FlatList, Button, Animated, Easing } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'

//Navigation
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from '../App'
import StarRating from 'react-native-star-rating-widget';

//Components
import GroupNav from '../components/GroupNav'
import FooterNav from '../components/FooterNav'
//Firebase
import firestore from '@react-native-firebase/firestore'

// AuthContext
import { useAuth } from '../context/AuthContext'
import { TextInput } from 'react-native-gesture-handler';


type MyGroupScreenProps = NativeStackScreenProps<RootStackParamList, 'MyGroupScreen'>

type Applicant = {
  uid: string;
  firstName: string;
  skillLevel: string | number;
  note?: string;
};

const MyGroupScreen = ({ route }: MyGroupScreenProps) => {

  const { currentUser } = useAuth()
  const [applicants, setApplicants] = useState<any[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedApplicants, setSelectedApplicants] = useState<Applicant | null>(null);

  const fetchApplicants = async () => {
    if (!currentUser) return; // Make sure the current user is defined
    try {
      const groupsSnapshot = await firestore()
        .collection('groups')
        .where('createdBy', '==', currentUser.uid)
        .get();

      const applicantsPromises = groupsSnapshot.docs.flatMap(async (doc) => {
        const groupData = doc.data()
        const groupActivity = groupData.activity.toLowerCase()

        const applicantsList = (groupData.applicants || []).map(async (applicant: { uid: string; note?: string }) => {
          // Fetch first name based on uid
          const userDoc = await firestore().collection('users').doc(applicant.uid).get()
          const userData = userDoc.data();
          const skillLevel = userData?.[`${groupActivity}_skill_level`] || 'Unknown';

          return {
            uid: applicant.uid,
            firstName: userData?.first_name || 'Unknown',
            note: applicant.note || '',
            skillLevel: skillLevel,
          }
        })

        return Promise.all(applicantsList);
      });

      // Wait for all promises to resolve
      const resolvedApplicants = await Promise.all(applicantsPromises);
      setApplicants(resolvedApplicants.flat()); // Flatten the array

    } catch (error) {
      const errorMessage = (error as { message?: string }).message || "An unknown error occurred";
      Alert.alert(errorMessage);
    }
  }

  useEffect(() => {
    fetchApplicants()
  }, [])

  const handleCardPress = (item: Applicant) => {
    setModalVisible(true)
    setSelectedApplicants(item)
  }


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Group</Text>
      </View>
      <GroupNav route={route} />
      <FlatList
        data={applicants}
        keyExtractor={(item) => item.uid} // Unique key for each item
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity onPress={() => handleCardPress(item)}>

              <View style={styles.card}>
                <View style={styles.column}>
                  <Text style={styles.cardText}>{item.firstName}</Text>
                  <Text style={styles.cardText}>Skill Level: {item.skillLevel}</Text>
                  {/* <Text style={styles.cardText}>{item.note}</Text> */}

                </View>
              </View>
              <View style={styles.line}></View>
            </TouchableOpacity>
          </View>
        )}

      />
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            {/* Close Button in top-right corner */}
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>✖</Text>
            </TouchableOpacity>

            {/* Modal Content */}
            <Text style={styles.modalTitleText}>Invite</Text>
            <Text style={styles.modalText}>Do you want to invite this person to your group?</Text>
            <View style={styles.modalNoteContainer}>
              <Text style={styles.modalNoteText}>{selectedApplicants?.note}</Text>
            </View>
          </View>
        </View>

      </Modal>


      <FooterNav />

    </View>
  )
}

export default MyGroupScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 150,
    backgroundColor: "#EAD8B1",
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black"
  },
  card: {
    backgroundColor: "#6A9AB0",
    padding: 15
  },
  column: {
    flexDirection: 'row',
    justifyContent: "space-between",

  },
  cardText: {
    color: "black",
    // fontWeight: "bold",
    fontSize: 20
  },
  line: {
    height: 1,
    width: "100%",
    backgroundColor: "black"
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
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
    fontWeight: "bold",
    color: "black"

  },
  modalText: {
    marginTop: 20,
    fontSize: 18,
    // fontWeight: 'bold',
    color: "black",
    marginBottom: 20,
  },
  modalNoteContainer: {
    width: 300,
    height: 120,
    borderRadius: 5,
    backgroundColor: "#F9F6EE",
    borderWidth: 1,
    borderColor: "grey"
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
    color: "black"
  },
})
