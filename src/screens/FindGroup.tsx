import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, FlatList, Platform, KeyboardAvoidingView } from 'react-native';
import React, { useState, useEffect, useReducer } from 'react';

//Navigation
import { RootStackParamList } from '../App';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

//Components
import GroupNav from '../components/GroupNav';
import GroupMemberNav from '../components/GroupMemberNav';
import FooterNav from '../components/FooterNav';
import FooterGroupNav from '../components/FooterGroupNav';
import MyButton from '../components/MyButton';

//Assets
import sportsList from "../assets/JsonFiles/sportsList.json"

//Contexts
import { useGroup } from '../context/GroupContext';
import { useAuth } from '../context/AuthContext';

// type FindGroupsProps = NativeStackScreenProps<RootStackParamList, 'GroupsScreen'>;

const FindGroup = () => {
  // const [query, setQuery] = useState('Any');
  const [filteredSports, setFilteredSports] = useState(sportsList);
  const [activity, setActivity] = useState('Any');
  const [showDropdown, setShowDropdown] = useState(false);
  const [Location, setLocation] = useState('Close to your location');
  const [userHasGroup, setUserHasGroup] = useState(false);
  const { currentGroup, userInGroup } = useGroup()
  const { currentUser } = useAuth()

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (currentUser) {
      setUserHasGroup(currentGroup?.createdBy === currentUser.uid);
    }
  })

  const handleSearch = (text: string) => {
    setActivity(text);

    if (text === '') {
      setFilteredSports(sportsList); // Show all options if search is empty
      setShowDropdown(false); // Hide dropdown
    } else {
      const filtered = sportsList.filter((sport) =>
        sport.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredSports(filtered);
      setShowDropdown(true);
    }
  };

  const handleSelect = (sport: string) => {
    setActivity(sport);
    setActivity(sport); // Update the search bar with the selected sport
    setShowDropdown(false); // Hide dropdown
  };

  const SearchGroup = async () => {
    try {
      navigation.navigate('GroupsScreen', { activity: activity });
    } catch (error) {
      const errorMessage =
        (error as { message?: string }).message || 'An unknown error occurred';
      Alert.alert(errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >

      <View style={styles.header}>
        <Text style={styles.headerText}>Find a Group</Text>
      </View>
      {userHasGroup ? <GroupNav /> : null}
      {userInGroup ? <GroupMemberNav /> : null}
      <View style={styles.bodyContainer}>
        <Text style={styles.bodyTitle}>Activity</Text>
        <TextInput
          style={styles.input}
          // placeholder={activity === 'Any' ? 'Search for a sport' : activity} // Show selected activity as placeholder
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
        {/* <Text style={styles.selectedText}>Selected Sport: {activity}</Text> */}
      </View>
      <View style={styles.bodyContainer}>
        <Text style={styles.bodyTitle}>Location</Text>

        <TextInput
          style={styles.input}
          value={Location}
          onChangeText={setLocation}
        />
      </View>
      <MyButton title={'Find a Group'} onPress={SearchGroup} />
      {(userHasGroup || userInGroup) && <FooterGroupNav />}
      {(!userHasGroup && !userInGroup) && <FooterNav />}

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 150,
    backgroundColor: 'lightblue',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
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
});

export default FindGroup;
