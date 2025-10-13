import { create } from 'zustand';
import {
  CategoryInfo,
  VaultItem,
  getCategories,
  getVaultsByCategoryId,
} from '@/api/vault';

interface VaultStore {
  // State
  categories: CategoryInfo[];
  vaults: { [categoryId: string]: VaultItem[] };
  vaultById: { [vaultId: string]: VaultItem };
  isLoading: boolean;
  error: string | null;

  // Actions
  setCategories: (categories: CategoryInfo[]) => void;
  setVaults: (categoryId: string, vaults: VaultItem[]) => void;
  setVaultById: (vaultId: string, vault: VaultItem) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Async actions
  loadCategories: () => Promise<void>;
  loadVaultsByCategory: (categoryId: string) => Promise<void>;

  // Getters
  getVaultById: (vaultId: string) => VaultItem | null;
  getVaultsByCategory: (categoryId: string) => VaultItem[];
  getAllVaults: () => VaultItem[];

  // Cache management
  clearCache: () => void;
  isVaultCached: (vaultId: string) => boolean;
}

export const useVaultStore = create<VaultStore>((set, get) => ({
  // Initial state
  categories: [],
  vaults: {},
  vaultById: {},
  isLoading: false,
  error: null,

  // Actions
  setCategories: categories => set({ categories }),

  setVaults: (categoryId, vaults) =>
    set(state => {
      const newVaults = { ...state.vaults, [categoryId]: vaults };
      const newVaultById = { ...state.vaultById };

      // Update vaultById cache
      vaults.forEach(vault => {
        newVaultById[vault.id] = vault;
      });

      return {
        vaults: newVaults,
        vaultById: newVaultById,
      };
    }),

  setVaultById: (vaultId, vault) =>
    set(state => ({
      vaultById: { ...state.vaultById, [vaultId]: vault },
    })),

  setLoading: isLoading => set({ isLoading }),
  setError: error => set({ error }),

  // Async actions
  loadCategories: async () => {
    const { setLoading, setError, setCategories } = get();

    setLoading(true);
    setError(null);

    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load categories'
      );
    } finally {
      setLoading(false);
    }
  },

  loadVaultsByCategory: async categoryId => {
    const { setLoading, setError, setVaults } = get();

    setLoading(true);
    setError(null);

    try {
      const vaultsData = await getVaultsByCategoryId(categoryId);
      if (vaultsData) {
        setVaults(categoryId, vaultsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vaults');
    } finally {
      setLoading(false);
    }
  },

  // Getters
  getVaultById: vaultId => {
    const { vaultById } = get();
    return vaultById[vaultId] || null;
  },

  getVaultsByCategory: categoryId => {
    const { vaults } = get();
    return vaults[categoryId] || [];
  },

  getAllVaults: () => {
    const { vaults } = get();
    return Object.values(vaults).flat();
  },

  // Cache management
  clearCache: () =>
    set({
      categories: [],
      vaults: {},
      vaultById: {},
      error: null,
    }),

  isVaultCached: vaultId => {
    const { vaultById } = get();
    return vaultId in vaultById;
  },
}));

// Hook for easy access
export const useVaultData = () => {
  const store = useVaultStore();

  return {
    categories: store.categories,
    vaults: store.vaults,
    isLoading: store.isLoading,
    error: store.error,
    loadCategories: store.loadCategories,
    loadVaultsByCategory: store.loadVaultsByCategory,
    getVaultById: store.getVaultById,
    getVaultsByCategory: store.getVaultsByCategory,
    getAllVaults: store.getAllVaults,
    clearCache: store.clearCache,
    isVaultCached: store.isVaultCached,
  };
};

export default useVaultStore;
