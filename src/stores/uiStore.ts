import { create } from 'zustand';

interface UIStore {
  notificationModal: boolean;
  notificationMessage: string | { id: string; message: string }[];
  notificationId: string | null;
  hasUserExited: boolean;

  setNotificationModal: (visible: boolean) => void;
  setNotificationMessage: (msg: string | { id: string; message: string }[]) => void;
  setNotificationId: (id: string | null) => void;
  setHasUserExited: (exited: boolean) => void;
  closeNotificationModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  notificationModal: false,
  notificationMessage: '',
  notificationId: null,
  hasUserExited: false,

  setNotificationModal: (visible) => set({ notificationModal: visible }),
  setNotificationMessage: (msg) => set({ notificationMessage: msg }),
  setNotificationId: (id) => set({ notificationId: id }),
  setHasUserExited: (exited) => set({ hasUserExited: exited }),
  closeNotificationModal: () =>
    set({ notificationModal: false, notificationMessage: '', notificationId: null }),
}));
