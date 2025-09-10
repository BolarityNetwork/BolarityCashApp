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
