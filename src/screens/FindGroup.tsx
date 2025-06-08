import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, Switch, Platform, KeyboardAvoidingView, ImageBackground } from 'react-native';
import React, { useState, useEffect, useReducer } from 'react';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
// import SwitchToggle from "react-native-switch-toggle";

//Navigation
import { RootStackParamList } from '../utils/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

//Components
import GroupNav from '../components/GroupNav';
import GroupMemberNav from '../components/GroupMemberNav';
import FooterNav from '../components/FooterNav';
import FooterGroupNav from '../components/FooterGroupNav';
import MyButton from '../components/MyButton';
import SearchableDropdown from '../components/SearchableDropdown';
import CustomToggle from '../components/CustomToggle';

//Assets
import sportsList from "../assets/JsonFiles/sportsList.json"

//Contexts
import { useGroup } from '../context/GroupContext';
import { useAuth } from '../context/AuthContext';

//Services
import { navigate } from '../services/NavigationService';

// type FindGroupsProps = NativeStackScreenProps<RootStackParamList, 'GroupsScreen'>;

const FindGroup = () => {
  // const [query, setQuery] = useState('Any');
  const [filteredSports, setFilteredSports] = useState(sportsList);
  const [activity, setActivity] = useState('Any');
  const [showDropdown, setShowDropdown] = useState(false);
  const [Location, setLocation] = useState('Close to your location');
  // const [userHasGroup, setUserHasGroup] = useState(false);
  const { currentGroup } = useGroup()
  const { currentUser, userData } = useAuth()
  const [fromDate, setFromDate] = useState(new Date());
  const [showFromDatepicker, setShowFromDatepicker] = useState(false);
  const [fromTime, setFromTime] = useState(() => {
    const defaultTime = new Date();
    defaultTime.setHours(0, 0, 0);
    return defaultTime;
  });
  const [showFromTimepicker, setShowFromTimepicker] = useState(false);
  const [useDateFilter, setUseDateFilter] = useState(false);
  const [useTimeFilter, setUseTimeFilter] = useState(false);
  const [useMemberFilter, setUseMemberFilter] = useState(false);
  const [groupSize, setGroupSize] = useState(2);




  // const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  // const navigation =
  //   useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // useEffect(() => {
  //   if (currentUser) {
  //     setUserHasGroup(currentGroup?.createdBy === currentUser.uid);
  //   }
  // })

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

  const SearchGroup = async () => {
    try {
      const params: { activity: string; date?: string; time?: string; groupSize?: number } = {
        activity: activity,
      };

      if (useDateFilter) {
        params.date = fromDate.toISOString(); // or formatDate(fromDate)
      }

      if (useTimeFilter) {
        params.time = fromTime.toISOString(); // or formatTime(fromTime)
      }

      if (useMemberFilter) {
        params.groupSize = groupSize;
      }

      navigate('GroupsScreen', params);
    } catch (error) {
      const errorMessage =
        (error as { message?: string }).message || 'An unknown error occurred';
      Alert.alert(errorMessage);
    }
  };

  const onChangeFromDate = (
    event: DateTimePickerEvent,
    selectedDate?: Date | undefined,
  ) => {
    const currentDate = selectedDate || fromDate;
    setShowFromDatepicker(Platform.OS === 'ios');
    setFromDate(currentDate);

    // Check if the selected date is different from the default
    const today = new Date();
    if (
      currentDate.getFullYear() !== today.getFullYear() ||
      currentDate.getMonth() !== today.getMonth() ||
      currentDate.getDate() !== today.getDate()
    ) {
      setUseDateFilter(true);
    }
  };

  const onChangeFromTime = (
    event: DateTimePickerEvent,
    selectedTime?: Date | undefined,
  ) => {
    const currentTime = selectedTime || fromTime;
    setShowFromTimepicker(Platform.OS === 'ios');
    setFromTime(currentTime);

    if (currentTime.getHours() !== 0 || currentTime.getMinutes() !== 0) {
      setUseTimeFilter(true);
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

  const increment = () => {
    setGroupSize(prev => Math.min(prev + 1, 50)); // Max limit 50
    setUseMemberFilter(true)
  }
  const decrement = () => {
    setGroupSize(prev => Math.max(prev - 1, 2)); // Min limit 2
    setUseMemberFilter(true)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >

      <View style={styles.header}>
        <Text style={styles.headerText}>Find a Group</Text>
      </View>
      {/* {userHasGroup ? <GroupNav /> : null}
      {userInGroup ? <GroupMemberNav /> : null} */}
      <ImageBackground
        source={require('../assets/BackgroundImages/whiteBackground.jpg')} // Path to your background image
        style={styles.backgroundImage} // Style for the background image
      >
        {/* <View style={styles.bodyContainer}>
          <Text style={styles.bodyTitle}>Activity</Text>
          <TextInput
            style={styles.input}
            value={activity}
            onChangeText={handleSearch}
            onFocus={() => setShowDropdown(true)} // Show dropdown when focused
          />
          {showDropdown && (

            <FlatList
              style={styles.dropdown}
              data={filteredSports}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.dropdownText}>{item}</Text>
                </TouchableOpacity>
              )}
            />

          )}
        </View> */}
        <View style={styles.bodyContainer}>
          <Text style={styles.bodyTitle}>Activity</Text>
          <SearchableDropdown
            value={activity}
            onChange={(val) => setActivity(val)}
            options={sportsList}
            placeholder="Search for a sport..."
          />
        </View>
        <View style={styles.bodyContainer}>
          <Text style={styles.bodyTitle}>Location</Text>

          <TextInput
            style={styles.input}
            value={Location}
            onChangeText={setLocation}
          />
        </View>
        <View style={[
          styles.bodyContainer,
          !useDateFilter && { backgroundColor: '#d3d3d3' }
        ]}>
          <View style={styles.row}>
            <View style={styles.dateContainer}>
              <Text style={styles.bodyLabel}>Date</Text>
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
            <View style={styles.toggleContainer}>
              <CustomToggle
                label="Date"
                value={useDateFilter}
                onToggle={(val: boolean) => setUseDateFilter(val)}
              />
            </View>
          </View>
        </View>
        <View style={[
          styles.bodyContainer,
          !useTimeFilter && { backgroundColor: '#d3d3d3' }
        ]}>
          <View style={styles.row}>
            <View style={styles.timeContainer}>
              <Text style={styles.bodyLabel}>Time</Text>
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
            <View style={styles.toggleContainer}>
              <CustomToggle
                label="Time"
                value={useTimeFilter}
                onToggle={(val: boolean) => setUseTimeFilter(val)}
              />
            </View>
          </View>
        </View>
        <View style={[
          styles.bodyContainer,
          !useMemberFilter && { backgroundColor: '#d3d3d3' }
        ]}>
          <View style={styles.row}>
            <View style={styles.timeContainer}>
              <Text style={styles.bodyLabel}>Group Size</Text>
              <View style={styles.row}>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity style={styles.stepperButton} onPress={decrement}>
                    <Text style={styles.stepperButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.memberLimitValue}>{groupSize}</Text>
                  <TouchableOpacity style={styles.stepperButton} onPress={increment}>
                    <Text style={styles.stepperButtonText}>+</Text>
                  </TouchableOpacity>
                  {/* </View> */}
                </View>

              </View>
            </View>
            <View style={styles.toggleContainer}>
              <CustomToggle
                label="Time"
                value={useMemberFilter}
                onToggle={(val: boolean) => setUseMemberFilter(val)}
              />
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <MyButton title={'Find a Group'} onPress={SearchGroup} />
        </View>
      </ImageBackground>

      {/* {(userData?.isGroupLeader || userData?.isGroupMember) && <FooterGroupNav />} */}
      {/* {(!userData?.isGroupLeader && !userData?.isGroupMember) && <FooterNav />} */}

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
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  bodyContainer: {
    borderBottomWidth: 1,
    borderColor: 'grey',

  },
  bodyTitle: {
    marginTop: 15,
    paddingLeft: 20,
    fontSize: 17,
    color: 'grey',
  },
  input: {
    borderBottomColor: 'gray',
    paddingLeft: 20,
    fontSize: 25,
  },
  activityContainer: {
    borderBottomWidth: 1,
    borderColor: 'grey',
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
  selectedText: {
    marginTop: 10,
    fontSize: 16,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover"
  },
  buttonContainer: {
    paddingHorizontal: 10,
    marginVertical: 10
  },
  bodyLabel: {
    marginTop: 15,
    paddingLeft: 20,
    fontSize: 17,
    color: 'grey',
  },
  row: {
    flexDirection: 'row',
  },
  dateContainer: {
    flex: 2,
    // borderRightWidth: 1,
    borderColor: 'grey',
  },
  timeContainer: {
    flex: 2,
    // justifyContent: 'flex-end',
  },
  toggleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: "center"
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
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
  },
  stepperButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#36454F',
    borderRadius: 5,
    marginLeft: 8

  },
  stepperButtonText: {
    fontSize: 20,
    color: "white"

  },
  memberLimitValue: {
    fontSize: 24, marginHorizontal: 20
  },
});

export default FindGroup;
