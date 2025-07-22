import {
  StyleSheet,
  Text,
  View,
  Alert,
  Modal,
  TouchableOpacity,
  FlatList,
  ImageBackground,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { ActivityIndicator } from 'react-native';

//Navigation
import { navigate } from '../services/NavigationService';

//Components
import ApplicationCard from '../components/ApplicationCard';

//Firebase
import firestore from '@react-native-firebase/firestore';

//Context
import { useAuth } from '../context/AuthContext';
import { useGroupStore } from '../stores/groupStore';

//Hooks
import { useOnlineStatus } from '../hooks/useOnlineStatus'

//Utils
import { inviteApplicant } from '../utils/inviteHelpers';

//Icons
import Icon1 from 'react-native-vector-icons/AntDesign';
import IonIcon from 'react-native-vector-icons/Ionicons';

//Types
import { Applicant } from '../types/groupTypes';


const MyGroupScreen = () => {
  const { currentUser, userData } = useAuth();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null,
  );
  const { currentGroupId, currentGroup } = useGroupStore();

  const isGroupMember = userData?.groups?.some(
    group => group.groupId === currentGroupId && group.role === 'member'
  );

  const isGroupLeader = userData?.groups?.some(
    group => group.groupId === currentGroupId && group.role === 'leader'
  );

  useOnlineStatus()

  useEffect(() => {
    if (!currentGroup?.applicants) {
      setApplicants([]);
      return;
    }
    setApplicants(currentGroup.applicants);
  }, [currentGroup]);

  const handleInvite = (selectedApplicant: Applicant | null) => {
    if (!currentUser) {
      Alert.alert("Error", "User is not authenticated. Please log in.");
      return;
    }

    if (!currentGroup || !currentGroupId) {
      Alert.alert('Error', 'Group not found. Please refresh the list or create a new group.');
      return;
    }

    if (!selectedApplicant) {
      Alert.alert('Error', 'No applicant selected.');
      return;
    }
    setModalVisible(false);
    inviteApplicant(currentGroup.createdBy.uid, currentGroup, currentGroupId, selectedApplicant);
  };

  const declineApplicant = async (selectedApplicant: Applicant | null) => {
    setModalVisible(false);
    if (!currentGroupId) return

    try {
      await firestore()
        .collection('groups')
        .doc(currentGroupId)
        .update({
          applicants: currentGroup?.applicants.filter((applicant) => applicant.uid !== selectedApplicant?.uid),
        });
    } catch {
      Alert.alert('Error', 'Something went wrong.');
    }
  }

  const handleDelistGroup = async () => {
    if (!currentGroupId) return

    try {
      await firestore().collection('groups').doc(currentGroupId).update({
        applicants: [],
        isDelisted: true
      })
    } catch (error) {
      console.log("Coudn't remove applicants from the group", error)
    }
  }

  const handleSelectGroup = () => {
    // setCurrentGroupId(undefined)
    navigate('TabNav', {
      screen: 'My Group',
      params: {
        screen: 'SelectGroupScreen'
      }
    })
  }

  const handleActivateGroup = async () => {
    if (!currentGroup) return
    if (!currentGroupId) return

    const currentMembers = currentGroup?.members ?? [];
    console.log(currentMembers.length, currentGroup?.memberLimit)

    if (currentMembers.length < currentGroup?.memberLimit) {
      try {
        await firestore().collection('groups').doc(currentGroupId).update({
          isDelisted: false
        })
      } catch (error) {
        console.log("Coudn't remove applicants from the group", error)
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Cannot Activate Group 😕',
        text2: 'This group is full. Edit the group to increase the member limit.',
        visibilityTime: 4000,
      });
    }
  }

  const handleInviteFriend = () => {

  }

  if (!currentGroup) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }



  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/BackgroundImages/whiteBackground.jpg')}
        style={styles.backgroundImage}

      >
        {currentGroup?.visibility === "Invites Only" && (
          <View style={styles.overlay} />
        )}
        {currentGroup?.isDelisted && (
          <View style={styles.overlay} />
        )}
        <View style={styles.flatListContainer}>

          <FlatList
            data={applicants.filter((applicant) => applicant !== null)}
            keyExtractor={item => item.uid}
            renderItem={({ item }) => (
              <ApplicationCard
                applicant={item}
                currentUserId={currentUser?.uid || ''}
                currentGroup={currentGroup}
                onPressInvite={() => handleInvite(item)}
                onPressDecline={() => declineApplicant(item)}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.noApplicantsText}>No applicants available</Text>
            }
          />
        </View>

        {isGroupLeader && currentGroup?.visibility === "Invites Only" && (
          <View style={styles.privateGroupContainer}>
            <Text style={styles.privateGroupTitleText}>This group is set to Invites Only.</Text>
            <Text style={styles.activateGroupText}>
              The group is currently private, and only invited members can join.
            </Text>
            <Text style={styles.privateGroupText}>
              To continue, you can either "Invite" players from your friends
              list or go to "Edit" to change its visibility settings.
            </Text>

            <TouchableOpacity
              style={styles.inviteGroupButton}
              onPress={() => handleInviteFriend()}
              activeOpacity={0.7}
            >
              <Text style={styles.activateButtonText}>Invite</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editDelistedGroupButton}
              onPress={() => navigate("StartGroup", { isEdit: true })}
              activeOpacity={0.7}
            >
              <Text style={styles.activateButtonText}>Edit</Text>
              <Icon1 name="edit" size={25} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {isGroupLeader && currentGroup?.isDelisted && (
          <View style={styles.activateGroupContainer}>
            <Text style={styles.activateGroupTitleText}>This group is currently
              delisted.</Text>
            <Text style={styles.activateGroupText}>
              You've either chosen to pause it or it reached the member limit.
            </Text>
            <Text style={styles.activateGroupText}>
              If you're looking for more members, tap "Activate".
              Want to allow more people? Go to "Edit" and increase the
              member limit.
            </Text>

            <TouchableOpacity
              style={styles.activateGroupButton}
              onPress={() => handleActivateGroup()}
              activeOpacity={0.7}
            >
              <Text style={styles.activateButtonText}>Activate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editDelistedGroupButton}
              onPress={() => navigate("StartGroup", { isEdit: true })}
              activeOpacity={0.7}
            >
              <Text style={styles.activateButtonText}>Edit</Text>
              <Icon1 name="edit" size={25} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {isGroupMember && currentGroup?.isDelisted && (
          <View style={styles.activateGroupMemberContainer}>
            <Text style={styles.activateGroupTitleText}>This group is currently
              delisted.</Text>
            <Text style={styles.activateGroupText}>Your leader have either
              chosen to pause it or it reached the member limit.
            </Text>
          </View>
        )}

        {isGroupLeader && !currentGroup?.isDelisted && currentGroup?.visibility !== "Invites Only" && (
          <TouchableOpacity
            style={styles.editGroupButton}
            onPress={() => navigate("StartGroup", { isEdit: true })}
            activeOpacity={0.7}
          >
            <Icon1 name="edit" size={40} color="white" />
          </TouchableOpacity>
        )}
        {!currentGroup?.isDelisted && currentGroup?.visibility !== "Invites Only" && (
          <TouchableOpacity
            style={styles.switchGroupButton}
            onPress={() => handleSelectGroup()}
            activeOpacity={0.7}
          >
            <IonIcon name="repeat" size={40} color="white" />
          </TouchableOpacity>
        )}
        {isGroupLeader && !currentGroup?.isDelisted && currentGroup?.visibility !== "Invites Only" && (
          <TouchableOpacity
            style={styles.closeGroupButton}
            onPress={() => handleDelistGroup()}
            activeOpacity={0.7}
          >
            <Icon1 name="close" size={40} color="white" />
          </TouchableOpacity>
        )}
        <Modal
          animationType="fade"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <TouchableOpacity
                style={styles.closeIcon}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.closeText}>✖</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitleText}>Invite</Text>
              <Text style={styles.modalText}>
                Do you want to invite this person to your group?
              </Text>
              <View style={styles.modalNoteContainer}>
                <Text style={styles.modalNoteText}>
                  {selectedApplicant?.note}
                </Text>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.inviteBtn}
                  onPress={async () => {
                    handleInvite(selectedApplicant);
                  }}>
                  <Text style={styles.inviteBtnText}>Invite</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineBtn}
                  onPress={async () => {
                    declineApplicant(selectedApplicant);
                  }}>
                  <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
};

