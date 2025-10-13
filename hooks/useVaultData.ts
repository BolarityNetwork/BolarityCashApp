import { useState, useCallback, useEffect } from 'react';
import {
  getCategories,
  getVaultsByCategoryId,
  CategoryInfo,
  VaultItem,
} from '@/api/vault';

interface VaultData {
  categories: CategoryInfo[];
  vaults: { [categoryId: string]: VaultItem[] };
  isLoading: boolean;
  error: string | null;
}

export const useVaultData = (): VaultData & {
  loadCategories: () => Promise<void>;
  loadVaultsByCategory: (categoryId: string) => Promise<void>;
} => {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [vaults, setVaults] = useState<{ [categoryId: string]: VaultItem[] }>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load categories'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadVaultsByCategory = useCallback(async (categoryId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const vaultsData = await getVaultsByCategoryId(categoryId);
      if (vaultsData) {
        setVaults(prev => ({
          ...prev,
          [categoryId]: vaultsData,
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vaults');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    vaults,
    isLoading,
    error,
    loadCategories,
    loadVaultsByCategory,
  };
};

export default useVaultData;
