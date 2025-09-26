import { useState, useEffect, useCallback } from 'react';
import useMultiChainWallet from './useMultiChainWallet';
import CompoundService from '@/api/CompoundService';
import { useAPRStore } from '@/stores/aprStore';

interface APRInfo {
  baseAPR: number;
  compAPR: number;
  totalAPR: number;
}

interface BalanceInfo {
  supplied: number;
  compRewards: number;
  totalValue: number;
}

interface CompoundInfoHook {
  // Service state
  service: CompoundService | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Data state
  aprInfo: APRInfo | null;
  balanceInfo: BalanceInfo | null;

  // Actions (read-only)
  loadAPRInfo: (forceRefresh?: boolean) => Promise<void>;
  loadBalanceInfo: () => Promise<void>;

  // Utility
  refreshData: () => Promise<void>;
}

export const useCompoundService = (): CompoundInfoHook => {
  const { activeWallet } = useMultiChainWallet();

  // Service state
  const [service, setService] = useState<CompoundService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo | null>(null);

  // Zustand store for APR caching
  const {
    getAPRData,
    setAPRData,
    hasValidCache,
    setLoading,
    setError,
    isLoading,
    errors,
  } = useAPRStore();

  // Cache key for Compound APR
  const cacheKey = 'compound_8453';

  // Initialize service (read-only mode, no private key needed)
  useEffect(() => {
    const initializeService = async () => {
      if (!activeWallet.address) {
        setService(null);
        setIsInitialized(false);
        return;
      }

      setLoading(cacheKey, true);
      setError(cacheKey, null);

      try {
        // 创建只读模式的 CompoundService（不需要私钥）
        const compoundService = new CompoundService('');
        setService(compoundService);
        setIsInitialized(true);

        console.log(
          'CompoundService initialized successfully (read-only mode)'
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(
          cacheKey,
          `Failed to initialize CompoundService: ${errorMessage}`
        );
        console.error('Failed to initialize CompoundService:', err);
      } finally {
        setLoading(cacheKey, false);
      }
    };

    initializeService();
  }, [activeWallet.address]);

  // Load APR info with Zustand caching
  const loadAPRInfo = useCallback(
    async (forceRefresh: boolean = false) => {
      if (!service) {
        setError(cacheKey, 'Compound service not initialized');
        return;
      }

      // 检查缓存，如果不强制刷新且缓存存在，直接使用缓存
      if (!forceRefresh && hasValidCache(cacheKey)) {
        console.log('Using cached APR info from Zustand store');
        return; // APR data is already available in store
      }

      setLoading(cacheKey, true);
      setError(cacheKey, null);

      try {
        console.log('Fetching fresh APR info from RPC');
        const apr = await service.getAPRInfo();

        // 缓存数据到 Zustand store（5分钟 TTL）
        setAPRData(cacheKey, apr, 5 * 60 * 1000);

        console.log('APR info cached successfully in Zustand store');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(cacheKey, `Failed to load APR info: ${errorMessage}`);
        console.error('Failed to load APR info:', err);
      } finally {
        setLoading(cacheKey, false);
      }
    },
    [
      service,
      cacheKey,
      getAPRData,
      setAPRData,
      hasValidCache,
      setLoading,
      setError,
    ]
  );

  // Load balance info
  const loadBalanceInfo = useCallback(async () => {
    if (!service || !activeWallet.address) {
      setError(
        cacheKey,
        'Compound service not initialized or wallet not connected'
      );
      return;
    }

    setLoading(cacheKey, true);
    setError(cacheKey, null);

    try {
      const balance = await service.getUserBalance(activeWallet.address);
      setBalanceInfo(balance);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(cacheKey, `Failed to load balance info: ${errorMessage}`);
      console.error('Failed to load balance info:', err);
    } finally {
      setLoading(cacheKey, false);
    }
  }, [service, activeWallet.address, cacheKey, setLoading, setError]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([loadAPRInfo(true), loadBalanceInfo()]); // 强制刷新 APR
  }, [loadAPRInfo, loadBalanceInfo]);

  // Get APR data from Zustand store
  const aprInfo = getAPRData(cacheKey);

  return {
    // Service state
    service,
    isInitialized,
    isLoading: isLoading[cacheKey] || false,
    error: errors[cacheKey] || null,

    // Data state
    aprInfo,
    balanceInfo,

    // Actions (read-only)
    loadAPRInfo,
    loadBalanceInfo,

    // Utility
    refreshData,
  };
};

export default useCompoundService;
