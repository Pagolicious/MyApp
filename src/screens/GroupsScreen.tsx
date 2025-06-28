import {
  StyleSheet,
  Text,
  View,
  Alert,
  Modal,
  TouchableOpacity,
  FlatList,
  Animated,
  ImageBackground,
  TouchableWithoutFeedback
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { TextInput } from 'react-native-gesture-handler';
import { Dimensions } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

//Navigation
import { RootStackParamList } from '../utils/types';
import StarRating from 'react-native-star-rating-widget';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

//Components
import PartyDisplay from '../components/PartyDisplay';
import GroupCard from '../components/GroupCard'

//Firebase
import firestore from '@react-native-firebase/firestore';

//Context
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';

//Utils
import handleFirestoreError from '../utils/firebaseErrorHandler';

//Icons
import Icon1 from 'react-native-vector-icons/AntDesign';

//Types
import { Group, Applicant, Member } from '../types/groupTypes';

type GroupsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GroupsScreen'>;
type GroupsScreenRouteProp = RouteProp<RootStackParamList, 'GroupsScreen'>;

type Props = {
  navigation: GroupsScreenNavigationProp;
  route: GroupsScreenRouteProp;
};

const parseGroupTime = (fromDate: string, fromTime: string): Date => {
  const date = new Date(fromDate); // already full ISO date
  const [hour, minute] = fromTime.split(':').map(Number);
  date.setHours(hour);
  date.setMinutes(minute);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
};

const screenWidth = Dimensions.get('window').width;

const GroupsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { currentUser, userData } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [skillLevel, setSkillLevel] = useState(0);
  const [hasSkillLevel, setHasSkillLevel] = useState(false);
  const [note, setNote] = useState('');
  const { currentGroupId } = useGroup();
  const { activity, date, time, groupSize } = route.params;
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [userPickedSkillLevel, setUserPickedSkillLevel] = useState(false);
  const needsToSetSkillLevel = !hasSkillLevel && !userPickedSkillLevel && selectedGroup?.activity !== "Custom";
  const canShowGroupDetails = hasSkillLevel || userPickedSkillLevel || selectedGroup?.activity === "Custom";

  const animationValue = useRef(new Animated.Value(0)).current;

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
            createdBy: data.createdBy || {
              uid: data.createdBy,
              firstName: '',
              lastName: ''
            },
            details: data.details || '',
            applicants: data.applicants || [],
            members: data.members || [],
            memberUids: data.memberUids || [],
            isDelisted: data.isDelisted || false,
            gender: data.gender || 'All',
            visibility: data.visibility || 'Public',
            minAge: data.minAge || 18,
            maxAge: data.maxAge || 70,
            isFriendsOnly: data.isFriendsOnly || false,
            isAutoAccept: data.isAutoAccept || false,
            isVerifiedOnly: data.isVerifiedOnly || false,
          };

        })

          .filter(group => !(group.isDelisted || group.visibility === 'Private'));

        let filteredGroups = groupList;

        // Filter groups based on `activity` parameter
        if (activity !== 'Any') {
          filteredGroups = filteredGroups.filter(group =>
            group.activity.toLowerCase() === activity.toLowerCase()
          );
        }

        if (date) {
          try {
            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
              throw new Error('Invalid date format');
            }
            const formattedTargetDate = parsedDate.toISOString().split('T')[0];
            filteredGroups = filteredGroups.filter(group => {
              const groupDate = new Date(group.fromDate).toISOString().split('T')[0];
              return groupDate === formattedTargetDate;
            });
          } catch (err) {
            console.warn('Invalid date format:', date);
          }
        }

        if (groupSize) {
          const parsedGroupSize = typeof groupSize === 'string' ? parseInt(groupSize, 10) : groupSize;
          if (!isNaN(parsedGroupSize)) {
            filteredGroups = filteredGroups.filter(group => group.memberLimit === parsedGroupSize);
          }
        }

        if (time) {
          const centerTime = new Date(time);
          const centerHour = centerTime.getHours();
          const centerMin = centerTime.getMinutes();

          const exactMatches: Group[] = [];
          const looseMatches: Group[] = [];

          filteredGroups.forEach(group => {
            const groupTime = parseGroupTime(group.fromDate, group.fromTime);
            const groupHour = groupTime.getHours();
            const groupMin = groupTime.getMinutes();

            const groupTotalMinutes = groupHour * 60 + groupMin;
            const centerTotalMinutes = centerHour * 60 + centerMin;

            const diff = Math.abs(groupTotalMinutes - centerTotalMinutes);

            if (diff <= 15) {
              exactMatches.push(group);
            } else if (diff <= 120) {
              looseMatches.push(group);
            }
          });

          if (exactMatches.length >= 3) {
            setGroups(exactMatches);
          } else {
            setGroups([...exactMatches, ...looseMatches]);
          }
        }
        else {
          // If time is not provided, set the filtered groups directly
          setGroups(filteredGroups);
        }

      }, error => {
        console.error('Error listening to Firestore groups:', error);
        Alert.alert('Error', 'Could not fetch groups in real time.');
      });

    // Cleanup the listener when the component unmounts or dependencies change
    return () => unsubscribe();
  }, [activity, date, time, groupSize, currentUser]);


  const addSkillLevel = async () => {
    if (!currentUser || !selectedGroup) {
      console.log("not logged in or already in a group")
      return;
    }

    if (selectedGroup.activity !== "Custom") {
      const newSkill = {
        sport: selectedGroup.activity.toLowerCase(),
        skillLevel,
      };

      try {
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .update({
            skills: firestore.FieldValue.arrayUnion(newSkill),
          });

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
    const now = new Date().toISOString();

    try {
      // 🔍 Fetch the searchParty where doc ID = currentUser.uid (leader's party)
      const partyDoc = await firestore()
        .collection("searchParties")
        .doc(currentUser.uid)
        .get();

      const userParty = partyDoc.exists ? partyDoc.data() : null;

      // 🔹 If user is a party leader, submit the whole party as ONE applicant
      if (userParty) {
        applicantData = {
          uid: userParty.leaderUid,
          firstName: userParty.leaderFirstName,
          lastName: userParty.leaderLastName,
          skillLevel: skillLevel,
          note: note, // Optional note
          appliedAt: now,
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
          appliedAt: now
        };
      }

      const sanitizedApplicantData = Object.fromEntries(
        Object.entries(applicantData).filter(([_, v]) => v !== undefined)
      );

      // Save applicant data to Firestore
      await firestore()
        .collection('groups')
        .doc(selectedGroup?.id)
        .update({
          applicants: firestore.FieldValue.arrayUnion(sanitizedApplicantData),
        });

      // Update local state
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

  const cancelApplication = async (groupId: string) => {
    if (!currentUser) return;

    try {
      // Remove user from applicants array in Firestore
      await firestore()
        .collection('groups')
        .doc(groupId)
        .update({
          applicants: firestore.FieldValue.arrayRemove(
            groups.find(g => g.id === groupId)?.applicants.find(a => a.uid === currentUser.uid)
          ),
        });

      // Update local state
      setGroups(prev =>
        prev.map(group =>
          group.id === groupId
            ? {
              ...group,
              applicants: group.applicants.filter(app => app.uid !== currentUser.uid),
            }
            : group
        )
      );
    } catch (error) {
      console.error("Error cancelling application:", error);
      Alert.alert("Error", "Could not cancel application.");
    }
  };

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
  }, [currentUser, selectedGroup]); // Remove skillLevel from dependencies!

  // Interpolate animated value for opacity and height
  const animatedStyle = {
    opacity: animationValue,
    height: animationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 250],
    }),
  };

  const handleCardPress = async (item: Group) => {
    if (userData?.isGroupLeader || userData?.isGroupMember || userData?.isPartyMember) {
      console.log("User is already in a group");
      return;
    }

    setSelectedGroup(item);

    const userHasSkill = await checkUserSkillLevel(item.activity);

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

  return (
    <View style={styles.container}>


      {!currentUser ? (
        <Text>Please log in to view groups.</Text>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon1 name="arrowleft" size={25} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Groups</Text>
            {userData && (userData.isPartyLeader || userData.isPartyMember) && (
              <View style={styles.partyContainer}>
                <PartyDisplay />
              </View>
            )}
          </View>
          <ImageBackground
            source={require('../assets/BackgroundImages/whiteBackground.jpg')}
            style={styles.backgroundImage}
          >
            <FlatList
              data={groups}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <GroupCard group={item} currentUserId={currentUser?.uid || ''}
                  onPressApply={() => handleCardPress(item)}
                  onCancelApply={() => cancelApplication(item.id)}

                />
              )}
              ListEmptyComponent={
                <Text style={styles.noGroupsText}>No groups available</Text>
              }
            />
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
                    setUserPickedSkillLevel(false);
                  }}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                      <TouchableOpacity
                        style={styles.closeIcon}
                        onPress={() => {
                          setApplyModalVisible(false);
                          setUserPickedSkillLevel(false);
                        }}
                      >
                        <Text style={styles.closeText}>✖</Text>
                      </TouchableOpacity>

                      <Text style={styles.modalTitleText}>Apply For Group</Text>

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


                        {(canShowGroupDetails) && (
                          <>
                            <Animated.View style={[styles.modalExtendedContent, animatedStyle]}>

                              <View style={styles.modalContent}>

                                <Text style={styles.modalText}>Your message to the group:</Text>
                                <TextInput
                                  style={styles.input}
                                  placeholder="This is optional"
                                  placeholderTextColor="#999"
                                  value={note}
                                  onChangeText={setNote}
                                  multiline={true}
                                  numberOfLines={4}
                                  textAlignVertical="top"
                                />
                              </View>

                              <View style={styles.modalFooter}>
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
                              </View>

                            </Animated.View>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            )}
          </ImageBackground>
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
    height: verticalScale(65),
    backgroundColor: '#5f4c4c',
    paddingHorizontal: scale(15),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: 'white',
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -scale(20) }],
  },
  partyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    width: scale(160),
    height: verticalScale(40),
    position: 'relative',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  flatListContainer: {
    marginTop: verticalScale(10),
  },
  card: {
    backgroundColor: '#6A9AB0',
    padding: scale(15),
    marginTop: verticalScale(10),
    marginHorizontal: scale(10),
    borderRadius: moderateScale(15),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(3.84),
    elevation: 5,
  },
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
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: 'black',
  },
  cardTextPeople: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: 'black',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: Math.min(scale(300), screenWidth * 0.9),
    padding: scale(20),
    backgroundColor: 'white',
    borderRadius: moderateScale(20),
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  modalFooter: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: verticalScale(10),
  },
  setLevelContainer: {
    alignItems: 'center',
  },
  modalDetailContainer: {
    width: scale(260),
    height: verticalScale(100),
    borderRadius: moderateScale(5),
    backgroundColor: '#F9F6EE',
    borderWidth: 1,
    borderColor: 'grey',
  },
  input: {
    height: verticalScale(100),
    width: scale(260),
    borderColor: 'gray',
    borderWidth: 1,
    padding: scale(10),
    borderRadius: moderateScale(5),
    backgroundColor: 'white',
    fontSize: moderateScale(16),
  },
  modalDetailText: {
    padding: scale(10),
    color: 'black',
  },
  closeIcon: {
    position: 'absolute',
    top: scale(5),
    right: scale(15),
    padding: scale(5),
  },
  closeText: {
    fontSize: moderateScale(24),
    color: '#888',
  },
  modalTitleText: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: 'black',
  },
  modalText: {
    marginTop: verticalScale(20),
    fontSize: moderateScale(18),
    color: 'black',
    marginBottom: verticalScale(20),
  },
  modalExtendedContent: {
  },
  modalObervationText: {
    fontSize: moderateScale(14),
    color: 'red',
    fontWeight: 'bold',
    marginVertical: verticalScale(10),
  },
  submitBtn: {
    backgroundColor: 'green',
    padding: moderateScale(10),
    width: scale(100),
    alignItems: 'center',
    borderRadius: moderateScale(5),
    marginTop: verticalScale(15),
  },
  submitBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noGroupsText: {
    flex: 1,
    textAlign: 'center',
    marginTop: verticalScale(200),
    fontSize: moderateScale(24),
  },
});


export default GroupsScreen;
