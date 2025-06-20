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
} from 'react-native';

const { height } = Dimensions.get('window');

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

const SearchableDropdown: React.FC<Props> = ({ value, onChange, options, placeholder }) => {
  const [searchText, setSearchText] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setSearchText(value); // sync text on modal open
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [visible]);



  const handleSearch = (text: string) => {
    setSearchText(text);
    const filtered = options.filter(option =>
      option.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredOptions(filtered);
  };

  const handleSelect = (item: string) => {
    setSearchText(item);
    onChange(item);
    setVisible(false);
    Keyboard.dismiss();
  };

  return (

    <>
      <TouchableOpacity onPress={() => setVisible(true)}>
        <TextInput
          value={value}
          placeholder={placeholder || 'Search...'}
          placeholderTextColor="#999"
          style={[styles.input, { color: 'black' }]}
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>

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
                      <Text style={styles.dropdownText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

    </>
  );
};

const styles = StyleSheet.create({
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
  dropdownText: {
    fontSize: 16,
  },
});

export default SearchableDropdown;
