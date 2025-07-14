// components/GroupListener.tsx
import { useEffect } from 'react';
import { useGroupStore } from '../stores/groupStore';
import { listenToGroup, stopListeningToGroup } from '../services/firebase/groupListener';
import { useAuth } from '../context/AuthContext';

const GroupListener = () => {
  const currentGroupId = useGroupStore((state) => state.currentGroupId);
  const { currentUser } = useAuth()
  useEffect(() => {
    if (!currentGroupId) return;
    if (!currentUser) return

    // 🧠 Start listening
    listenToGroup(currentGroupId, currentUser.uid);

    // 🧹 Clean up old listener on unmount or ID change
    return () => {
      stopListeningToGroup();
    };
  }, [currentGroupId]);

  return null;
};

export default GroupListener;
