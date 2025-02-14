import { useEffect, useState } from 'react';

//Firebase
import firestore from '@react-native-firebase/firestore';

//Context
import { useGroup } from '../context/GroupContext';
import { useAuth } from '../context/AuthContext';

//Utils
import handleFirestoreError from '../utils/firebaseErrorHandler';

interface Member {
  uid: string;
  firstName: string;
  lastName: string;
  skillLevel: string;
}

interface Owner {
  uid: string;
  firstName: string;
  lastName: string;
}

export const useGroupData = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [owner, setOwner] = useState<Owner | null>(null);
  // const [userInGroup, setUserInGroup] = useState(false);
  const { currentGroupId, currentGroup } = useGroup();
  const { currentUser } = useAuth()


  // useEffect(() => {
  //   if (!currentGroup) {
  //     console.log("No current group available.");
  //     return;
  //   }

  //   console.log("Group in useGroupData:", currentGroup);

  //   setMembers(currentGroup.members || []);
  //   setOwner(currentGroup.members?.find((m) => m.uid === currentGroup.createdBy) || null);
  // }, [currentGroup]);


  useEffect(() => {
    const fetchGroupData = async () => {

      if (!currentUser || !currentGroup) {
        setOwner(null);
        setMembers([]);
        console.log("No current group available.");
        return;
      }

      try {
        const ownerDoc = await firestore()
          .collection('users')
          .doc(currentGroup?.createdBy)
          .get();

        const ownerData = ownerDoc.data();

        // const memberInGroup = await firestore()
        //   .collection('groups')
        //   .where('memberUids', 'array-contains', currentUser?.uid)
        //   .get();

        // setUserInGroup(!memberInGroup.empty);

        if (currentGroup) {
          setOwner(ownerData ? { uid: currentGroup.createdBy, firstName: ownerData.firstName, lastName: ownerData.lastName } : null);
          setMembers(currentGroup.members);
          console.log(currentGroup);

        }
      } catch (error) {
        console.error('Error fetching group data:', error);
        handleFirestoreError(error)
      }
    };

    fetchGroupData();
  }, [currentGroupId]);

  return { members, owner };



};
