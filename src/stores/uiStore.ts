import { create } from 'zustand';

interface UIStore {
  notificationModal: boolean;
  notificationMessage: string | null;
  notificationId: string | null;
  hasUserExited: boolean;

  setNotificationModal: (visible: boolean) => void;
  setNotificationMessage: (message: string | null) => void;
  setNotificationId: (id: string | null) => void;
  setHasUserExited: (exited: boolean) => void;
  closeNotificationModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  notificationModal: false,
  notificationMessage: null,
  notificationId: null,
  hasUserExited: false,

  setNotificationModal: (visible) => set({ notificationModal: visible }),
  setNotificationMessage: (message) => set({ notificationMessage: message }),
  setNotificationId: (id) => set({ notificationId: id }),
  setHasUserExited: (exited) => set({ hasUserExited: exited }),
  closeNotificationModal: () =>
    set({ notificationModal: false, notificationMessage: null, notificationId: null }),
}));
