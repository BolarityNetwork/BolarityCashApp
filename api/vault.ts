import { useQuery } from '@tanstack/react-query';
import { axios } from './client';

export interface VaultItem {
  id: string;
  apy: string;
  category: string;
  chain: string;
  icon: string;
  market: string;
  note: string;
  protocol: string;
  risk: string;
  tvl: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  apy: string;
}

// API functions for vault categories
export const getVaultCategories = async (): Promise<CategoryInfo[]> => {
  const { data } = await axios.get<CategoryInfo[]>(
    '/router_api/v1/vault/category'
  );
  return data;
};

// API function to get vault details
export const getVaultDetails = async (
  id?: string,
  category?: string
): Promise<VaultItem[]> => {
  const params: { id?: string; category?: string } = {};
  if (id) params.id = id;
  if (category) params.category = category;

  const { data } = await axios.get<VaultItem[]>('/router_api/v1/vault/detail', {
    params,
  });
  return data;
};

export const getVaultsByCategoryId = async (
  categoryId: string
): Promise<VaultItem[]> => {
  const { data } = await axios.get<VaultItem[]>(`/router_api/v1/vault/detail`, {
    params: { category: categoryId },
  });
  return data;
};

// React Query hooks for vault APIs
export function useVaultCategories() {
  return useQuery({
    queryKey: ['vaultCategories'],
    queryFn: getVaultCategories,
    staleTime: 300000, // 5 minutes cache
  });
}

export function useVaultDetails(id?: string, category?: string) {
  return useQuery({
    queryKey: ['vaultDetails', id, category],
    queryFn: () => getVaultDetails(id, category),
    staleTime: 300000, // 5 minutes cache
  });
}

export function useVaultsByCategory(category: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['vaultsByCategory', category],
    queryFn: () => getVaultDetails(undefined, category),
    enabled: !!category && enabled,
    staleTime: 300000, // 5 minutes cache
  });
}

export function useVaultById(id: string) {
  return useQuery({
    queryKey: ['vaultById', id],
    queryFn: () => getVaultDetails(id),
    enabled: !!id,
    staleTime: 300000, // 5 minutes cache
  });
}
