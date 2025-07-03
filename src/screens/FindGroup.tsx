import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, Switch, Platform, KeyboardAvoidingView, ImageBackground, ScrollView } from 'react-native';
import React, { useState } from 'react';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Tooltip, { Placement } from "react-native-tooltip-2";

//Components
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

//Icons
import Icon from 'react-native-vector-icons/MaterialIcons';


const FindGroup = () => {
  const [activity, setActivity] = useState('Any');
  const [Location, setLocation] = useState('Close to your location');
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
  const [useSkillLevelFilter, setUseSkillLevelFilter] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const SearchGroup = async () => {
    try {
      const params: { activity: string; date?: string; time?: string; groupSize?: number, ignoreSkillInSearch?: boolean } = {
        activity: activity,
      };

      if (useDateFilter) {
        params.date = fromDate.toISOString();
      }
      if (useTimeFilter) {
        params.time = fromTime.toISOString();
      }
      if (useMemberFilter) {
        params.groupSize = groupSize;
      }
      if (useSkillLevelFilter) {
        params.ignoreSkillInSearch = useSkillLevelFilter;
      }
      console.log("Search...")
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
      <ScrollView
        contentContainerStyle={{ paddingBottom: verticalScale(10) }}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Find a Group</Text>
        </View>

        <View style={styles.bodyContainer}>
          <Text style={styles.bodyTitle}>Activity</Text>
          <SearchableDropdown
            value={activity}
            onChange={(val) => setActivity(val)}
            options={sportsList}
            highlightItems={['any', 'custom', 'sports']}
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
            <View style={styles.groupSizeContainer}>
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
        <View style={[
          styles.bodyContainer,
          !useSkillLevelFilter && { backgroundColor: '#d3d3d3' }
        ]}>
          <View style={styles.row}>
            <View style={styles.skillLevelContainer}>
              <Text style={styles.bodyLabel}>Ignore Skill Level</Text>
              <Tooltip
                isVisible={tooltipVisible}
                placement={Placement.TOP}
                onClose={() => setTooltipVisible(false)}
                displayInsets={{ top: 20, bottom: 20, left: 10, right: 10 }}
                content={
                  <Text style={styles.skillLevelText}>
                    When this is on, you'll only see groups that also disabled the skill rating system — meaning you can match with someone much better or worse than you.
                  </Text>
                }
                arrowSize={{ width: 12, height: 8 }}
                backgroundColor="rgba(0,0,0,0.5)"
              >
                <View style={styles.tooltipBtnContainer}>

                  <TouchableOpacity style={styles.tooltipBtn} onPress={() => setTooltipVisible(true)}>
                    <Icon name="info-outline" size={25} color="white" />
                  </TouchableOpacity>
                </View>

              </Tooltip>
            </View>
            <View style={styles.toggleContainer}>
              <CustomToggle
                label="Time"
                value={useSkillLevelFilter}
                onToggle={(val: boolean) => setUseSkillLevelFilter(val)}
              />
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <MyButton title={'Find a Group'} onPress={SearchGroup} />
        </View>
      </ScrollView>
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
    padding: moderateScale(15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: 'white',
  },
  bodyContainer: {
    borderBottomWidth: 1,
    borderColor: 'grey',
  },
  bodyTitle: {
    marginTop: verticalScale(15),
    paddingLeft: scale(20),
    fontSize: moderateScale(17),
    color: 'grey',
  },
  input: {
    borderBottomColor: 'gray',
    paddingLeft: scale(20),
    fontSize: moderateScale(25),
  },
  activityContainer: {
    borderBottomWidth: 1,
    borderColor: 'grey',
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
  selectedText: {
    marginTop: verticalScale(10),
    fontSize: moderateScale(16),
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  buttonContainer: {
    paddingHorizontal: scale(10),
    marginVertical: verticalScale(10),
  },
  bodyLabel: {
    marginTop: verticalScale(15),
    paddingLeft: scale(20),
    fontSize: moderateScale(17),
    color: 'grey',
  },
  row: {
    flexDirection: 'row',
  },

  dateContainer: {
    flex: 2
  },
  timeContainer: {
    flex: 2

  },
  groupSizeContainer: {
    flex: 2

  },
  skillLevelContainer: {
    flex: 2,
    flexDirection: 'row'
  },
  toggleContainer: {
    justifyContent: 'center',
    marginHorizontal: scale(20),
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
    paddingHorizontal: scale(20),
    fontSize: moderateScale(25),
    color: 'black',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: moderateScale(12),
  },
  stepperButton: {
    width: scale(30),
    height: scale(30),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#36454F',
    borderRadius: moderateScale(5),
    marginHorizontal: scale(8),
  },
  stepperButtonText: {
    fontSize: moderateScale(20),
    color: 'white',
  },
  memberLimitValue: {
    fontSize: moderateScale(24),
    marginHorizontal: scale(20),
  },
  skillLevelText: {
    maxWidth: scale(220),
    padding: moderateScale(10)
  },
  tooltipBtnContainer: {
  },
  tooltipBtn: {
    fontSize: moderateScale(14),
    marginHorizontal: scale(20),
    marginVertical: verticalScale(12),
    padding: moderateScale(5),
    borderRadius: 5,
    backgroundColor: '#36454F',
  }
});


export default FindGroup;
