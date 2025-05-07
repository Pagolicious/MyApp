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
  ImageBackground,
  Pressable,
  TouchableWithoutFeedback
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { TextInput } from 'react-native-gesture-handler';
import { BlurView } from '@react-native-community/blur';

//Navigation
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/types';
import StarRating from 'react-native-star-rating-widget';
import { RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

//Components
import GroupNav from '../components/GroupNav';
import GroupMemberNav from '../components/GroupMemberNav';
import FooterNav from '../components/FooterNav';
import FooterGroupNav from '../components/FooterGroupNav';
import PartyDisplay from '../components/PartyDisplay';

//Firebase
import firestore from '@react-native-firebase/firestore';

//Context
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';

//Hooks
import { useGroupData } from '../hooks/useGroupData';

//Utils
import handleFirestoreError from '../utils/firebaseErrorHandler';

//Icons
import Icon1 from 'react-native-vector-icons/AntDesign';

//Types
import { Group, Applicant, Member } from '../types/groupTypes';



// type RootStackParamList = {
//   GroupsScreen: { activity: string };
// };

type GroupsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GroupsScreen'>;
type GroupsScreenRouteProp = RouteProp<RootStackParamList, 'GroupsScreen'>;

type Props = {
  navigation: GroupsScreenNavigationProp;
  route: GroupsScreenRouteProp;
};

// interface Group {
//   id: string;
//   activity: string;
//   title?: string;
//   location: string;
//   fromDate: string;
//   fromTime: string;
//   toTime: string;
//   createdBy: string;
//   memberLimit: number;
//   details: string;
//   applicants: Applicant[];
//   memberUids: string[];
// }

// interface Applicant {
//   uid: string;
//   firstName: string;
//   lastName?: string;
//   skillLevel?: number; // ✅ Add this to match the Firestore data
//   note?: string;
//   role?: "leader" | "member";
//   members?: Omit<Applicant, "members" | "role">[];
// }

// interface Member {
//   uid: string;
//   firstName: string;
//   lastName?: string;
// }

// interface Skills {
//   sport: string;
//   skillLevel: number
// }


const GroupsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { currentUser, userData } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  // const [userHasGroup, setUserHasGroup] = useState(false);
  // const [userInGroup, setUserInGroup] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [skillLevel, setSkillLevel] = useState(0);
  const [hasSkillLevel, setHasSkillLevel] = useState(false);
  const [note, setNote] = useState('');
  const { currentGroup, currentGroupId, setCurrentGroupId } = useGroup();
  const { activity } = route.params;
  // const navigation = useNavigation();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  // const { userInGroup } = useGroupData()
  const [userPickedSkillLevel, setUserPickedSkillLevel] = useState(false);
  const needsToSetSkillLevel = !hasSkillLevel && !userPickedSkillLevel && selectedGroup?.activity !== "Custom";
  const canShowGroupDetails = hasSkillLevel || userPickedSkillLevel || selectedGroup?.activity === "Custom";

  const animationValue = useRef(new Animated.Value(0)).current; // Initialize animated value

  // Define mapping of activity names to image paths
  // const activityImages: { [key: string]: any } = {
  //   tennis: require('../assets/SportImages/tennis.jpg'),
  // soccer: require('./assets/SportImages/soccer.png'),
  // basketball: require('./assets/SportImages/basketball.png'),
  // Add other activities and their respective images here
  // };

  // useEffect(() => {
  //   if (!currentUser) {
  //     // console.warn('User not authenticated.');
  //     return;
  //   }
  //   const fetchGroups = async () => {
  //     setLoading(true);

  //     try {
  //       const groupCollection = await firestore().collection('groups').get();
  //       const groupList: Group[] = groupCollection.docs.map(doc => {
  //         const data = doc.data();
  //         return {
  //           id: doc.id,
  //           activity: data.activity || '',
  //           location: data.location || '',
  //           fromDate: data.fromDate || '',
  //           fromTime: data.fromTime || '',
  //           memberLimit: data.memberLimit || 1,
  //           toTime: data.toTime || '',
  //           createdBy: data.createdBy || '',
  //           details: data.details || '',
  //           applicants: data.applicants || [],
  //           memberUids: data.memberUids || [],

  //         };
  //       });

  //       if (currentUser) {
  //         setUserHasGroup(currentGroup?.createdBy === currentUser.uid);
  //       }

  //       // Filter groups based on `activity` parameter
  //       const filteredGroups =
  //         activity === 'Any'
  //           ? groupList // Fetch all groups if activity is 'any'
  //           : groupList.filter(group => group.activity.toLowerCase() === activity.toLowerCase());

  //       // Update state with filtered groups
  //       setGroups(filteredGroups);

  //     } catch (error) {
  //       const errorMessage =
  //         (error as { message?: string }).message || 'An unknown error occurred';
  //       Alert.alert(errorMessage);
  //       handleFirestoreError(error)
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchGroups();
  // }, [activity]);


  useEffect(() => {
    if (!currentUser) {
      return;
    }

    // Set up a Firestore snapshot listener
    const unsubscribe = firestore()
      .collection('groups')
      .onSnapshot(snapshot => {
        const groupList: Group[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            activity: data.activity || '',
            title: data.title || '',
            location: data.location || '',
            fromDate: data.fromDate || '',
            fromTime: data.fromTime || '',
            memberLimit: data.memberLimit || 1,
            toTime: data.toTime || '',
            toDate: data.toDate || '',
            skillvalue: data.skillvalue || 0,
            createdBy: data.createdBy || '',
            details: data.details || '',
            applicants: data.applicants || [],
            members: data.members || [],
            memberUids: data.memberUids || [],
            isDelisted: data.isDelisted || false
          };
        })
          .filter(group => !group.isDelisted);
        // Filter groups based on `activity` parameter
        const filteredGroups =
          activity === 'Any'
            ? groupList
            : groupList.filter(group => group.activity.toLowerCase() === activity.toLowerCase());

        // if (currentUser) {
        //   setUserHasGroup(currentGroup?.createdBy === currentUser.uid);
        // }
        // Update state with the real-time data
        setGroups(filteredGroups);
      }, error => {
        console.error('Error listening to Firestore groups:', error);
        Alert.alert('Error', 'Could not fetch groups in real time.');
      });

    // Cleanup the listener when the component unmounts or dependencies change
    return () => unsubscribe();
  }, [activity, currentUser]);

  // useEffect(() => {
  //   if (!groups.length) return;

  //   // Keep track of unsubscribers for cleanup
  //   const unsubscribers = groups.map(group =>
  //     firestore()
  //       .collection('groups')
  //       .doc(group.id)
  //       .onSnapshot(docSnapshot => {
  //         const updatedApplicants = docSnapshot.data()?.applicants || [];

  //         setGroups(prevGroups =>
  //           prevGroups.map(g =>
  //             g.id === group.id
  //               ? { ...g, applicants: updatedApplicants }
  //               : g
  //           )
  //         );
  //       })
  //   );

  //   // Cleanup listeners on unmount
  //   return () => {
  //     unsubscribers.forEach(unsubscribe => unsubscribe());
  //   };
  // }, [groups]);


  const addSkillLevel = async () => {
    if (!currentUser || !selectedGroup) {
      console.log("not logged in or already in a group")
      return;
    }

    if (selectedGroup.activity !== "Custom") {
      const newSkill = {
        sport: selectedGroup.activity.toLowerCase(), // Add the sport name
        skillLevel, // Add the skill level value
      };

      try {
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .update({
            skills: firestore.FieldValue.arrayUnion(newSkill), // Use Firestore's arrayUnion
          });


        // setModalVisible(false);
        setHasSkillLevel(true);
      } catch (error) {
        console.error('Error saving user data: ', error);
        Alert.alert('Error', 'Could not save user data');
        handleFirestoreError(error)
      }
    }

  };

  const applyForGroup = async () => {
    if (!currentUser) {
      console.log("not online")
      return;
    }

    let applicantData: Applicant;
    try {
      // 🔍 Fetch the searchParty where doc ID = currentUser.uid (leader's party)
      const partyDoc = await firestore()
        .collection("searchParties")
        .doc(currentUser.uid)
        .get();

      const userParty = partyDoc.exists ? partyDoc.data() : null;

      // const skill =
      //   userData?.skills?.find(
      //     (s: any) => s.sport.toLowerCase() === selectedGroup?.activity?.toLowerCase()
      //   ) || null;

      // 🔹 If user is a party leader, submit the whole party as ONE applicant
      if (userParty) {
        applicantData = {
          uid: userParty.leaderUid,
          firstName: userParty.leaderFirstName,
          lastName: userParty.leaderLastName,
          skillLevel: skillLevel,
          note: note, // Optional note
          role: "leader",
          members: userParty.members?.map((member: Member) => ({
            uid: member.uid,
            firstName: member.firstName,
            lastName: member.lastName || "",
            role: "member",
          })) || [],
        };
      } else {
        // 🔹 If user is not in a party, submit as an individual applicant
        applicantData = {
          uid: currentUser.uid,
          firstName: userData?.firstName || "",
          lastName: userData?.lastName || "",
          skillLevel: skillLevel,
          note: note,
        };
      }

      const sanitizedApplicantData = Object.fromEntries(
        Object.entries(applicantData).filter(([_, v]) => v !== undefined)
      );

      // 🔥 Save applicant data to Firestore
      await firestore()
        .collection('groups')
        .doc(selectedGroup?.id)
        .update({
          applicants: firestore.FieldValue.arrayUnion(sanitizedApplicantData),
        });

      // ✅ Update local state
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

  // const checkUserSkillLevel = async (activity: string) => {
  //   if (!currentUser) {
  //     return;
  //   }
  //   // console.log("👀 Activity:", activity);

  //   if (activity === "Custom") {
  //     setSkillLevel(0);
  //     setHasSkillLevel(true); // ✅ Treat custom groups as always eligible
  //     return;
  //   }
  //   // const skillLevelKey = `${activity.toLowerCase()}_skillLevel`;
  //   try {
  //     if (userData && Array.isArray(userData.skills)) {

  //       const skill = userData.skills.find(
  //         (item: { sport: string; skillLevel: number }) => item.sport === activity.toLowerCase()
  //       );

  //       if (skill) {
  //         setSkillLevel(skill.skillLevel); // Set the existing skill level
  //         setHasSkillLevel(true); // User already has a skill level for this activity
  //       } else {
  //         setSkillLevel(0); // No skill found for this activity
  //         setHasSkillLevel(false);
  //       }
  //     } else {
  //       setSkillLevel(0); // No skills array found
  //       setHasSkillLevel(false);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching user skill level: ', error);
  //     Alert.alert('Error', 'Could not fetch user skill level');
  //     handleFirestoreError(error)

  //   }
  // };

  const checkUserSkillLevel = async (activity: string): Promise<boolean> => {
    if (!currentUser) {
      return false;
    }

    if (activity === "Custom") {
      setSkillLevel(0);
      setHasSkillLevel(true);
      return true;
    }

    try {
      if (userData && Array.isArray(userData.skills)) {
        const skill = userData.skills.find(
          (item: { sport: string; skillLevel: number }) => item.sport === activity.toLowerCase()
        );
        if (skill) {
          setSkillLevel(skill.skillLevel);
          setHasSkillLevel(true);
          return true;
        }
      }
      setSkillLevel(0);
      setHasSkillLevel(false);
      return false;
    } catch (error) {
      console.error('Error fetching user skill level: ', error);
      Alert.alert('Error', 'Could not fetch user skill level');
      return false;
    }
  };


  // useEffect(() => {
  //   if (!currentUser) return;
  //   console.log(selectedGroup?.activity)
  //   if (skillLevel > 0 || selectedGroup?.activity === "Custom") {
  //     Animated.timing(animationValue, {
  //       toValue: 1, // Fully expanded
  //       duration: 300,
  //       easing: Easing.out(Easing.ease),
  //       useNativeDriver: false,
  //     }).start();
  //   } else {
  //     Animated.timing(animationValue, {
  //       toValue: 0, // Collapsed
  //       duration: 100,
  //       easing: Easing.in(Easing.ease),
  //       useNativeDriver: false,
  //     }).start();
  //   }
  // }, [skillLevel, currentUser, selectedGroup]); // React to skillLevel changes

  useEffect(() => {
    if (!currentUser || !selectedGroup) return;

    // Only auto-collapse when switching groups (not skill level change!)
    if (selectedGroup.activity !== "Custom" && skillLevel === 0) {
      Animated.spring(animationValue, {
        toValue: 0,
        stiffness: 120,
        damping: 14,
        mass: 1,
        useNativeDriver: false,
      }).start();
    }
  }, [currentUser, selectedGroup]); // ❗ Remove skillLevel from dependencies!




  // Interpolate animated value for opacity and height
  const animatedStyle = {
    opacity: animationValue,
    height: animationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 450], // Adjust height as needed
    }),
  };

  const handleCardPress = async (item: Group) => {
    if (userData?.isGroupLeader || userData?.isGroupMember || userData?.isPartyMember) {
      console.log("User is already in a group");
      return;
    }

    setSelectedGroup(item);

    const userHasSkill = await checkUserSkillLevel(item.activity); // ⬅️ Make `checkUserSkillLevel` return boolean

    if (item.activity === "Custom" || userHasSkill) {
      Animated.spring(animationValue, {
        toValue: 1,
        stiffness: 120,
        damping: 14,
        mass: 1,
        useNativeDriver: false,
      }).start();
    }

    setApplyModalVisible(true);
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
          {/* <ImageBackground
            source={require('../assets/BackgroundImages/whiteBackground.jpg')} // Path to your background image
            style={styles.backgroundImage} // Style for the background image
          > */}
          {/* <View style={styles.contentContainer}> */}

          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon1 name="arrowleft" size={25} color="white" />
            </TouchableOpacity>
            {/* <View style={styles.spacer} /> */}
            <Text style={styles.headerText}>Groups</Text>
            {/* <View style={styles.spacer} /> */}
            {userData && (userData.isPartyLeader || userData.isPartyMember) && (
              <View style={styles.partyContainer}>
                <PartyDisplay />
              </View>
            )}
          </View>

          {/* {userHasGroup ? <GroupNav /> : null}
          {userInGroup ? <GroupMemberNav /> : null} */}
          <ImageBackground
            source={require('../assets/BackgroundImages/whiteBackground.jpg')} // Path to your background image
            style={styles.backgroundImage} // Style for the background image
          >

            <View style={styles.flatListContainer}>
              <FlatList
                data={groups || []}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => {
                  // const activityImage = activityImages[item.activity.toLowerCase()] || require('../assets/SportImages/tennis.jpg');

                  const isApplicant = item.applicants.some(
                    applicant => applicant.uid === currentUser?.uid
                  );
                  const isMember = item.memberUids.includes(currentUser?.uid);
                  const isOwner = item.createdBy === currentUser.uid
                  // <View>
                  return (

                    <Pressable onPress={() => handleCardPress(item)}
                      android_ripple={{ color: "rgba(0, 0, 0, 0.2)", borderless: false }}
                      style={[
                        styles.card,
                        { backgroundColor: isApplicant || isMember || isOwner ? '#50C878' : '#6A9AB0' }, // Dynamic color
                      ]}>

                      {/* <View > */}
                      <View style={styles.column}>

                        {/* Card Content: Activity & Location */}
                        <View style={styles.cardContentActivity}>
                          {item.activity === "Custom" ? (
                            <Text style={styles.cardText}>{item.title}</Text>
                          ) : (
                            <Text style={styles.cardText}>{item.activity}</Text>
                          )}
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
                          <Text style={styles.cardTextPeople}>{item.memberUids.length}/{item.memberLimit + 1}</Text>
                        </View>
                      </View>
                      {/* </View> */}
                      {/* </View> */}
                      {/* </ImageBackground> */}
                      {/* <View style={styles.line} /> */}
                    </Pressable>
                    // </View>
                  )
                }}
                ListEmptyComponent={
                  <Text style={styles.noGroupsText}>No groups available</Text>
                }
              />
            </View>

            {/* Modal Component */}
            {/* {currentUser && !hasSkillLevel && (
              <Modal
                animationType="fade"
                transparent
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>

                  <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                      <TouchableOpacity
                        style={styles.closeIcon}
                        onPress={() => setModalVisible(false)}>
                        <Text style={styles.closeText}>✖</Text>
                      </TouchableOpacity>

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
                </TouchableWithoutFeedback>
              </Modal>
            )} */}
            {currentUser && (
              <Modal
                animationType="fade"
                transparent
                visible={applyModalVisible}
                onRequestClose={() => setApplyModalVisible(false)}
              >
                <TouchableWithoutFeedback
                  onPress={() => {
                    setApplyModalVisible(false);
                    setUserPickedSkillLevel(false); // ✅ Reset on close
                  }}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                      {/* Close Button */}
                      <TouchableOpacity
                        style={styles.closeIcon}
                        onPress={() => {
                          setApplyModalVisible(false);
                          setUserPickedSkillLevel(false);
                          // animationValue.setValue(0);
                        }}
                      >
                        <Text style={styles.closeText}>✖</Text>
                      </TouchableOpacity>

                      {/* Modal Title */}
                      <Text style={styles.modalTitleText}>Apply For Group</Text>

                      {/* ⭐ Star Rating always visible */}
                      <View style={styles.setLevelContainer}>
                        {(!hasSkillLevel && selectedGroup?.activity !== "Custom") && (
                          <>
                            <Text style={styles.modalText}>
                              We need to know your skill level for this activity
                            </Text>

                            <StarRating
                              rating={skillLevel}
                              onChange={(newRating) => {
                                setSkillLevel(newRating);
                                if (newRating > 0) {
                                  setTimeout(() => {
                                    setUserPickedSkillLevel(true);
                                    Animated.spring(animationValue, {
                                      toValue: 1,
                                      stiffness: 120,
                                      damping: 14,
                                      mass: 1,
                                      useNativeDriver: false,
                                    }).start();
                                  }, 50);
                                }
                              }}
                              enableHalfStar={false}
                            />

                            <Text style={styles.modalObervationText}>
                              You can NOT change your skill level later
                            </Text>
                          </>
                        )}


                        {/* 🧩 Expanded Group Details */}
                        {(canShowGroupDetails) && (
                          <>
                            <Animated.View style={[styles.modalExtendedContent, animatedStyle]}>

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
                                  multiline={true}
                                  numberOfLines={4}
                                  textAlignVertical="top"
                                />
                              </View>

                              <TouchableOpacity
                                style={styles.submitBtn}
                                onPress={async () => {
                                  if (!hasSkillLevel) {
                                    await addSkillLevel();
                                  }
                                  applyForGroup();
                                }}
                              >
                                <Text style={styles.submitBtnText}>Submit</Text>
                              </TouchableOpacity>

                            </Animated.View>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            )}


            {/* </View> */}
          </ImageBackground>


        </>
      )}
      {/* </ImageBackground> */}
      {/* {(userData?.isGroupLeader || userData?.isGroupMember) && <FooterGroupNav />}
      {(!userData?.isGroupLeader && !userData?.isGroupMember) && <FooterNav />} */}
    </View>

  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // borderWidth: 5
  },
  // contentContainer: {
  //   flex: 1, // Ensures the content takes up all available space
  //   paddingBottom: 10, // Optional: Adds spacing at the bottom if needed
  //   borderWidth: 5,
  //   // height: 400
  // },
  header: {
    height: 65,
    backgroundColor: '#5f4c4c',
    paddingHorizontal: 15,
    // justifyContent: "space-between",
    alignItems: 'center',
    flexDirection: "row",
    justifyContent: "space-between", // Ensures PartyDisplay stays in position

  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    position: 'absolute', // Keeps it centered
    left: "50%",
    transform: [{ translateX: -20 }], // Adjust based on text width
  },
  partyContainer: {
    // flexGrow: 1, // Allow PartyDisplay to use available space
    // alignItems: "flex-end", // Align PartyDisplay to the right
    // paddingRight: 10, // Ensure spacing from edge
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden", // Prevents overflow
    // borderWidth: 2, // Keep for debugging
    // borderColor: "red",
    width: 160, // Ensure enough space for avatars
    height: 40, // Match avatar size
    position: "relative", // Important for absolute children

  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  flatListContainer: {
    marginTop: 10
  },
  card: {
    backgroundColor: '#6A9AB0',
    padding: 15,
    // width: "95%",
    // alignSelf: "center",
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 15,
    overflow: 'hidden',


    // Shadow for iOS
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow position
    shadowOpacity: 0.25, // Shadow transparency
    shadowRadius: 3.84, // Shadow blur radius

    // Shadow for Android
    elevation: 5, // Elevation for Android shadow
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
    fontSize: 20,
    fontWeight: 'bold',
    color: "black"
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
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    // elevation: 5,
    // position: 'relative', // Needed for positioning the close button
  },
  setLevelContainer: {
    alignItems: 'center',
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
    marginTop: 200,
    fontSize: 24
  },

  // contentOverlay: {
  //   flex: 1,
  //   backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay for readability
  //   borderRadius: 10,
  //   padding: 15,
  //   justifyContent: 'center',
  // },
  // overlay: {
  //   ...StyleSheet.absoluteFillObject, // Fills the entire ImageBackground
  //   backgroundColor: 'rgba(0, 0, 0, 0.4)', // Adjust transparency here
  //   borderRadius: 10, // Match the image's border radius
  // },
  // blurView: {
  //   ...StyleSheet.absoluteFillObject, // Fills the entire ImageBackground
  //   borderRadius: 10, // Match the image's border radius
  // },
});

export default GroupsScreen;
