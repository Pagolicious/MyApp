// import { create } from 'zustand';
// import { RootStackParamList } from '../utils/types';

// type ValidScreens = keyof RootStackParamList;

// type NavState = {
//   lastScreen: ValidScreens | null;
//   lastParams: RootStackParamList[ValidScreens] | undefined;
//   setLastScreen: <T extends ValidScreens>(
//     screen: T,
//     params?: RootStackParamList[T]
//   ) => void;
// };

// export const useNavigationStore = create<NavState>((set) => ({
//   lastScreen: null,
//   lastParams: undefined,
//   setLastScreen: (screen, params) => set({ lastScreen: screen, lastParams: params }),
// }));