export default MyGroupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover"
  },
  flatListContainer: {
    marginTop: 10
  },
  card: {
    backgroundColor: '#6A9AB0',
    padding: 20,
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 15,

    // Shadow for iOS
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow position
    shadowOpacity: 0.25, // Shadow transparency
    shadowRadius: 3.84, // Shadow blur radius

    // Shadow for Android
    elevation: 5, // Elevation for Android shadow
  },
  column: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  memberContainer: {
    marginTop: 15,
    borderWidth: 1
  },
  memberCard: {
    backgroundColor: '#6CB4EE',
    padding: 10,
  },
  cardText: {
    color: 'black',
    fontSize: 20,
  },
  cardStar: {
    marginLeft: 4
  },
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
  modalText: {
    marginTop: 20,
    fontSize: 18,
    color: 'black',
    marginBottom: 20,
  },
  modalNoteContainer: {
    width: 300,
    height: 120,
    borderRadius: 5,
    backgroundColor: '#F9F6EE',
    borderWidth: 1,
    borderColor: 'grey',
  },
  modalNoteText: {
    padding: 10,
    color: 'black',
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: '100%',
    marginTop: 5,
  },
  inviteBtn: {
    backgroundColor: 'green',
    padding: 10,
    width: 100,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 15,
  },
  inviteBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  declineBtn: {
    backgroundColor: 'red',
    padding: 10,
    width: 100,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 15,
  },
  declineBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noApplicantsText: {
    flex: 1,
    textAlign: "center",
    marginTop: 200,
    fontSize: 24
  },
  editGroupButton: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
    backgroundColor: 'green',
    bottom: 20,
    left: 100,
    position: "absolute",
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,          // Adds shadow on Android
    shadowColor: '#000',   // Adds shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  closeGroupButton: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
    backgroundColor: "#C41E3A",
    bottom: 20,
    right: 20,
    position: "absolute",
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,          // Adds shadow on Android
    shadowColor: '#000',   // Adds shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,

  },
  switchGroupButton: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
    backgroundColor: '#0b75c9',
    bottom: 20,
    left: 20,
    position: "absolute",
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,          // Adds shadow on Android
    shadowColor: '#000',   // Adds shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,

  },
  slider: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 20,
    left: 20,
    position: "absolute",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1, // put this below buttons
    pointerEvents: 'none',
  },
  activateGroupContainer: {
    zIndex: 5, // 🔝 Make sure it's above the overlay's zIndex: 1
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
    padding: 20,
    paddingTop: 25,
    width: 330,
    height: 330,
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    elevation: 10, // shadow on Android
    shadowColor: '#000', // iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  activateGroupMemberContainer: {
    zIndex: 5, // 🔝 Make sure it's above the overlay's zIndex: 1
    position: 'absolute',
    top: '25%',
    alignSelf: 'center',
    justifyContent: 'center',
    textAlign: "center",
    padding: 15,
    paddingTop: 25,
    width: 330,
    height: 160,
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    elevation: 10, // shadow on Android
    shadowColor: '#000', // iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  activateGroupButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    alignSelf: 'center',
    backgroundColor: '#0f5e9c',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  editDelistedGroupButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignSelf: 'center',
    backgroundColor: 'green',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  activateButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  activateGroupTitleText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#C41E3A',
    marginBottom: 15,
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  activateGroupText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 15,
    paddingHorizontal: 10,
    lineHeight: 22,
    fontWeight: '500',
  },
  privateGroupContainer: {
    zIndex: 5, // 🔝 Make sure it's above the overlay's zIndex: 1
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
    padding: 20,
    paddingTop: 25,
    width: 330,
    height: 300,
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    elevation: 10, // shadow on Android
    shadowColor: '#000', // iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  inviteGroupButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    alignSelf: 'center',
    backgroundColor: '#0f5e9c',
    paddingVertical: 15,
    paddingHorizontal: 37,
    borderRadius: 30,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  privateButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  privateGroupTitleText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#007FFF',
    marginBottom: 15,
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  privateGroupText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 15,
    paddingHorizontal: 10,
    lineHeight: 22,
    fontWeight: '500',
  },
});
