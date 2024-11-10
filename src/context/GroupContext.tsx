// GroupContext.tsx
import React, {createContext, useContext, useState, ReactNode} from 'react';

// Define a type for the context value
interface GroupContextType {
  currentGroupId: string | undefined; // Change to undefined
  setCurrentGroupId: (groupId: string | undefined) => void; // Change to accept undefined
}

// Create the context with an initial value of undefined
const GroupContext = createContext<GroupContextType | undefined>(undefined);

// Create a provider component
export const GroupProvider = ({children}: {children: ReactNode}) => {
  const [currentGroupId, setCurrentGroupId] = useState<string | undefined>(
    undefined,
  ); // Change to undefined

  return (
    <GroupContext.Provider value={{currentGroupId, setCurrentGroupId}}>
      {children}
    </GroupContext.Provider>
  );
};

// Custom hook for using the context
export const useGroup = () => {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
};
