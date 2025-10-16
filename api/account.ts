import { useQuery } from '@tanstack/react-query';

import { DEFAULT_CACHE_TIME, EndpointEnum } from '@/lib/endpoint';

import { axios } from './index';

// Types for the coins API response
export interface CoinData {
  name: string;
  platform: string;
  symbol: string;
  address: string;
  amount: string;
  price: string;
  currency: string;
  balance: string;
}

export interface CoinsByAddressResponse {
  status: string;
  error: string | null;
  data: CoinData[];
}

// Types for the balances API response
export interface ProtocolPositionItem {
  protocol: string;
  market: string;
  symbol: string;
  address: string;
  amount: number;
  usdValue: number;
  decimals: number;
  price: number;
  isStable: boolean;
  ptToken?: string; // For Pendle
}

export interface ProtocolBalance {
  protocol: string;
  chainId: number;
  account: string;
  currency: string;
  totals: {
    usd: number;
    breakdown: {
      [key: string]: {
        amount: number;
        usdValue: number;
      };
    };
  };
  items: ProtocolPositionItem[];
  metadata: {
    protocol: string;
    markets: string[];
    positionsCount?: number;
    failures?: Array<{
      market: string;
      asset: string;
      error: string;
    }>;
  };
  timestamp: number;
}

export interface WalletToken {
  protocol: string;
  category: string;
  symbol: string;
  address: string;
  amount: number;
  usdValue: number;
  price: number;
  decimals: number;
  isStable: boolean;
}

export interface WalletBalance {
  stable: WalletToken[];
  assets: WalletToken[];
  totals: {
    usd: number;
    stableUsd: number;
    assetUsd: number;
  };
  failures: any[];
  metadata: {
    tokensEvaluated: number;
  };
}

export interface UserBalancesResponse {
  account: string;
  chainId: number;
  currency: string;
  totals: {
    usd: number;
    depositsUsd: number;
    walletUsd: number;
    stableUsd: number;
  };
  protocols: ProtocolBalance[];
  wallet: WalletBalance;
  failures: any[];
  timestamp: number;
}

// API function to get coins by address
export const getCoinsByAddress = async (
  network: string,
  address: string,
  platforms: string | string[]
): Promise<CoinsByAddressResponse> => {
  const platformsParam = Array.isArray(platforms)
    ? platforms.join('|')
    : platforms;

  const { data } = await axios.get<CoinsByAddressResponse>(
    EndpointEnum.getCoinsByAddress,
    {
      params: {
        network,
        address,
        platforms: platformsParam,
      },
    }
  );
  return data;
};

// React Query hook for getting coins by address
export function useCoinsByAddress(
  network: string,
  address: string,
  platforms: string | string[],
  enabled: boolean = true
) {
  const queryEnabled = enabled && !!address && !!network && !!platforms;

  return useQuery({
    queryKey: [EndpointEnum.getCoinsByAddress, network, address, platforms],
    queryFn: () => {
      return getCoinsByAddress(network, address, platforms);
    },
    enabled: queryEnabled,
    staleTime: DEFAULT_CACHE_TIME,
  });
}

// API function to get user balances across all protocols
export const getUserBalances = async (
  address: string
): Promise<UserBalancesResponse> => {
  const { data } = await axios.get<UserBalancesResponse>(
    `/router_api/v1/balances/${address}`
  );
  return data;
};

// React Query hook for getting user balances
export function useUserBalances(address: string, enabled: boolean = true) {
  const queryEnabled = enabled && !!address;

  return useQuery({
    queryKey: ['userBalances', address],
    queryFn: () => {
      return getUserBalances(address);
    },
    enabled: queryEnabled,
    staleTime: 30000, // 30 seconds cache
    refetchInterval: 60000, // Auto refresh every 60 seconds
  });
}

// Helper function to get protocol balance by name
export const getProtocolBalance = (
  balances: UserBalancesResponse | undefined,
  protocolName: string
): ProtocolBalance | null => {
  if (!balances) return null;
  return (
    balances.protocols.find(
      p => p.protocol.toLowerCase() === protocolName.toLowerCase()
    ) || null
  );
};

// Helper function to get total USD value for a protocol
export const getProtocolTotalUSD = (
  balances: UserBalancesResponse | undefined,
  protocolName: string
): number => {
  const protocol = getProtocolBalance(balances, protocolName);
  return protocol?.totals.usd || 0;
};

// Helper function to get USDC amount in a protocol
export const getProtocolUSDCAmount = (
  balances: UserBalancesResponse | undefined,
  protocolName: string
): number => {
  const protocol = getProtocolBalance(balances, protocolName);
  return protocol?.totals?.usd || 0;
};

// Helper function to get wallet USDC balance
export const getWalletUSDCBalance = (
  balances: UserBalancesResponse | undefined
): number => {
  if (!balances) return 0;
  const usdcToken = balances.wallet.stable.find(
    token => token.symbol === 'USDC'
  );
  return usdcToken?.amount || 0;
};
