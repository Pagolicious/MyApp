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

import MultiSlider from '@ptomasroos/react-native-multi-slider';
import CustomToggle from '../components/CustomToggle';
import { Dimensions } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';


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
const screenWidth = Dimensions.get('window').width;

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

              <View style={styles.sliderContainer}>
                <View style={styles.rangeText}>
                  <Text style={[styles.ageValue, styles.sliderLeftText]}>
                    {minAge} yrs
                  </Text>
                  <Text style={styles.ageLabel}>Age</Text>
                  <Text style={[styles.ageValue, styles.sliderRightText]}>
                    {maxAge === 70 ? '70+ yrs' : `${maxAge} yrs`}
                  </Text>
                </View>

                <View style={styles.sliderWrapper}>
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
    width: Math.min(screenWidth * 0.9, scale(350)),
    padding: scale(20),
    backgroundColor: 'white',
    borderRadius: scale(20),
    alignItems: 'center',
  },
  closeIcon: {
    position: 'absolute',
    top: verticalScale(5),
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
  bodyLabel: {
    marginTop: verticalScale(15),
    paddingLeft: scale(10),
    fontSize: moderateScale(17),
    color: 'grey',
    alignSelf: 'flex-start',
  },
  sliderWrapper: {
    alignItems: 'center',
    width: "100%"
  },

  sliderContainer: {
    width: '100%',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(15),
  },

  sliderLeftText: {
    width: scale(60),
    textAlign: 'left',
  },

  sliderRightText: {
    width: scale(60),
    textAlign: 'right',
  },

  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: scale(8),
    overflow: 'hidden',
    marginTop: verticalScale(10),
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: verticalScale(14),
  },
  segmentSelected: {
    backgroundColor: '#007AFF',
  },
  text: {
    color: '#000',
    fontSize: moderateScale(12)
  },
  textSelected: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: moderateScale(12)

  },
  toggleContainer: {
    marginTop: verticalScale(-15),
  },
  rangeText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(10),
  },
  ageLabel: {
    fontSize: moderateScale(17),
    color: 'grey',
  },
  ageValue: {
    fontSize: moderateScale(16),
    color: 'black',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: verticalScale(10),
    paddingHorizontal: scale(5),
  },
});


export default MoreOptionsModal;
