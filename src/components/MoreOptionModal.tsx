// components/MoreOptionsModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';

import Slider from '@react-native-community/slider';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import CustomToggle from '../components/CustomToggle';

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedGender: string;
  setSelectedGender: (value: string) => void;
  selectedVisibility: string;
  setSelectedVisibility: (value: string) => void;
  minAge: number;
  maxAge: number;
  setMinAge: (value: number) => void;
  setMaxAge: (value: number) => void;
  isFriendsOnly: boolean;
  setIsFriendsOnly: (value: boolean) => void;
  isAutoAccept: boolean;
  setIsAutoAccept: (value: boolean) => void;
  isVerifiedOnly: boolean;
  setIsVerifiedOnly: (value: boolean) => void;
}

const GenderOptions = ['All', 'Women only', 'Men only'];
const VisibilityOption = ['Public', 'Private'];

const MoreOptionsModal: React.FC<Props> = ({
  visible,
  onClose,
  selectedGender,
  setSelectedGender,
  selectedVisibility,
  setSelectedVisibility,
  minAge,
  maxAge,
  setMinAge,
  setMaxAge,
  isFriendsOnly,
  setIsFriendsOnly,
  isAutoAccept,
  setIsAutoAccept,
  isVerifiedOnly,
  setIsVerifiedOnly

}) => {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>

            <View style={styles.modalView}>
              <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                <Text style={styles.closeText}>✖</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitleText}>More Filters</Text>

              <Text style={styles.bodyLabel}>Group Visibility</Text>
              <View style={styles.segmentContainer}>
                {VisibilityOption.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setSelectedVisibility(option)}
                    android_ripple={{ color: 'rgba(0,0,0,0.2)' }}
                    style={[
                      styles.segment,
                      selectedVisibility === option && styles.segmentSelected,
                    ]}
                  >
                    <Text
                      style={
                        selectedVisibility === option
                          ? styles.textSelected
                          : styles.text
                      }
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.bodyLabel}>Gender</Text>
              <View style={styles.segmentContainer}>
                {GenderOptions.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setSelectedGender(option)}
                    android_ripple={{ color: 'rgba(0,0,0,0.2)' }}
                    style={[
                      styles.segment,
                      selectedGender === option && styles.segmentSelected,
                    ]}
                  >
                    <Text
                      style={
                        selectedGender === option
                          ? styles.textSelected
                          : styles.text
                      }
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={{ width: '100%', paddingHorizontal: 10, paddingVertical: 15 }}>
                <View style={styles.rangeText}>
                  <Text style={[styles.ageValue, { width: 60, textAlign: 'left' }]}>
                    {minAge} yrs
                  </Text>
                  <Text style={styles.ageLabel}>Age</Text>
                  <Text style={[styles.ageValue, { width: 60, textAlign: 'right' }]}>
                    {maxAge === 70 ? '70+ yrs' : `${maxAge} yrs`}
                  </Text>
                </View>

                <MultiSlider
                  values={[minAge, maxAge]}
                  min={18}
                  max={70}
                  step={1}
                  onValuesChange={(values) => {
                    setMinAge(values[0]);
                    setMaxAge(values[1]);
                  }}

                  selectedStyle={{ backgroundColor: '#007AFF' }}
                  markerStyle={{ backgroundColor: '#007AFF' }}
                />
              </View>
              <View style={styles.toggleContainer}>

                <View style={styles.toggleRow}>
                  <Text style={styles.bodyLabel}>Friends Only</Text>
                  <CustomToggle
                    label="Friend"
                    value={isFriendsOnly}
                    onToggle={(val: boolean) => setIsFriendsOnly(val)}
                  />
                </View>
                <View style={styles.toggleRow}>
                  <Text style={styles.bodyLabel}>Auto-Accept Members</Text>
                  <CustomToggle
                    label="Auto-Accept"
                    value={isAutoAccept}
                    onToggle={(val: boolean) => setIsAutoAccept(val)}
                  />
                </View>
                <View style={styles.toggleRow}>
                  <Text style={styles.bodyLabel}>Verified Users Only</Text>
                  <CustomToggle
                    label="Verified"
                    value={isVerifiedOnly}
                    onToggle={(val: boolean) => setIsVerifiedOnly(val)}
                  />
                </View>
              </View>

            </View>
          </TouchableWithoutFeedback>

        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: 350,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
  },
  closeIcon: {
    position: 'absolute',
    top: 5,
    right: 15,
    padding: 5,
  },
  closeText: {
    fontSize: 24,
    color: '#888',
  },
  modalTitleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  bodyLabel: {
    marginTop: 15,
    paddingLeft: 10,
    fontSize: 17,
    color: 'grey',
    alignSelf: 'flex-start',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
  },
  segment: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    paddingVertical: 14,
  },
  segmentSelected: {
    backgroundColor: '#007AFF',
  },
  text: {
    color: '#000',
  },
  textSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  toggleContainer: {
    marginTop: -15
  },
  rangeText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  ageLabel: {
    fontSize: 17,
    color: 'grey',
  },
  ageValue: {
    fontSize: 16,
    color: 'black',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 5,
  },


});

export default MoreOptionsModal;
