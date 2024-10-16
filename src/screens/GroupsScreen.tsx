import { StyleSheet, Text, View, Alert, Modal, TouchableOpacity, FlatList, Button, Animated, Easing } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'

//Navigation
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from '../App'
import StarRating from 'react-native-star-rating-widget';

//Components
import FooterNav from '../components/FooterNav'

//Firebase
import firestore from '@react-native-firebase/firestore'

// AuthContext
import { useAuth } from '../context/AuthContext'

type GroupsProps = NativeStackScreenProps<RootStackParamList, 'GroupsScreen'>

interface Group {
  id: string;
  activity: string;
  location: string;
  fromDate: string;
  fromTime: string;
  toTime: string;
  createdBy: string;
}


const GroupsScreen = ({ route }: GroupsProps) => {

  const { currentUser } = useAuth()

  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userHasGroup, setUserHasGroup] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [skillLevel, setSkillLevel] = useState(0)
  const [hasSkillLevel, setHasSkillLevel] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState('')
  // const [selectedCardId, setSelectedCardId] = useState<string | null>(null); // New state for selected card ID


  const animationValue = useRef(new Animated.Value(0)).current // Initialize animated value


  if (!currentUser) return // Ensure currentUser is defined

  const fetchGroups = async () => {
    try {
      const groupCollection = await firestore().collection('groups').get()
      const groupList = groupCollection.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setGroups(groupList)

      const userGroup = await firestore()
        .collection('groups')
        .where('createdBy', '==', currentUser.uid)
        .get()

      setUserHasGroup(!userGroup.empty) // If the query returns results, set to true

    } catch (error) {
      const errorMessage = (error as { message?: string }).message || "An unknown error occurred"
      Alert.alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const addSkillLevel = async () => {
    if (!currentUser || !selectedActivity) return; // Ensure currentUser and selectedActivity are defined

    const skillLevelKey = `${selectedActivity.toLowerCase()}_skill_level`;
    try {
      await firestore()
        .collection("users")
        .doc(currentUser.uid)
        .update({
          [skillLevelKey]: skillLevel
        })
      setModalVisible(false)
      setHasSkillLevel(true); // Set hasSkillLevel to true after saving
    }
    catch (error) {
      console.error("Error saving user data: ", error)
      Alert.alert('Error', 'Could not save user data')
    }
  }

  const checkUserSkillLevel = async (activity: string) => {
    if (!currentUser) return;

    const skillLevelKey = `${activity.toLowerCase()}_skill_level`;

    try {
      const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
      const userData = userDoc.data();

      if (userData && userData[skillLevelKey] !== undefined) {
        setSkillLevel(userData[skillLevelKey]);
        setHasSkillLevel(true); // User already has a skill level for this activity
      } else {
        setSkillLevel(0);
        setHasSkillLevel(false); // User does not have a skill level yet
      }
    } catch (error) {
      console.error("Error fetching user skill level: ", error);
      Alert.alert('Error', 'Could not fetch user skill level');
    }
  };

  useEffect(() => {
    if (skillLevel > 0) {
      Animated.timing(animationValue, {
        toValue: 1, // Fully expanded
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animationValue, {
        toValue: 0, // Collapsed
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  }, [skillLevel]);

  // Interpolate animated value for opacity and height
  const animatedStyle = {
    opacity: animationValue,
    height: animationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 100], // Adjust height as needed
    }),
  };

  const handleCardPress = async (item: Group) => {
    await checkUserSkillLevel(item.activity);
    if (!hasSkillLevel) {
      setModalVisible(true);
      setSelectedActivity(item.activity);
    }
  };


  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading groups...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Groups</Text>
      </View>
      {/* Modal Component */}
      {currentUser.uid && !hasSkillLevel && (
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
              <Text style={styles.modalTitleText}>Skill level</Text>
              <Text style={styles.modalText}>Before you move on we need to know your skill level on this sport</Text>
              <StarRating
                rating={skillLevel}
                onChange={setSkillLevel}
                enableHalfStar={false}
              />
              <Animated.View style={[styles.modalExtendedContent, animatedStyle]}>
                <Text style={styles.modalObervationText}>You can NOT change your skill level later</Text>
                <TouchableOpacity
                  style={styles.addSkillLevelButton}
                  onPress={async () => {
                    addSkillLevel;
                  }}

                >
                  <Text style={styles.addSkillLevelText}>Submit</Text>
                </TouchableOpacity>
              </Animated.View>

            </View>
          </View>
        </Modal>
      )}
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            {/* Card */}
            {/* <TouchableOpacity onPress={async () => {
              await checkUserSkillLevel(item.activity);
              if (!hasSkillLevel) {
                setModalVisible(true);
                setSelectedActivity(item.activity);
              }

            }}> */}
            <TouchableOpacity onPress={() => handleCardPress(item)}>

              <View style={[
                styles.card,
                item.createdBy === currentUser.uid && { backgroundColor: 'lightblue' },
                // selectedCardId === item.id && styles.extendedCard
              ]} >
                <View style={styles.column}>
                  {/* Card Content: Activity & Location */}
                  <View style={styles.cardContentActivity}>
                    <Text style={styles.cardText}>{item.activity}</Text>
                    <Text style={styles.cardText}>{item.location}</Text>
                  </View>

                  {/* Card Content: Date & Time */}
                  <View style={styles.cardContentDate}>
                    <Text style={styles.cardText}>{item.fromDate}</Text>
                    <Text style={styles.cardText}>{item.fromTime} - {item.toTime}</Text>
                  </View>

                  {/* Card Content: People */}
                  <View style={styles.cardContentPeople}>
                    <Text style={styles.cardTextPeople}>+2</Text>
                  </View>
                </View>
              </View>
              <View style={styles.line}></View>
            </TouchableOpacity>
          </View>

        )}

      />

      {userHasGroup && (
        <FooterNav route={route} />
      )}
    </View>

  )
}
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
  // extendedCard: {
  //   height: 300
  // },
  column: {
    flexDirection: 'row',
  },
  cardContentActivity: {
    flex: 1
  },
  cardContentDate: {
    flex: 1
  },
  cardContentPeople: {
    justifyContent: "center"
  },
  cardText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black"

  },
  cardTextPeople: {
    fontSize: 24,
    fontWeight: "bold"
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
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    // elevation: 5,
    // position: 'relative', // Needed for positioning the close button

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
  modalExtendedContent: {
    alignItems: "center"
  },
  modalObervationText: {
    fontSize: 14,
    color: "red",
    fontWeight: "bold",
    marginVertical: 10,
  },
  addSkillLevelButton: {
    backgroundColor: "green",
    padding: 10,
    width: 100,
    alignItems: "center",
    borderRadius: 5,
    marginTop: 15
  },
  addSkillLevelText: {
    color: "white",
    fontWeight: "bold"

  }
})

export default GroupsScreen
