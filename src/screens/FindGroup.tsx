import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, PermissionsAndroid, Platform, KeyboardAvoidingView, ImageBackground, ScrollView, Keyboard } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Tooltip, { Placement } from "react-native-tooltip-2";
import Geolocation from 'react-native-geolocation-service';
import type { GeoPosition } from 'react-native-geolocation-service';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigationStore } from '../stores/navigationStore';

//Components
import MyButton from '../components/MyButton';
import SearchableDropdown from '../components/SearchableDropdown';
import CustomToggle from '../components/CustomToggle';

//Assets
import sportsList from "../assets/JsonFiles/sportsList.json"

//Contexts
// import { useGroup } from '../context/GroupContext';
import { useAuth } from '../context/AuthContext';

//Services
import { navigate } from '../services/NavigationService';

//Icons
import Icon from 'react-native-vector-icons/MaterialIcons';

//Types
// import { GeoPosition } from '../types/apiTypes';
import { RootStackParamList } from '../utils/types';
import { LocationParam } from '../types/apiTypes';

type FindGroupRouteProp = RouteProp<RootStackParamList, 'FindGroup'>;

const route: FindGroupRouteProp = useRoute();

const FindGroup = () => {
  const route = useRoute<FindGroupRouteProp>();
  const routeLocation = route?.params?.location ?? '';

  const [activity, setActivity] = useState('Any');
  const [location, setLocation] = useState<LocationParam | null>(
    typeof routeLocation === 'object' && routeLocation !== null
      ? routeLocation as LocationParam
      : null
  ); const [fromDate, setFromDate] = useState(new Date());
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

  useFocusEffect(
    useCallback(() => {
      Keyboard.dismiss();
    }, [])
  );


  useEffect(() => {
    if (route.params?.location) {
      setLocation(route.params.location);
    }
  }, [route.params]);




  // const SearchGroup = async () => {
  //   try {
  //     const params: { activity: string; date?: string; time?: string; groupSize?: number, ignoreSkillInSearch?: boolean } = {
  //       activity: activity,
  //     };

  //     if (useDateFilter) {
  //       params.date = fromDate.toISOString();
  //     }
  //     if (useTimeFilter) {
  //       params.time = fromTime.toISOString();
  //     }
  //     if (useMemberFilter) {
  //       params.groupSize = groupSize;
  //     }
  //     if (useSkillLevelFilter) {
  //       params.ignoreSkillInSearch = useSkillLevelFilter;
  //     }
  //     console.log("Search...")
  //     navigate('GroupsScreen', params);
  //   } catch (error) {
  //     const errorMessage =
  //       (error as { message?: string }).message || 'An unknown error occurred';
  //     Alert.alert(errorMessage);
  //   }
  // };

  const SearchGroup = async () => {
    let coordinates;

    if (!location || !activity) {
      Alert.alert("Missing Fields", "Please fill in both activity and location before searching.")
      return
    }

    if (location?.name === 'Location near you' && !location.coordinates) {
      // Get fresh coordinates again only if not already set

      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      if (permission === PermissionsAndroid.RESULTS.GRANTED) {
        try {
          const position = await new Promise<GeoPosition>((resolve, reject) =>
            Geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 10000,
            })
          );
          coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        } catch (error: any) {
          Alert.alert("Location Error", error.message || "Failed to get location.");
          return;
        }
      }
    }

    const params = {
      activity,
      location,
      // ...(coordinates && { coordinates }),
      ...(useDateFilter && { date: fromDate.toISOString() }),
      ...(useTimeFilter && { time: fromTime.toISOString() }),
      ...(useMemberFilter && { groupSize }),
      ...(useSkillLevelFilter && { ignoreSkillInSearch: true }),
    };
    navigate('GroupsScreen', params);
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
        contentContainerStyle={styles.content}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >

        <View style={[styles.bodyContainer, { borderBottomColor: '#ddd' }]}>
          <Text style={styles.bodyTitle}>Activity</Text>
          <SearchableDropdown
            value={activity}
            onChange={(val) => setActivity(val)}
            options={sportsList}
            highlightItems={['any', 'custom', 'sports']}
          />
        </View>
        <View style={[styles.bodyContainer, { borderBottomColor: '#ddd' }]}>
          <Text style={styles.bodyTitle}>Location</Text>

          <TouchableOpacity
            onPress={() => {
              navigate('LocationSearchScreen', {
                previousActivity: activity,
                fromScreen: 'FindGroup'
              });
              // setLocation('Location near you'); // Optional: update UI immediately
            }}
          >
            <TextInput
              style={styles.input}
              value={location?.name}
              editable={false}
              pointerEvents="none"
              placeholder='Search Location...'
              placeholderTextColor={'grey'}
            />
          </TouchableOpacity>

        </View>
        <View style={[
          styles.bodyContainer,
          {
            borderBottomColor: useDateFilter ? '#ddd' : '#fff' // ✅ Dynamic color
          },
          !useDateFilter && { backgroundColor: '#e0e0e0' }
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
          {
            borderBottomColor: useTimeFilter ? '#ddd' : '#fff' // ✅ Dynamic color
          },
          !useTimeFilter && { backgroundColor: '#e0e0e0' }
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
          {
            borderBottomColor: useMemberFilter ? '#ddd' : '#fff' // ✅ Dynamic color
          },
          !useMemberFilter && { backgroundColor: '#e0e0e0' }
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
                label="Member"
                value={useMemberFilter}
                onToggle={(val: boolean) => setUseMemberFilter(val)}
              />
            </View>
          </View>
        </View>
        <View style={[styles.bottomBodyContainer,
        !useSkillLevelFilter && { backgroundColor: '#e0e0e0' }
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
                    <Icon name="info-outline" size={22} color="white" />
                  </TouchableOpacity>
                </View>

              </Tooltip>
            </View>
            <View style={styles.toggleContainer}>
              <CustomToggle
                label="Skill Level"
                value={useSkillLevelFilter}
                onToggle={(val: boolean) => setUseSkillLevelFilter(val)}
              />
            </View>
          </View>
        </View>


      </ScrollView>
      <View style={styles.buttonContainer}>
        <MyButton title={'Find a Group'} onPress={SearchGroup} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    margin: moderateScale(20),
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
    // overflow: 'hidden',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android shadow
    elevation: 3,
  },
  bodyContainer: {
    borderBottomWidth: 1,
    backgroundColor: '#fff'
    // borderColor: 'grey',
    // margin: 20,

  },
  bottomBodyContainer: {
    backgroundColor: '#fff'

  },
  bodyTitle: {
    marginTop: verticalScale(15),
    paddingLeft: scale(20),
    fontSize: moderateScale(13),
    color: 'grey',
  },
  input: {
    borderBottomColor: 'gray',
    paddingLeft: scale(20),
    fontSize: moderateScale(20),
  },
  buttonContainer: {
    paddingHorizontal: scale(10),
    marginVertical: verticalScale(10),
  },
  bodyLabel: {
    marginTop: verticalScale(15),
    paddingLeft: scale(20),
    fontSize: moderateScale(13),
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
    // fontSize: moderateScale(25),
    paddingBottom: verticalScale(10),
  },
  timeButton: {
    // fontSize: moderateScale(25),
    paddingBottom: verticalScale(10),
  },
  dateTimeText: {
    paddingHorizontal: scale(20),
    fontSize: moderateScale(20),
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
    fontSize: moderateScale(20),
    marginHorizontal: scale(20),
  },
  skillLevelText: {
    maxWidth: scale(220),
    padding: moderateScale(10)
  },
  tooltipBtnContainer: {
  },
  tooltipBtn: {
    // fontSize: moderateScale(12),
    marginHorizontal: scale(20),
    marginVertical: verticalScale(13),
    padding: moderateScale(3),
    borderRadius: 5,
    backgroundColor: '#36454F',
  }
});


export default FindGroup;
