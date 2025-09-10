import { useMemo } from 'react';

import { useCoinsByAddress } from '@/api/account';
import { processBalanceData, ProcessedBalanceData } from '@/utils/balance';

interface UseBalanceDataParams {
  address: string;
  network?: string;
  platforms?: string | string[];
  enabled?: boolean;
}

interface UseBalanceDataReturn {
  data: ProcessedBalanceData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

// Default platforms for multi-chain support
const DEFAULT_PLATFORMS = ['Ethereum', 'Optimism', 'Base', 'Arbitrum'];

export const useBalanceData = ({
  address,
  network = 'Mainnet',
  platforms = DEFAULT_PLATFORMS,
  enabled = true,
}: UseBalanceDataParams): UseBalanceDataReturn => {
  const {
    data: coinsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useCoinsByAddress(network, address, platforms, enabled);

  const processedData = useMemo((): ProcessedBalanceData | undefined => {
    if (!coinsResponse?.data) return undefined;

    return processBalanceData(coinsResponse.data, network);
  }, [coinsResponse?.data, network]);

  return {
    data: processedData,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
};

// Hook for single platform balance (e.g., Ethereum only)
export const useEthereumBalance = (
  address: string,
  enabled: boolean = true
) => {
  return useBalanceData({
    address,
    network: 'Mainnet',
    platforms: ['Ethereum'],
    enabled,
  });
};

// Hook for multi-chain balance with all supported platforms
export const useMultiChainBalance = (
  address: string,
  enabled: boolean = true
) => {
  return useBalanceData({
    address,
    network: 'Mainnet',
    platforms: DEFAULT_PLATFORMS,
    enabled,
  });
};

// Hook for testnet balance
export const useTestnetBalance = (address: string, enabled: boolean = true) => {
  return useBalanceData({
    address,
    network: 'Testnet',
    platforms: ['Ethereum'],
    enabled,
  });
};
