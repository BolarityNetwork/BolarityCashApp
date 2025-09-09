// hooks/store/useUserStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const STORAGE_KEY = 'cached_user';

interface UserState {
  cachedUser: any | null;
  hydrated: boolean;
  setCachedUser: (user: any | null) => void;
  setHydrated: (hydrated: boolean) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    set => ({
      cachedUser: null,
      hydrated: false,
      setCachedUser: user => set({ cachedUser: user }),
      setHydrated: hydrated => set({ hydrated }),
      clearUser: () => set({ cachedUser: null }),
    }),
    {
      name: STORAGE_KEY,
      storage: {
        getItem: async name => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async name => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
