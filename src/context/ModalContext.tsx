import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  leaveModalVisible: boolean;
  delistModalVisible: boolean;
  setLeaveModalVisible: (visible: boolean) => void;
  setDelistModalVisible: (visible: boolean) => void;
}

const ModalContext = createContext<ModalContextType>({
  leaveModalVisible: false,
  delistModalVisible: false,
  setLeaveModalVisible: () => { },
  setDelistModalVisible: () => { },
});

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [delistModalVisible, setDelistModalVisible] = useState(false);

  return (
    <ModalContext.Provider
      value={{
        leaveModalVisible,
        delistModalVisible,
        setLeaveModalVisible,
        setDelistModalVisible,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
