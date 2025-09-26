import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface APRInfo {
  baseAPR: number;
  compAPR: number;
  totalAPR: number;
  totalTVL: string;
}

interface APRCacheItem {
  data: APRInfo;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface APRStore {
  // State
  cache: Record<string, APRCacheItem>;
  isLoading: Record<string, boolean>;
  errors: Record<string, string | null>;

  // Actions
  setAPRData: (key: string, data: APRInfo, ttl?: number) => void;
  getAPRData: (key: string) => APRInfo | null;
  hasValidCache: (key: string) => boolean;
  setLoading: (key: string, loading: boolean) => void;
  setError: (key: string, error: string | null) => void;
  clearCache: (key?: string) => void;
  cleanupExpired: () => void;

  // Computed
  getCacheStats: () => { size: number; keys: string[] };
}

// Cache key generator
export const getCacheKey = (protocol: string, chainId: number): string => {
  return `apr_${protocol}_${chainId}`;
};

// Default TTL: 5 minutes
const DEFAULT_TTL = 5 * 60 * 1000;

export const useAPRStore = create<APRStore>()(
  persist(
    (set, get) => ({
      // Initial state
      cache: {},
      isLoading: {},
      errors: {},

      // Set APR data with TTL
      setAPRData: (key: string, data: APRInfo, ttl: number = DEFAULT_TTL) => {
        set(state => ({
          cache: {
            ...state.cache,
            [key]: {
              data,
              timestamp: Date.now(),
              ttl,
            },
          },
          errors: {
            ...state.errors,
            [key]: null, // Clear any previous errors
          },
        }));
      },

      // Get APR data (returns null if expired or not found)
      getAPRData: (key: string) => {
        const item = get().cache[key];
        if (!item) {
          return null;
        }

        // Check if expired
        if (Date.now() - item.timestamp > item.ttl) {
          // Auto-cleanup expired item
          set(state => {
            const newCache = { ...state.cache };
            delete newCache[key];
            return { cache: newCache };
          });
          return null;
        }

        return item.data;
      },

      // Check if cache is valid (not expired)
      hasValidCache: (key: string) => {
        return get().getAPRData(key) !== null;
      },

      // Set loading state
      setLoading: (key: string, loading: boolean) => {
        set(state => ({
          isLoading: {
            ...state.isLoading,
            [key]: loading,
          },
        }));
      },

      // Set error state
      setError: (key: string, error: string | null) => {
        set(state => ({
          errors: {
            ...state.errors,
            [key]: error,
          },
        }));
      },

      // Clear cache (specific key or all)
      clearCache: (key?: string) => {
        if (key) {
          set(state => {
            const newCache = { ...state.cache };
            const newErrors = { ...state.errors };
            const newLoading = { ...state.isLoading };

            delete newCache[key];
            delete newErrors[key];
            delete newLoading[key];

            return {
              cache: newCache,
              errors: newErrors,
              isLoading: newLoading,
            };
          });
        } else {
          set({
            cache: {},
            isLoading: {},
            errors: {},
          });
        }
      },

      // Cleanup expired cache entries
      cleanupExpired: () => {
        const now = Date.now();
        set(state => {
          const newCache = { ...state.cache };
          const newErrors = { ...state.errors };
          const newLoading = { ...state.isLoading };

          Object.keys(newCache).forEach(key => {
            const item = newCache[key];
            if (now - item.timestamp > item.ttl) {
              delete newCache[key];
              delete newErrors[key];
              delete newLoading[key];
            }
          });

          return {
            cache: newCache,
            errors: newErrors,
            isLoading: newLoading,
          };
        });
      },

      // Get cache statistics
      getCacheStats: () => {
        const cache = get().cache;
        return {
          size: Object.keys(cache).length,
          keys: Object.keys(cache),
        };
      },
    }),
    {
      name: 'apr-cache-storage', // unique name for storage
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist cache data, not loading/error states
      partialize: state => ({
        cache: state.cache,
      }),
    }
  )
);

// Utility functions for common operations
export const aprStoreUtils = {
  // Get Compound APR with automatic cache management
  getCompoundAPR: (chainId: number = 8453) => {
    const key = getCacheKey('compound', chainId);
    return useAPRStore.getState().getAPRData(key);
  },

  // Set Compound APR with automatic cache management
  setCompoundAPR: (data: APRInfo, chainId: number = 8453, ttl?: number) => {
    const key = getCacheKey('compound', chainId);
    useAPRStore.getState().setAPRData(key, data, ttl);
  },

  // Check if Compound APR cache is valid
  isCompoundAPRValid: (chainId: number = 8453) => {
    const key = getCacheKey('compound', chainId);
    return useAPRStore.getState().hasValidCache(key);
  },

  // Cleanup all expired entries
  cleanup: () => {
    useAPRStore.getState().cleanupExpired();
  },
};

export default useAPRStore;
