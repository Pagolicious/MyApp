import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';


//Navigation
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

//Components
import GroupMemberNav from '../components/GroupMemberNav';
import FooterGroupNav from '../components/FooterGroupNav';

//Context
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';

type MembersHomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'MembersHomeScreen'
>;

interface Member {
  uid: string;
  firstName: string;
  lastName: string;
  skillLevel: string;
}

const MembersHomeScreen = ({ route }: MembersHomeScreenProps) => {

  const [members, setMembers] = React.useState<Member[]>([]);
  const [owner, setOwner] = React.useState<string | null>(null);
  const { currentGroupId, currentGroup } = useGroup();

  useEffect(() => {
    const fetchGroupData = async () => {
      try {

        const ownerdoc = await firestore()
          .collection('users')
          .doc(currentGroup?.createdBy)
          .get();
        const ownerData = ownerdoc.data();

        if (currentGroup) {
          setOwner(ownerData ? ownerData.firstName : null);
          setMembers(currentGroup.members);
        }
      } catch (error) {
        console.error('Error fetching group data:', error);
      }
    };

    fetchGroupData();
  }, [currentGroupId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Members Home Page</Text>
      </View>
      <GroupMemberNav route={route} />
      <View>
        <Text style={styles.member}>{owner}</Text>

      </View>
      <FlatList
        data={members}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => <Text style={styles.member}>{item.firstName}</Text>}
      />
      <FooterGroupNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 150,
    backgroundColor: '#EAD8B1',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
  },
  member: {
    fontSize: 30,
    marginTop: 5,
  },
});

export default MembersHomeScreen;
