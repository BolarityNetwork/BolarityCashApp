import { useEffect } from 'react';
import { useVaultData as useVaultStore } from '@/stores/vaultStore';

export const useVaultData = () => {
  const store = useVaultStore();

  // Load categories on mount
  useEffect(() => {
    if (store.categories.length === 0) {
      store.loadCategories();
    }
  }, [store.categories.length, store.loadCategories]);

  return store;
};

export default useVaultData;
