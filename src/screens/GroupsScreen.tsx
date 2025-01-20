import {
  StyleSheet,
  Text,
  View,
  Alert,
  Modal,
  TouchableOpacity,
  FlatList,
  Animated,
  Easing,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { TextInput } from 'react-native-gesture-handler';

//Navigation
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import StarRating from 'react-native-star-rating-widget';
import { RouteProp } from '@react-navigation/native';

//Components
import GroupNav from '../components/GroupNav';
import GroupMemberNav from '../components/GroupMemberNav';
import FooterNav from '../components/FooterNav';
import FooterGroupNav from '../components/FooterGroupNav';

//Firebase
import firestore from '@react-native-firebase/firestore';

//Context
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';

//Hooks
import { useGroupData } from '../hooks/useGroupData';

//Utils
import handleFirestoreError from '../utils/firebaseErrorHandler';

// type GroupsProps = NativeStackScreenProps<RootStackParamList, 'GroupsScreen'>;
type GroupsScreenRouteProp = RouteProp<RootStackParamList, 'GroupsScreen'>;

type Props = {
  route: GroupsScreenRouteProp;
};

interface Group {
  id: string;
  activity: string;
  location: string;
  fromDate: string;
  fromTime: string;
  toTime: string;
  createdBy: string;
  memberLimit: number;
  details: string;
  applicants: Applicant[];
  memberUids: string[];
}

interface Applicant {
  uid: string;
  note?: string;
}


const GroupsScreen: React.FC<Props> = ({ route }) => {
  const { currentUser, userData } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [userHasGroup, setUserHasGroup] = useState(false);
  // const [userInGroup, setUserInGroup] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [skillLevel, setSkillLevel] = useState(0);
  const [hasSkillLevel, setHasSkillLevel] = useState(false);
  const [note, setNote] = useState('');
  const { setCurrentGroupId } = useGroup();
  const { currentGroup, currentGroupId, userInGroup } = useGroup();
  const { activity } = route.params;

  // const { userInGroup } = useGroupData()

  const animationValue = useRef(new Animated.Value(0)).current; // Initialize animated value

  useEffect(() => {
    if (!currentUser) {
      // console.warn('User not authenticated.');
      return;
    }
    const fetchGroups = async () => {
      setLoading(true);

      try {
        const groupCollection = await firestore().collection('groups').get();
        const groupList: Group[] = groupCollection.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            activity: data.activity || '',
            location: data.location || '',
            fromDate: data.fromDate || '',
            fromTime: data.fromTime || '',
            memberLimit: data.memberLimit || 1,
            toTime: data.toTime || '',
            createdBy: data.createdBy || '',
            details: data.details || '',
            applicants: data.applicants || [],
            memberUids: data.memberUids || [],

          };
        });

        if (currentUser) {
          setUserHasGroup(currentGroup?.createdBy === currentUser.uid);
        }

        // Filter groups based on `activity` parameter
        const filteredGroups =
          activity === 'Any'
            ? groupList // Fetch all groups if activity is 'any'
            : groupList.filter(group => group.activity.toLowerCase() === activity.toLowerCase());

        // Update state with filtered groups
        setGroups(filteredGroups);

      } catch (error) {
        const errorMessage =
          (error as { message?: string }).message || 'An unknown error occurred';
        Alert.alert(errorMessage);
        handleFirestoreError(error)
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [activity]);



  // const memberInGroup = await firestore()
  //   .collection('groups')
  //   .where('memberUids', 'array-contains', currentUser.uid)
  //   .get();

  // setUserInGroup(!memberInGroup.empty); // If the query returns results, set to true




  const addSkillLevel = async () => {
    if (!currentUser || !currentGroup) {
      return;
    }

    const skillLevelKey = `${currentGroup.activity.toLowerCase()}_skillLevel`;
    try {
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .update({
          [skillLevelKey]: skillLevel,
        });
      setModalVisible(false);
      setHasSkillLevel(true); // Set hasSkillLevel to true after saving
    } catch (error) {
      console.error('Error saving user data: ', error);
      Alert.alert('Error', 'Could not save user data');
      handleFirestoreError(error)
    }
  };

  const applyForGroup = async (currentGroup: Group | undefined) => {
    if (!currentGroup || !currentUser) {
      return;
    }
    const applicantData = {
      uid: currentUser.uid,
      note: note,
    };
    try {
      await firestore()
        .collection('groups')
        .doc(currentGroupId)
        .update({
          applicants: firestore.FieldValue.arrayUnion(applicantData),
        });
      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === currentGroupId
            ? {
              ...group,
              applicants: [...(group.applicants || []), applicantData],
            }
            : group,
        ),
      );
      setApplyModalVisible(false);
    } catch (error) {
      console.error('Error saving user data: ', error);
      Alert.alert('Error', 'Could not apply for group');
      handleFirestoreError(error)

    }
  };

  const checkUserSkillLevel = async (activity: string) => {
    if (!currentUser) {
      return;
    }

    const skillLevelKey = `${activity.toLowerCase()}_skillLevel`;

    try {
      const userDoc = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .get();
      const userData = userDoc.data();

      if (userData && userData[skillLevelKey] !== undefined) {
        setSkillLevel(userData[skillLevelKey]);
        setHasSkillLevel(true); // User already has a skill level for this activity
      } else {
        setSkillLevel(0);
        setHasSkillLevel(false); // User does not have a skill level yet
      }
    } catch (error) {
      console.error('Error fetching user skill level: ', error);
      Alert.alert('Error', 'Could not fetch user skill level');
      handleFirestoreError(error)

    }
  };

  useEffect(() => {
    if (!currentUser) return;

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
        duration: 100,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  }, [skillLevel, currentUser]); // React to skillLevel changes


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
    setCurrentGroupId(item?.id)
    if (!hasSkillLevel) {
      setModalVisible(true);
    } else {
      setApplyModalVisible(true);
    }
  };

  // if (loading) {
  //   return (
  //     <View style={styles.container}>
  //       <Text>Loading groups...</Text>
  //     </View>
  //   );
  // }

  return (
    <View style={styles.container}>
      {!currentUser ? (
        <Text>Please log in to view groups.</Text>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerText}>Groups</Text>
          </View>
          {userHasGroup ? <GroupNav /> : null}
          {userInGroup ? <GroupMemberNav /> : null}


          {/* Modal Component */}
          {currentUser && currentUser.uid && !hasSkillLevel && (
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
                  <Text style={styles.modalTitleText}>Skill level</Text>
                  <Text style={styles.modalText}>
                    We need to know your skill level for this activity
                  </Text>
                  <StarRating
                    rating={skillLevel}
                    onChange={setSkillLevel}
                    enableHalfStar={false}
                  />
                  <Animated.View
                    style={[styles.modalExtendedContent, animatedStyle]}>
                    <Text style={styles.modalObervationText}>
                      You can NOT change your skill level later
                    </Text>
                    <TouchableOpacity
                      style={styles.submitBtn}
                      onPress={async () => {
                        addSkillLevel();
                      }}>
                      <Text style={styles.submitBtnText}>Submit</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </View>
            </Modal>
          )}
          {currentUser && currentUser.uid && hasSkillLevel && (
            <Modal
              animationType="fade"
              transparent
              visible={applyModalVisible}
              onRequestClose={() => setApplyModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalView}>
                  {/* Close Button in top-right corner */}
                  <TouchableOpacity
                    style={styles.closeIcon}
                    onPress={() => setApplyModalVisible(false)}>
                    <Text style={styles.closeText}>✖</Text>
                  </TouchableOpacity>

                  {/* Modal Content */}
                  <Text style={styles.modalTitleText}>Apply For Group</Text>
                  <Text style={styles.modalText}>Group Details:</Text>
                  <View style={styles.modalDetailContainer}>
                    <Text style={styles.modalDetailText}>
                      {currentGroup?.details}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.modalText}>Your message to the group:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="This is optional"
                      value={note}
                      onChangeText={setNote}
                      multiline={true} // Allow multiple lines
                      numberOfLines={4} // Set number of lines to display by default
                      textAlignVertical="top" // Align text to the top of the input
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={async () => {
                      applyForGroup(currentGroup);
                    }}>
                    <Text style={styles.submitBtnText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
          <FlatList
            data={groups || []}
            keyExtractor={item => item.id.toString()}
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
                  <View
                    style={[
                      styles.card,
                      (item.createdBy === currentUser.uid || item.memberUids?.includes(currentUser.uid)) && {
                        backgroundColor: 'lightblue',
                      },
                      item.applicants &&
                        Array.isArray(item.applicants) &&
                        item.applicants.some(
                          (applicant: Applicant) => applicant.uid === currentUser.uid,
                        )
                        ? { backgroundColor: '#AFE1AF' }
                        : {},
                    ]}>
                    <View style={styles.column}>
                      {/* Card Content: Activity & Location */}
                      <View style={styles.cardContentActivity}>
                        <Text style={styles.cardText}>{item.activity}</Text>
                        <Text style={styles.cardText}>{item.location}</Text>
                      </View>

                      {/* Card Content: Date & Time */}
                      <View style={styles.cardContentDate}>
                        <Text style={styles.cardText}>{item.fromDate}</Text>
                        <Text style={styles.cardText}>
                          {item.fromTime} - {item.toTime}
                        </Text>
                      </View>

                      {/* Card Content: People */}
                      <View style={styles.cardContentPeople}>
                        <Text style={styles.cardTextPeople}>+{item.memberLimit}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.line} />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.noGroupsText}>No groups available</Text>
            }
          />
          {(userHasGroup || userInGroup) && <FooterGroupNav />}
          {(!userHasGroup && !userInGroup) && <FooterNav />}
        </>
      )}
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
  card: {
    backgroundColor: '#6A9AB0',
    padding: 15,
  },
  // extendedCard: {
  //   height: 300
  // },
  column: {
    flexDirection: 'row',
  },
  cardContentActivity: {
    flex: 1,
  },
  cardContentDate: {
    flex: 1,
  },
  cardContentPeople: {
    justifyContent: 'center',
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  cardTextPeople: {
    fontSize: 24,
    fontWeight: 'bold',
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
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    // elevation: 5,
    // position: 'relative', // Needed for positioning the close button
  },
  modalDetailContainer: {
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
  modalDetailText: {
    padding: 10,
    color: 'black',
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
  modalExtendedContent: {
    alignItems: 'center',
  },
  modalObervationText: {
    fontSize: 14,
    color: 'red',
    fontWeight: 'bold',
    marginVertical: 10,
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
  noGroupsText: {
    flex: 1,
    textAlign: "center",
    marginTop: 100,
    fontSize: 24
  }
});

export default GroupsScreen;
