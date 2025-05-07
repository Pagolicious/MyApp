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
  FlatList
} from 'react-native';
import React, { useState, useEffect } from 'react';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
// import { Picker } from '@react-native-picker/picker';

//Navigation
import { RootStackParamList } from '../utils/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

//Components
import MyButton from '../components/MyButton';
import SearchableDropdown from '../components/SearchableDropdown';

//Assets
import sportsList from "../assets/JsonFiles/sportsList.json"

//Firebase
import firestore from '@react-native-firebase/firestore';

// Context
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';

//Services
import { navigate } from '../services/NavigationService';

//Icons
import Icon1 from 'react-native-vector-icons/AntDesign';
// import Icon2 from 'react-native-vector-icons/Entypo';

//Types
import { Member } from '../types/groupTypes';


// interface Member {
//   uid: string;
//   firstName: string;
//   lastName: string
// }

const StartGroup = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
  const [skillvalue, setSkillvalue] = useState(0);
  const [details, setDetails] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const { setCurrentGroupId, currentGroup, currentGroupId } = useGroup();
  const [memberLimit, setMemberLimit] = useState(1);
  // const [showDropdown, setShowDropdown] = useState(false);
  // const [filteredSports, setFilteredSports] = useState(sportsList);


  const increment = () => setMemberLimit(prev => Math.min(prev + 1, 50)); // Max limit 50
  const decrement = () => setMemberLimit(prev => Math.max(prev - 1, 1)); // Min limit 1

  useEffect(() => {
    if (userData?.isGroupLeader && currentGroup) {
      const parseTime = (timeString: string): Date => {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0);
        return date;
      };

      setActivity(currentGroup.activity || '');
      setLocation(currentGroup.location || '');
      setFromDate(new Date(currentGroup.fromDate || Date.now()));
      setFromTime(parseTime(currentGroup.fromTime));
      setToDate(new Date(currentGroup.toDate || Date.now()));
      setToTime(parseTime(currentGroup.toTime));
      setSkillvalue(currentGroup.skillvalue || 0);
      setDetails(currentGroup.details || '');
      setMemberLimit(currentGroup.memberLimit || 1);
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

    if (!activity.trim() || !location.trim()) {
      Alert.alert("Missing Fields", "Please fill in both activity and location before creating a group.");
      return;
    }

    if (userData?.isGroupLeader) {
      return
    }
    const groupId = firestore().collection('groups').doc().id;
    setCurrentGroupId(groupId);

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

      if (partyDoc.exists) {
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
        // ✅ Remove the `searchParties` document since the leader is starting a group
        await partyDocRef.delete();
        console.log("✅ searchParties entry removed for leader:", currentUser.uid);
      }
    }

    await firestore().collection('groups').doc(groupId).set({
      activity: activity,
      location: location,
      title: title,
      fromDate: fromDate.toISOString().split('T')[0],
      fromTime: formatTime(fromTime),
      toDate: toDate.toISOString().split('T')[0],
      toTime: formatTime(toTime),
      skillvalue: skillvalue,
      memberLimit: memberLimit,
      details: details,
      createdBy: currentUser.uid,
      groupId: groupId,
      isDelisted: false,
      members: members,
      memberUids: memberUids
    })

    // ✅ Update each party member to reflect their new group
    const memberUidsExceptLeader = memberUids.filter(uid => uid !== currentUser.uid);

    const updatePromises = memberUidsExceptLeader.map(uid =>
      firestore().collection('users').doc(uid).update({
        groupId: groupId,
        isGroupMember: true,
        isPartyMember: false
      })
    );
    await Promise.all(updatePromises);



    // ✅ Mark the creator as group leader
    await firestore().collection('users').doc(currentUser.uid).update({
      groupId: groupId,
      isGroupLeader: true,
      isPartyLeader: false
    });

    navigate("GroupApp", { screen: 'MyGroupScreen' })

  };

  const editGroup = async () => {
    if (!currentUser) return

    try {
      await firestore().collection('groups').doc(currentGroupId).update({
        activity: activity,
        location: location,
        title: title,
        fromDate: fromDate.toISOString().split('T')[0],
        fromTime: formatTime(fromTime),
        toDate: toDate.toISOString().split('T')[0],
        toTime: formatTime(toTime),
        skillvalue: skillvalue,
        memberLimit: memberLimit,
        details: details,
        applicants: [],
        isDelisted: false
      })
    } catch (error) {
      console.log("Coudn't edit group", error)
    }
    navigate("GroupApp", { screen: 'MyGroupScreen' })
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
      newToTime.setHours(newToTime.getHours() + 1); // Example: Set "To" time as one hour after "From" time
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

  const skillInfo = () => {
    Alert.alert('Button Pressed!');
  };

  // const dismissKeyboard = () => {
  //   Keyboard.dismiss();
  // };

  // const handleSearch = (text: string) => {
  //   setActivity(text);

  //   if (text === '') {
  //     setFilteredSports(sportsList); // Show all options if search is empty
  //     setShowDropdown(false); // Hide dropdown
  //   } else {
  //     const filtered = sportsList.filter((sport) =>
  //       sport.toLowerCase().includes(text.toLowerCase())
  //     );
  //     setFilteredSports(filtered);
  //     setShowDropdown(true);
  //   }
  // };

  // const handleSelect = (sport: string) => {
  //   // setActivity(sport);
  //   setActivity(sport); // Update the search bar with the selected sport
  //   setShowDropdown(false); // Hide dropdown
  // };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon1 name="arrowleft" size={25} color="white" />
          </TouchableOpacity>
          <View style={styles.spacer} />
          {!userData?.isGroupLeader ? (
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
            onChange={(val) => setActivity(val)}
            options={sportsList.filter(sport => sport.toLowerCase() !== 'any')}
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
        {activity !== "Custom" && (
          <View style={styles.bodyContainer}>
            {/* <View style={styles.row}> */}
            {/* <View style={styles.skillLevelContainer}> */}
            <View style={styles.bodySkillTitle}>
              <Text style={styles.bodyLabel}>Skill Level</Text>
              <Text style={styles.bodyValueTitle}>{skillvalue}</Text>
              <TouchableOpacity style={styles.infoButton} onPress={skillInfo}>
                <Text style={styles.infoButtonText}>?</Text>
              </TouchableOpacity>
            </View>
            <Slider
              style={{ width: "100%", height: 50 }}
              minimumValue={0}
              maximumValue={5}
              step={1}
              value={skillvalue}
              onValueChange={setSkillvalue}
              minimumTrackTintColor="red"
              maximumTrackTintColor="#000000"
              thumbTintColor="red"
            />
            {/* </View> */}

            {/* </View> */}
          </View>
        )}

        <View style={styles.bodyContainer}>
          {/* <View style={styles.memberNeededContainer}> */}
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
              {/* </View> */}
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
          <TouchableOpacity style={styles.moreOptionBtn} onPress={() => console.log("More")}>
            <Text style={styles.moreOptionText}>More</Text>
          </TouchableOpacity>

          {!userData?.isGroupLeader ? (
            <TouchableOpacity style={styles.startGroupBtn} onPress={addGroup}>
              <Text style={styles.startGroupText}>Create</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.startGroupBtn} onPress={editGroup}>
              <Text style={styles.startGroupText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

    </KeyboardAvoidingView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 65,
    backgroundColor: '#5f4c4c',
    padding: 15,
    // justifyContent: "space-between",
    alignItems: 'center',
    flexDirection: "row",
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    // marginLeft: 'auto',
    marginRight: 20,
  },
  spacer: {
    flex: 1,
  },
  bodyContainer: {
    borderBottomWidth: 1,
    borderColor: 'grey',
  },
  bodyLabel: {
    marginTop: 15,
    paddingLeft: 20,
    fontSize: 17,
    color: 'grey',
  },
  input: {
    height: 50,
    paddingLeft: 20,
    fontSize: 25,
  },
  areaInput: {
    height: 100,
    paddingLeft: 20,
    fontSize: 20,
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
    fontSize: 25,
    paddingBottom: 10,
  },
  timeButton: {
    fontSize: 25,
    paddingBottom: 10,
  },
  dateTimeText: {
    paddingLeft: 20,
    fontSize: 25,
    color: 'black',
  },
  valueContainer: {
    position: 'absolute',
    top: '30%',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 5,
  },
  bodySkillTitle: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingRight: 20,
  },
  infoButton: {
    backgroundColor: 'grey',
    marginTop: 15,
    width: 30,
    paddingVertical: 5,
    paddingHorizontal: 5,
    alignItems: 'center',
    borderRadius: 5,
  },
  infoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bodyValueTitle: {
    marginTop: 15,
    paddingRight: 20,
    fontSize: 17,
    color: 'black',
  },
  // skillLevelContainer: {
  // flex: 1,
  // borderRightWidth: 1,
  // borderColor: 'grey',
  // },
  // memberNeededContainer: {
  //   flex: 1,
  //   justifyContent: 'flex-end',
  // },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    // borderWidth: 1,
    margin: 20,
    marginLeft: 100
  },
  stepperButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
    borderRadius: 5
  },
  stepperButtonText: {
    fontSize: 20
  },
  memberLimitValue: {
    fontSize: 24, marginHorizontal: 20
  },
  footerContainer: {
    // flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    // margin: 10,
    padding: 15,
    // backgroundColor: '#5f4c4c',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent', // Transparent background

  },
  // exitBtn: {
  //   width: 80,
  //   height: 60,
  //   backgroundColor: '#5f4c4c',
  // },
  moreOptionBtn: {
    flex: 1,
    // width: 100,
    height: 60,
    backgroundColor: 'grey',
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 5,

  },
  moreOptionText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  startGroupBtn: {
    flex: 3,
    // width: 280,
    height: 60,
    backgroundColor: '#4CBB17',
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 5,

  },
  startGroupText: {
    fontSize: 16,
    color: "black",
    fontWeight: "bold",
  },
  dropdown: {
    marginTop: 5,
    maxHeight: 220, // Limit height of dropdown for scrolling
    // borderWidth: 1,
    // borderColor: 'gray',
    // borderRadius: 5,
    backgroundColor: 'white',
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dropdownText: {
    fontSize: 16,
  },
});

export default StartGroup;
