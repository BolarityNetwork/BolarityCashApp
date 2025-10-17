import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';

// 地址薄条目类型
export interface AddressBookItem {
  id: string;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

// 最近使用地址类型
export interface RecentAddress {
  address: string;
  lastUsed: string;
  name?: string;
}

interface AddressBookState {
  addresses: AddressBookItem[];
  recentAddresses: RecentAddress[];
  isLoading: boolean;
  error: string | null;
  editingItem: AddressBookItem | null;

  // Actions
  addAddress: (name: string, address: string) => void;
  deleteAddress: (id: string) => void;
  updateAddress: (id: string, name: string, address: string) => void;
  addRecentAddress: (address: string, name?: string) => void;
  clearError: () => void;
  setEditingItem: (item: AddressBookItem | null) => void;
}

const STORAGE_KEY = 'address-book';

export const useAddressBookStore = create<AddressBookState>()(
  persist(
    set => ({
      addresses: [],
      recentAddresses: [],
      isLoading: false,
      error: null,
      editingItem: null,

      addAddress: (name, address) =>
        set(state => {
          // 检查地址是否已存在
          const existingAddress = state.addresses.find(
            item => item.address.toLowerCase() === address.toLowerCase()
          );

          if (existingAddress) {
            return {
              ...state,
              error: '该地址已在地址薄中',
            };
          }

          const newItem: AddressBookItem = {
            id: randomUUID(),
            name,
            address,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return {
            ...state,
            addresses: [...state.addresses, newItem],
            error: null,
          };
        }),

      deleteAddress: id =>
        set(state => ({
          ...state,
          addresses: state.addresses.filter(item => item.id !== id),
        })),

      updateAddress: (id, name, address) =>
        set(state => {
          // 检查地址是否已被其他条目使用
          const existingAddress = state.addresses.find(
            item =>
              item.address.toLowerCase() === address.toLowerCase() &&
              item.id !== id
          );

          if (existingAddress) {
            return {
              ...state,
              error: '该地址已在地址薄中被其他条目使用',
            };
          }

          return {
            ...state,
            addresses: state.addresses.map(item =>
              item.id === id
                ? {
                    ...item,
                    name,
                    address,
                    updatedAt: new Date().toISOString(),
                  }
                : item
            ),
            error: null,
          };
        }),

      addRecentAddress: (address, name) =>
        set(state => {
          // 检查地址是否已存在
          const existingIndex = state.recentAddresses.findIndex(
            item => item.address.toLowerCase() === address.toLowerCase()
          );

          const newRecentAddress: RecentAddress = {
            address,
            lastUsed: new Date().toISOString(),
            name,
          };

          let updatedRecentAddresses;
          if (existingIndex >= 0) {
            // 如果已存在，更新时间并移到最前面
            updatedRecentAddresses = [
              newRecentAddress,
              ...state.recentAddresses.filter(
                (_, index) => index !== existingIndex
              ),
            ];
          } else {
            // 如果不存在，添加到最前面
            updatedRecentAddresses = [
              newRecentAddress,
              ...state.recentAddresses,
            ];
          }

          // 限制最近地址数量为10个
          return {
            ...state,
            recentAddresses: updatedRecentAddresses.slice(0, 10),
          };
        }),

      clearError: () => set(state => ({ ...state, error: null })),
      setEditingItem: (item: AddressBookItem | null) =>
        set(state => ({ ...state, editingItem: item })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
