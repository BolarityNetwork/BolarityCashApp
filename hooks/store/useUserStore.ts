import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'cached_user';

interface UserState {
  cachedUser: any | null;
  isHydrated: boolean;
  setCachedUser: (user: any | null) => void;
  setHydrated: (hydrated: boolean) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    set => ({
      cachedUser: null,
      isHydrated: false,
      setCachedUser: user => set({ cachedUser: user }),
      setHydrated: hydrated => set({ isHydrated: hydrated }),
      clearUser: () => set({ cachedUser: null }),
    }),
    {
      name: STORAGE_KEY,
      partialize: state => ({ cachedUser: state.cachedUser }),
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => state => {
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);
