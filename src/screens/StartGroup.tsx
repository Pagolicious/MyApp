import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  FlatList,
  Modal,
  Pressable
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import StarRating from 'react-native-star-rating-widget';

import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Animated } from 'react-native';
import Toast from 'react-native-toast-message';
import { RouteProp, useRoute } from '@react-navigation/native';


//Navigation
import { RootStackParamList } from '../utils/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

//Components
import MyButton from '../components/MyButton';
import SearchableDropdown from '../components/SearchableDropdown';
import MoreOptionsModal from '../components/MoreOptionModal';

//Assets
import sportsList from "../assets/JsonFiles/sportsList.json"

//Firebase
import firestore from '@react-native-firebase/firestore';

// Context
import { useAuth } from '../context/AuthContext';
import { useGroupStore } from '../stores/groupStore';

//Services
import { navigate } from '../services/NavigationService';

//Icons
import Icon1 from 'react-native-vector-icons/AntDesign';

//Types
import { GroupUpdate, Member } from '../types/groupTypes';

type StartGroupRouteProp = RouteProp<RootStackParamList, 'StartGroup'>;


const StartGroup = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const route = useRoute<StartGroupRouteProp>();
  const { isEdit = false } = route.params || {};

  const { currentUser, userData } = useAuth();

  const [activity, setActivity] = useState('');
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('');
  const [fromDate, setFromDate] = useState(new Date());
  const [showFromDatepicker, setShowFromDatepicker] = useState(false);
  const [fromTime, setFromTime] = useState(() => {
    const defaultTime = new Date();
    defaultTime.setHours(0, 0, 0);
    return defaultTime;
  });
  const [showFromTimepicker, setShowFromTimepicker] = useState(false);

  const [toDate, setToDate] = useState(new Date());
  const [showToDatepicker, setShowToDatepicker] = useState(false);
  const [toTime, setToTime] = useState(() => {
    const defaultTime = new Date();
    defaultTime.setHours(0, 0, 0);
    return defaultTime;
  });
  const [showToTimepicker, setShowToTimepicker] = useState(false);
  const [skillLevel, setSkillLevel] = useState<number | null>(null);
  const [skillModalVisible, setSkillModalVisible] = useState(false)
  const [details, setDetails] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const { setGroupId, setGroup, currentGroup, currentGroupId } = useGroupStore();
  const [memberLimit, setMemberLimit] = useState(2);
  const [moreModalVisible, setMoreModalVisible] = useState(false);
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedVisibility, setSelectedVisibility] = useState('Public');
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(70);
  const [isIgnoreSkillLevel, setIsIgnoreSkillLevel] = useState(false);
  const [isFriendsOnly, setIsFriendsOnly] = useState(false);
  const [isAutoAccept, setIsAutoAccept] = useState(false);
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(true);

  const modalHeight = useRef(new Animated.Value(300)).current; // Initial height
  const submitOpacity = useRef(new Animated.Value(0)).current;
  const modalAnimation = useRef(new Animated.Value(0)).current;

  const increment = () => setMemberLimit(prev => Math.min(prev + 1, 50)); // Max limit 50
  const decrement = () => setMemberLimit(prev => Math.max(prev - 1, 2)); // Min limit 2

  // const isGroupMember = userData?.groups?.some(
  //   group => group.groupId === currentGroupId && group.role === 'member'
  // );

  const isGroupLeader = userData?.groups?.some(
    group => group.groupId === currentGroupId && group.role === 'leader'
  );


  const handleModalClose = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setSkillLevel(null);
      setSkillModalVisible(false);
    });
  };

  const animatedStyle = {
    opacity: modalAnimation,
    height: modalAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 100],
    }),
  };

  useEffect(() => {
    if (skillModalVisible) {
      Animated.spring(modalAnimation, {
        toValue: 0,
        stiffness: 120,
        damping: 14,
        mass: 1,
        useNativeDriver: false,
      }).start();
    }
  }, [skillModalVisible]);




  useEffect(() => {
    if (isGroupLeader && currentGroup && isEdit) {
      const parseTime = (timeString: string): Date => {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0);
        return date;
      };

      setActivity(currentGroup.activity || '');
      setLocation(currentGroup.location || '');
      setTitle(currentGroup.title || '');
      setFromDate(new Date(currentGroup.fromDate || Date.now()));
      setFromTime(parseTime(currentGroup.fromTime));
      setToDate(new Date(currentGroup.toDate || Date.now()));
      setToTime(parseTime(currentGroup.toTime));
      // setSkillvalue(currentGroup.skillvalue || 1);
      setDetails(currentGroup.details || '');
      setMemberLimit(currentGroup.memberLimit || 2);
      setSelectedGender(currentGroup.gender || "All");
      setSelectedVisibility(currentGroup.visibility || "Public");
      setMinAge(currentGroup.minAge || 18);
      setMaxAge(currentGroup.maxAge || 70);
      setIsIgnoreSkillLevel(currentGroup.isIgnoreSkillLevel || false);
      setIsFriendsOnly(currentGroup.isFriendsOnly || false);
      setIsAutoAccept(currentGroup.isAutoAccept || false);
      setIsVerifiedOnly(currentGroup.isVerifiedOnly || true);
    }
  }, [userData, currentGroup]);



  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const addGroup = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'User is not authenticated.');
      return;
    }

    if (!userData) return

    if (userData?.groups?.length > 3) {
      Toast.show({
        type: 'error',
        text1: 'Group Limit Reached',
        text2: 'You already have 3 groups, which is the maximum allowed.',
      });

    }

    const groupId = firestore().collection('groups').doc().id;
    setGroupId(groupId);
    // Initialize empty members array (only party members will be added)
    let members: Member[] = [];
    let memberUids: string[] = [];

    members.push({
      uid: currentUser.uid,
      firstName: userData?.firstName || 'Unknown',
      lastName: userData?.lastName || 'Unknown',
    });
    memberUids.push(currentUser.uid);

    // If the user is a party leader, fetch all party members
    if (userData?.isPartyLeader) {
      const partyDocRef = firestore().collection('searchParties').doc(currentUser.uid);
      const partyDoc = await partyDocRef.get();

      if (partyDoc.exists()) {
        const partyData = partyDoc.data();
        const partyMembers = partyData?.members || [];

        // Add party members to the group
        partyMembers.forEach((member: any) => {
          members.push({
            uid: member.uid,
            firstName: member.firstName || '',
            lastName: member.lastName || '',
          });
          memberUids.push(member.uid);
        });
        // Remove the `searchParties` document since the leader is starting a group
        await partyDocRef.delete();
        console.log("✅ searchParties entry removed for leader:", currentUser.uid);
      }
    }

    const newGroup = {
      id: groupId,
      activity,
      location,
      title,
      fromDate: fromDate.toISOString(),
      fromTime: formatTime(fromTime),
      toDate: toDate.toISOString(),
      toTime: formatTime(toTime),
      skillLevel,
      memberLimit,
      details,
      createdBy: {
        uid: currentUser.uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
      },
      isDelisted: false,
      gender: selectedGender,
      visibility: selectedVisibility,
      minAge,
      maxAge,
      isIgnoreSkillLevel,
      isFriendsOnly,
      isAutoAccept,
      isVerifiedOnly,
      members,
      memberUids,
      applicants: []
    }


    // await firestore().collection('groups').doc(groupId).set({
    //   activity: activity,
    //   location: location,
    //   title: title,
    //   fromDate: fromDate.toISOString(),
    //   fromTime: formatTime(fromTime),
    //   toDate: toDate.toISOString(),
    //   toTime: formatTime(toTime),
    //   skillLevel: skillLevel,
    //   memberLimit: memberLimit,
    //   details: details,
    //   createdBy: {
    //     uid: currentUser.uid,
    //     firstName: userData.firstName,
    //     lastName: userData.lastName,
    //     // skillLevel: skillLevel
    //   },
    //   // groupId: groupId,
    //   isDelisted: false,
    //   gender: selectedGender,
    //   visibility: selectedVisibility,
    //   minAge: minAge,
    //   maxAge: maxAge,
    //   isIgnoreSkillLevel: isIgnoreSkillLevel,
    //   isFriendsOnly: isFriendsOnly,
    //   isAutoAccept: isAutoAccept,
    //   isVerifiedOnly: isVerifiedOnly,
    //   members: members,
    //   memberUids: memberUids
    // })

    await firestore().collection('groups').doc(groupId).set(newGroup)
    setGroup(newGroup)

    const participantsDetails = members.reduce((acc, member) => {
      acc[member.uid] = {
        firstName: member.firstName,
        lastName: member.lastName,
      };
      return acc;
    }, {} as { [uid: string]: { firstName: string; lastName: string } });

    await firestore().collection('chats').doc(groupId).set({
      isGroup: true,
      activity: activity,
      title: title || '',
      groupId: groupId,
      participants: memberUids,
      participantsDetails: participantsDetails,
      createdAt: firestore.FieldValue.serverTimestamp(),
      lastMessage: {
        text: '',
        createdAt: firestore.FieldValue.serverTimestamp(),
      },
    });

    // ✅ Update each party member to reflect their new group
    const memberUidsExceptLeader = memberUids.filter(uid => uid !== currentUser.uid);

    const updatePromises = memberUidsExceptLeader.map(uid =>
      firestore().collection('users').doc(uid).update({
        selectedGroupId: groupId,
        isPartyMember: false,
        groups: firestore.FieldValue.arrayUnion({
          groupId,
          role: 'member',
          joinedAt: new Date().toISOString(),
        })
      })
    );
    await Promise.all(updatePromises);



    // ✅ Mark the creator as group leader
    await firestore().collection('users').doc(currentUser.uid).update({
      selectedGroupId: groupId,
      isPartyLeader: false,
      groups: firestore.FieldValue.arrayUnion({
        groupId,
        role: 'leader',
        joinedAt: new Date().toISOString(),
      })
    });

    navigate("GroupApp", { screen: 'MyGroupScreen' })

  };

  const editGroup = async () => {
    if (!currentUser) return
    if (!currentGroupId) return

    try {
      const updateData: GroupUpdate = {
        activity,
        location,
        title,
        fromDate: fromDate.toISOString(),
        fromTime: formatTime(fromTime),
        toDate: toDate.toISOString(),
        toTime: formatTime(toTime),
        skillLevel,
        memberLimit,
        details,
        // createdBy: {
        //   uid: currentUser?.uid ?? '',
        //   firstName: userData?.firstName ?? '',
        //   lastName: userData?.lastName ?? '',
        //   skillLevel: skillLevel ?? undefined
        // },
        applicants: [],
        isDelisted: false,
        gender: selectedGender,
        visibility: selectedVisibility,
        minAge,
        maxAge,
        isIgnoreSkillLevel,
        isFriendsOnly,
        isAutoAccept,
        isVerifiedOnly,
      };

      if (activity === 'Custom') {
        (updateData as any).isIgnoreSkillLevel = firestore.FieldValue.delete();
      } else {
        updateData.isIgnoreSkillLevel = isIgnoreSkillLevel;
      }
      // updateData.isIgnoreSkillLevel = isIgnoreSkillLevel;


      await firestore().collection('groups').doc(currentGroupId).update(updateData);

    } catch (error) {
      console.log("Coudn't edit group", error)
    }
    navigate("GroupApp", { screen: "MyGroupScreen" });
  }

  let syncTimeCheck = 0;

  const onChangeFromDate = (
    event: DateTimePickerEvent,
    selectedDate?: Date | undefined,
  ) => {
    const currentDate = selectedDate || fromDate;
    setShowFromDatepicker(Platform.OS === 'ios');
    setFromDate(currentDate);
    syncToDate(currentDate); // Synchronize "To" date when "From" date changes
  };

  const onChangeFromTime = (
    event: DateTimePickerEvent,
    selectedTime?: Date | undefined,
  ) => {
    const currentTime = selectedTime || fromTime;
    setShowFromTimepicker(Platform.OS === 'ios');
    setFromTime(currentTime);
    syncToTime(currentTime); // Synchronize "To" time when "From" time changes
  };

  const onChangeToDate = (
    event: DateTimePickerEvent,
    selectedDate?: Date | undefined,
  ) => {
    const currentDate = selectedDate || toDate;
    setShowToDatepicker(Platform.OS === 'ios');
    setToDate(currentDate);
  };

  const onChangeToTime = (
    event: DateTimePickerEvent,
    selectedTime?: Date | undefined,
  ) => {
    const currentTime = selectedTime || toTime;
    setShowToTimepicker(Platform.OS === 'ios');
    setToTime(currentTime);
    syncTimeCheck = 1;
  };

  const syncToDate = (fromDate: Date) => {
    // Sync "To" date only if it hasn't been manually changed
    if (toDate <= fromDate) {
      const newToDate = new Date(fromDate);
      newToDate.setDate(newToDate.getDate());
      setToDate(newToDate);
    }
  };

  const syncToTime = (fromTime: Date) => {
    // Sync "To" time only if it hasn't been manually changed
    if (syncTimeCheck === 0) {
      const newToTime = new Date(fromTime);
      newToTime.setHours(newToTime.getHours() + 1); // Set "To" time as one hour after "From" time
      setToTime(newToTime);
    }
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      // timeZone: 'Europe/Stockholm'
    };
    return date.toLocaleDateString('sv-SE', options);
  };

  const formatTime = (time: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    };
    return time.toLocaleTimeString('sv-SE', options);
  };

  const getMatchedSkillLevel = (activityName: string): number | undefined => {
    return userData?.skills?.find(
      (s) => s.sport.toLowerCase() === activityName.toLowerCase()
    )?.skillLevel;
  };

  const onActivityChange = (selectedActivity: string) => {
    setActivity(selectedActivity);
    const level = getMatchedSkillLevel(selectedActivity);
    setSkillLevel(level ?? null);
  };



  const addSkillLevel = async () => {
    if (!currentUser) {
      console.log("User not logged in")
      return;
    }

    if (activity !== "Custom") {
      const newSkill = {
        sport: activity.toLowerCase(),
        skillLevel,
      };

      try {
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .update({
            skills: firestore.FieldValue.arrayUnion(newSkill),
          });

      } catch (error) {
        console.error('Error saving user data: ', error);
      }
    }
  };




  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: verticalScale(80) }}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon1 name="arrowleft" size={25} color="white" />
          </TouchableOpacity>
          <View style={styles.spacer} />
          {!isEdit ? (
            <Text style={styles.headerText}>Start a Group</Text>
          ) : (
            <Text style={styles.headerText}>Edit Group</Text>
          )}
          <View style={styles.spacer} />
        </View>
        <View style={styles.bodyContainer}>
          <Text style={styles.bodyLabel}>Activity</Text>
          <SearchableDropdown
            value={activity}
            onChange={onActivityChange}
            options={sportsList.filter(sport => sport.toLowerCase() !== 'any' && sport.toLowerCase() !== 'sports')}
            placeholder="Search for a sport..."
          />
        </View>
        {activity === "Custom" && (
          <View style={styles.bodyContainer}>
            <Text style={styles.bodyLabel}>Title</Text>

            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
            />
          </View>
        )}
        <View style={styles.bodyContainer}>
          <Text style={styles.bodyLabel}>Location</Text>

          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
          />
        </View>
        <View style={styles.bodyContainer}>
          <View style={styles.row}>
            {/* "From" Section */}
            <View style={styles.dateContainer}>
              <Text style={styles.bodyLabel}>From</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowFromDatepicker(true)}>
                <Text style={styles.dateTimeText}>{formatDate(fromDate)}</Text>
              </TouchableOpacity>
              {showFromDatepicker && (
                <DateTimePicker
                  value={fromDate}
                  mode="date"
                  display="default"
                  onChange={onChangeFromDate}
                />
              )}
            </View>
            <View style={styles.timeContainer}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowFromTimepicker(true)}>
                <Text style={styles.dateTimeText}>{formatTime(fromTime)}</Text>
              </TouchableOpacity>
              {showFromTimepicker && (
                <DateTimePicker
                  value={fromTime}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={onChangeFromTime}
                />
              )}
            </View>
          </View>
        </View>
        <View style={styles.bodyContainer}>
          <View style={styles.row}>
            {/* "To" Section */}
            <View style={styles.dateContainer}>
              <Text style={styles.bodyLabel}>To</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowToDatepicker(true)}>
                <Text style={styles.dateTimeText}>{formatDate(toDate)}</Text>
              </TouchableOpacity>
              {showToDatepicker && (
                <DateTimePicker
                  value={toDate}
                  mode="date"
                  display="default"
                  onChange={onChangeToDate}
                />
              )}
            </View>
            <View style={styles.timeContainer}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowToTimepicker(true)}>
                <Text style={styles.dateTimeText}>{formatTime(toTime)}</Text>
              </TouchableOpacity>
              {showToTimepicker && (
                <DateTimePicker
                  value={toTime}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={onChangeToTime}
                />
              )}
            </View>
          </View>
        </View>
        {/* {activity !== "Custom" && (
          <View style={styles.bodyContainer}>
            <View style={styles.bodySkillTitle}>
              <Text style={styles.bodyLabel}>Skill Level</Text>
              <Text style={styles.bodyValueTitle}>{skillvalue}</Text>
              <TouchableOpacity style={styles.infoButton} onPress={skillInfo}>
                <Text style={styles.infoButtonText}>?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sliderContainer}>
              <Slider
                style={{ width: "100%", height: verticalScale(50) }}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={skillvalue}
                onValueChange={setSkillvalue}
                minimumTrackTintColor="#007FFF"
                maximumTrackTintColor="#000000"
                thumbTintColor="#007FFF"
              />
            </View>
          </View>
        )} */}

        <View style={styles.bodyContainer}>
          <View style={styles.row}>
            <Text style={styles.bodyLabel}>Set Member Limit</Text>
            <View style={styles.stepperContainer}>
              <TouchableOpacity style={styles.stepperButton} onPress={decrement}>
                <Text style={styles.stepperButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.memberLimitValue}>{memberLimit}</Text>
              <TouchableOpacity style={styles.stepperButton} onPress={increment}>
                <Text style={styles.stepperButtonText}>+</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>

        <View style={styles.bodyContainer}>
          <Text style={styles.bodyLabel}>Details</Text>
          <TextInput
            style={styles.areaInput}
            multiline={true}
            numberOfLines={3}
            placeholder="More details about your group (optional)"
            placeholderTextColor="gray"
            value={details}
            onChangeText={setDetails}
          />
        </View>
      </ScrollView>
      {!isKeyboardVisible && (
        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.moreOptionBtn} onPress={() => setMoreModalVisible(true)}>
            <Text style={styles.moreOptionText}>More</Text>
          </TouchableOpacity>

          {!isEdit ? (
            <TouchableOpacity style={styles.startGroupBtn} onPress={() => {
              // const level = getMatchedSkillLevel(activity);
              if (!activity.trim() || !location.trim()) {
                Alert.alert("Missing Fields", "Please fill in both activity and location before creating a group.");
                return;
              } else if (activity === 'Custom' || skillLevel !== null || isIgnoreSkillLevel) {
                addGroup();
              } else {
                setSkillModalVisible(true);
              }


            }}
            >
              <Text style={styles.submitBtnText}>Create</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.startGroupBtn} onPress={() => {
              // const level = getMatchedSkillLevel(activity);
              if (!activity.trim() || !location.trim()) {
                Alert.alert("Missing Fields", "Please fill in both activity and location before creating a group.");
                return;
              } else {
                editGroup()
              }
              // } else if (activity === 'Custom' || skillLevel !== null || isIgnoreSkillLevel) {
              //   editGroup();
              // } else {
              //   setSkillModalVisible(true);
              // }


            }}
            >
              <Text style={styles.submitBtnText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <MoreOptionsModal
        visible={moreModalVisible}
        onClose={() => setMoreModalVisible(false)}
        selectedGender={selectedGender}
        setSelectedGender={setSelectedGender}
        selectedVisibility={selectedVisibility}
        setSelectedVisibility={setSelectedVisibility}
        minAge={minAge}
        maxAge={maxAge}
        setMinAge={setMinAge}
        setMaxAge={setMaxAge}
        isIgnoreSkillLevel={isIgnoreSkillLevel}
        setIsIgnoreSkillLevel={setIsIgnoreSkillLevel}
        isFriendsOnly={isFriendsOnly}
        setIsFriendsOnly={setIsFriendsOnly}
        isAutoAccept={isAutoAccept}
        setIsAutoAccept={setIsAutoAccept}
        isVerifiedOnly={isVerifiedOnly}
        setIsVerifiedOnly={setIsVerifiedOnly}
        activity={activity}
      />
      <Modal
        animationType="fade"
        transparent
        visible={skillModalVisible}
        onRequestClose={handleModalClose}
      >
        <TouchableWithoutFeedback onPress={handleModalClose}>
          <View style={styles.modalOverlay}>
            {/* Block closing when clicking inside modal */}
            <TouchableWithoutFeedback onPress={() => { }}>
              {/* <Animated.View style={[styles.modalView, animatedModalStyle]}> */}
              <View style={styles.modalView}>

                <TouchableOpacity
                  style={styles.closeIcon}
                  onPress={handleModalClose}
                >
                  <Text style={styles.closeText}>✖</Text>
                </TouchableOpacity>

                <Text style={styles.modalTitleText}>Set a skill level</Text>

                <View style={styles.setLevelContainer}>
                  <Text style={styles.modalText}>
                    Before creating your group, let us know your skill level for this activity. This helps us match you with others at a similar level.
                  </Text>

                  <StarRating
                    rating={skillLevel ?? 0}
                    onChange={(newRating) => {
                      setSkillLevel(newRating);
                      if (newRating > 0) {
                        Animated.spring(modalAnimation, {
                          toValue: 1,
                          stiffness: 120,
                          damping: 14,
                          mass: 1,
                          useNativeDriver: false,
                        }).start();
                      }
                    }}
                    enableHalfStar={false}
                  />

                  <Text style={styles.modalObervationText}>
                    You can NOT change your skill level later
                  </Text>

                  {skillLevel !== null && skillLevel > 0 && (
                    <Animated.View style={animatedStyle}>
                      <TouchableOpacity
                        style={styles.submitBtnModal}
                        onPress={async () => {
                          await addSkillLevel()
                          setSkillModalVisible(false)
                        }}>
                        <Text style={styles.submitBtnText}>Submit</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                </View>
              </View>

              {/* </Animated.View> */}
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: verticalScale(65),
    backgroundColor: '#5f4c4c',
    padding: scale(15),
    alignItems: 'center',
    flexDirection: "row",
  },
  headerText: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: 'white',
    marginRight: scale(20),
  },
  spacer: {
    flex: 1,
  },
  bodyContainer: {
    borderBottomWidth: 1,
    borderColor: 'grey',
  },
  bodyLabel: {
    marginTop: verticalScale(15),
    paddingLeft: scale(20),
    fontSize: moderateScale(17),
    color: 'grey',
  },
  input: {
    height: verticalScale(50),
    paddingLeft: scale(20),
    fontSize: moderateScale(25),
  },
  areaInput: {
    height: verticalScale(100),
    paddingLeft: scale(20),
    fontSize: moderateScale(20),
    textAlignVertical: 'top',
  },
  activityContainer: {
    borderBottomWidth: 1,
    borderColor: 'grey',
  },
  row: {
    flexDirection: 'row',
  },
  dateContainer: {
    flex: 2,
    borderRightWidth: 1,
    borderColor: 'grey',
  },
  timeContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dateButton: {
    fontSize: moderateScale(25),
    paddingBottom: verticalScale(10),
  },
  timeButton: {
    fontSize: moderateScale(25),
    paddingBottom: verticalScale(10),
  },
  dateTimeText: {
    paddingLeft: scale(20),
    fontSize: moderateScale(25),
    color: 'black',
  },
  valueContainer: {
    position: 'absolute',
    top: '30%',
    padding: moderateScale(10),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 5,
  },
  bodySkillTitle: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingRight: scale(20),
  },
  infoButton: {
    backgroundColor: 'grey',
    marginTop: verticalScale(15),
    width: scale(30),
    paddingVertical: verticalScale(5),
    paddingHorizontal: scale(5),
    alignItems: 'center',
    borderRadius: 5,
  },
  infoButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },
  bodyValueTitle: {
    marginTop: verticalScale(15),
    paddingRight: scale(20),
    fontSize: moderateScale(17),
    color: 'black',
  },
  sliderContainer: {
    marginHorizontal: scale(10)
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: moderateScale(20),
    marginLeft: scale(70)
  },
  stepperButton: {
    width: scale(30),
    height: verticalScale(30),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
    borderRadius: 5
  },
  stepperButtonText: {
    fontSize: moderateScale(20)
  },
  memberLimitValue: {
    fontSize: moderateScale(24),
    marginHorizontal: scale(20)
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: moderateScale(15),
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',

  },
  moreOptionBtn: {
    flex: 1,
    height: verticalScale(50),
    backgroundColor: 'grey',
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: scale(5),
  },
  moreOptionText: {
    fontSize: moderateScale(16),
    color: "white",
    fontWeight: "bold",
  },
  startGroupBtn: {
    flex: 3,
    height: verticalScale(50),
    backgroundColor: '#4CBB17',
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: scale(5)

  },
  submitBtnText: {
    fontSize: moderateScale(16),
    color: "white",
    fontWeight: "bold",
  },
  dropdown: {
    marginTop: verticalScale(5),
    maxHeight: verticalScale(220),
    backgroundColor: 'white',
  },
  dropdownItem: {
    padding: moderateScale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dropdownText: {
    fontSize: moderateScale(16),
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: scale(300),
    padding: scale(20),
    backgroundColor: 'white',
    borderRadius: moderateScale(20),
    alignItems: 'center',
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
  setLevelContainer: {
    alignItems: 'center'
  },
  modalText: {
    marginTop: verticalScale(20),
    fontSize: moderateScale(16),
    color: 'black',
    marginBottom: verticalScale(20),
    textAlign: 'center'
  },
  modalObervationText: {
    fontSize: moderateScale(14),
    color: 'red',
    fontWeight: 'bold',
    marginVertical: verticalScale(10),
  },
  submitBtnModal: {
    // flex: 3,
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(90),
    marginTop: verticalScale(30),
    marginBottom: verticalScale(5),
    backgroundColor: '#4CBB17',
    // justifyContent: "center",
    // alignItems: "center",
    borderRadius: 10,
    // marginHorizontal: scale(5)
  }
});

export default StartGroup;
