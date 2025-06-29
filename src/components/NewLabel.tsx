import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Dimensions,
  Keyboard,
  Pressable,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

//Firebase
import firestore from '@react-native-firebase/firestore';

//Assets
import sportsList from "../assets/JsonFiles/sportsList.json"

//Types
import { Friend } from '../types/userTypes';

const { height } = Dimensions.get('window');

interface NewLabelModalProps {
  friend: Friend;       // the friend you want to label
  currentUserId: string
  onLabelAdded?: (label: string) => void; // optional callback to refresh UI
  placeholder?: string;
}


const SearchableDropdown: React.FC<NewLabelModalProps> = ({ friend, currentUserId, onLabelAdded, placeholder }) => {
  const [searchText, setSearchText] = useState('');
  const cleanSportsList = sportsList.filter(sport => sport.toLowerCase() !== 'any');
  const [filteredOptions, setFilteredOptions] = useState(cleanSportsList);
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSearch = (text: string) => {
    setSearchText(text);
    const filtered = cleanSportsList.filter(option =>
      option.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredOptions(filtered);
  };


  const handleSelect = async (item: string) => {
    // setSearchText(item);
    // onChange(item);
    setVisible(false);
    Keyboard.dismiss();

    if (item === 'Custom') {
      // setShowCustomInput(true);
      return
    } else {
      try {
        const userRef = firestore().collection('users').doc(currentUserId);
        const docSnap = await userRef.get();
        const data = docSnap.data();

        if (!data?.friends) return;


        const updatedFriends = data.friends.map((f: Friend) => {
          if (f.uid === friend.uid) {
            const currentLabels = f.labels || [];
            if (!currentLabels.includes(item)) {
              return {
                ...f,
                labels: [...currentLabels, item]
              };
            }
          }
          return f;
        });

        await userRef.update({ friends: updatedFriends });

        onLabelAdded?.(item); // Trigger optional callback
      } catch (error) {
        console.error('Error updating Firestore labels:', error);

      }
    }


  };

  return (
    <View>
      <Pressable style={styles.createNewButton} onPress={() => {
        setSearchText('');
        setFilteredOptions(cleanSportsList);
        setVisible(true);
      }}
      >
        <Text style={styles.buttonText}>Create New</Text>
      </Pressable>
      <Modal visible={visible} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={() => setVisible(false)}>
            <View style={styles.overlay}>
              <View style={styles.dropdownContainer}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={searchText}
                  onChangeText={handleSearch}
                  placeholder={placeholder || 'Search...'}
                  placeholderTextColor="#999"

                />

                <FlatList
                  data={filteredOptions}
                  keyExtractor={(item, index) => index.toString()}
                  style={styles.dropdown}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => handleSelect(item)}
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          item.toLowerCase().includes('custom') && styles.customOptionText,
                        ]}
                      >{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>


  );
};

const styles = StyleSheet.create({
  createNewButton: {
    backgroundColor: '#007AFF',
    // borderWidth: 1,
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(16),
    borderRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    paddingLeft: 20,
    fontSize: 25,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    maxHeight: height * 0.48,
    padding: 10,
  },
  dropdown: {
    marginTop: 10,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  customOptionText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  dropdownText: {
    fontSize: 16,
  },
});

export default SearchableDropdown;
