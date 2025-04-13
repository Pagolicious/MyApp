import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  leaveModalVisible: boolean;
  disbandModalVisible: boolean;
  setLeaveModalVisible: (visible: boolean) => void;
  setDisbandModalVisible: (visible: boolean) => void;
}

const ModalContext = createContext<ModalContextType>({
  leaveModalVisible: false,
  disbandModalVisible: false,
  setLeaveModalVisible: () => { },
  setDisbandModalVisible: () => { },
});

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [disbandModalVisible, setDisbandModalVisible] = useState(false);

  return (
    <ModalContext.Provider
      value={{
        leaveModalVisible,
        disbandModalVisible,
        setLeaveModalVisible,
        setDisbandModalVisible,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
