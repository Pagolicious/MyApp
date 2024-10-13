import { View, Text, StyleSheet, TextInput, Platform, TouchableOpacity, ScrollView, Alert, Pressable } from 'react-native'
import React, { useState, useContext } from 'react'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';


//Navigation
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from '../App'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

//Components
import MyButton from '../components/MyButton'

//Firebase
import firestore from '@react-native-firebase/firestore'

// AuthContext
import { useAuth } from '../context/AuthContext'


const StartGroup = () => {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const { currentUser } = useAuth();

  const [activity, setActivity] = useState('')
  const [location, setLocation] = useState('')
  const [fromDate, setFromDate] = useState(new Date())
  const [showFromDatepicker, setShowFromDatepicker] = useState(false)
  const [fromTime, setFromTime] = useState(() => {
    const defaultTime = new Date()
    defaultTime.setHours(0, 0, 0)
    return defaultTime
  });
  const [showFromTimepicker, setShowFromTimepicker] = useState(false)

  const [toDate, setToDate] = useState(new Date())
  const [showToDatepicker, setShowToDatepicker] = useState(false)
  const [toTime, setToTime] = useState(() => {
    const defaultTime = new Date()
    defaultTime.setHours(0, 0, 0)
    return defaultTime
  });
  const [showToTimepicker, setShowToTimepicker] = useState(false)
  const [skillvalue, setSkillvalue] = useState(0)
  const [details, setDetails] = useState('')

  const addGroup = () => {
    if (!currentUser) {
      Alert.alert('Error', 'User is not authenticated.')
      return
    }
    const groupId = firestore().collection("groups").doc().id

    firestore()
      .collection("groups")
      .doc(groupId)
      .set({
        activity: activity,
        location: location,
        fromDate: formatDate(fromDate),
        fromTime: formatTime(fromTime),
        toDate: formatDate(toDate),
        toTime: formatTime(toTime),
        skillvalue: skillvalue,
        details: details,
        createdBy: currentUser.uid,
        groupId: groupId
      })
      .then(() => {
        Alert.alert('Group Submitted');
        navigation.navigate("MyGroupScreen");
      })
      .catch((error) => {
        Alert.alert('Error submitting group', error.message)
      });
  }

  let syncTimeCheck = 0

  const onChangeFromDate = (event: DateTimePickerEvent, selectedDate?: Date | undefined) => {
    const currentDate = selectedDate || fromDate
    setShowFromDatepicker(Platform.OS === 'ios')
    setFromDate(currentDate)
    syncToDate(currentDate) // Synchronize "To" date when "From" date changes

  };

  const onChangeFromTime = (event: DateTimePickerEvent, selectedTime?: Date | undefined) => {
    const currentTime = selectedTime || fromTime
    setShowFromTimepicker(Platform.OS === 'ios')
    setFromTime(currentTime)
    syncToTime(currentTime) // Synchronize "To" time when "From" time changes

  };

  const onChangeToDate = (event: DateTimePickerEvent, selectedDate?: Date | undefined) => {
    const currentDate = selectedDate || toDate
    setShowToDatepicker(Platform.OS === 'ios')
    setToDate(currentDate);
  };

  const onChangeToTime = (event: DateTimePickerEvent, selectedTime?: Date | undefined) => {
    const currentTime = selectedTime || toTime
    setShowToTimepicker(Platform.OS === 'ios')
    setToTime(currentTime)
    syncTimeCheck = 1
  };

  const syncToDate = (fromDate: Date) => {
    // Sync "To" date only if it hasn't been manually changed
    if (toDate <= fromDate) {
      const newToDate = new Date(fromDate)
      newToDate.setDate(newToDate.getDate())
      setToDate(newToDate)
    }
  };

  const syncToTime = (fromTime: Date) => {
    // Sync "To" time only if it hasn't been manually changed
    if (syncTimeCheck === 0) {
      const newToTime = new Date(fromTime);
      newToTime.setHours(newToTime.getHours() + 1) // Example: Set "To" time as one hour after "From" time
      setToTime(newToTime)
    }
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      // timeZone: 'Europe/Stockholm'

    };
    return date.toLocaleDateString('sv-SE', options)
  };

  const formatTime = (time: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,

    };
    return time.toLocaleTimeString('sv-SE', options)
  };



  const skillInfo = () => {
    Alert.alert('Button Pressed!')
  };


  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Start a Group</Text>
        </View>
        <View style={styles.bodyContainer}>
          <Text style={styles.bodyLabel}>Acticity</Text>
          <TextInput
            style={styles.input}
            placeholder="Tennis"
            value={activity}
            onChangeText={setActivity}
          />
        </View>
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
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowFromDatepicker(true)}>
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
              <TouchableOpacity style={styles.timeButton} onPress={() => setShowFromTimepicker(true)}>
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
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowToDatepicker(true)}>
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
              <TouchableOpacity style={styles.timeButton} onPress={() => setShowToTimepicker(true)}>
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
        <View style={styles.bodyContainer}>
          <View style={styles.bodySkillTitle}>
            <Text style={styles.bodyLabel}>Skill Level</Text>
            <Text style={styles.bodyValueTitle}>{skillvalue}</Text>
            <TouchableOpacity style={styles.infoButton} onPress={skillInfo}>
              <Text style={styles.infoButtonText}>?</Text>
            </TouchableOpacity>
          </View>
          <Slider
            style={{ width: 400, height: 50 }}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={skillvalue}
            onValueChange={setSkillvalue}
            minimumTrackTintColor="red"
            maximumTrackTintColor="#000000"
            thumbTintColor="red"
          />
        </View>
        <View style={styles.bodyContainer}>
          <Text style={styles.bodyLabel}>Details</Text>
          <TextInput
            style={styles.areaInput}
            multiline={true}
            numberOfLines={3}
            placeholder="More details about your group (optional)"
            value={details}
            onChangeText={setDetails}
          />
        </View>
        <MyButton title={"Start a Group"} onPress={addGroup} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 150,
    backgroundColor: "lightblue",
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black"
  },
  bodyContainer: {
    borderBottomWidth: 1,
    borderColor: "grey"
  },
  bodyLabel: {
    marginTop: 15,
    paddingLeft: 20,
    fontSize: 17,
    color: "grey",
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
    textAlignVertical: 'top'
  },
  activityContainer: {
    borderBottomWidth: 1,
    borderColor: "grey"
  },
  row: {
    flexDirection: "row",
  },
  dateContainer: {
    flex: 2,
    borderRightWidth: 1,
    borderColor: "grey"
  },
  timeContainer: {
    flex: 1,
    justifyContent: "flex-end"
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
    color: "black",
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
    flexDirection: "row",
    paddingRight: 20,
  },
  infoButton: {
    backgroundColor: 'grey',
    marginTop: 15,
    width: 30,
    paddingVertical: 5,
    paddingHorizontal: 5,
    alignItems: "center",
    borderRadius: 5,
  },
  infoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bodyValueTitle: {
    marginTop: 15,
    paddingRight: 55,
    fontSize: 17,
    color: "black",
  },
})

export default StartGroup
