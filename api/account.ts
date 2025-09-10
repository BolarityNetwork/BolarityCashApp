import { useQuery } from '@tanstack/react-query';

import { DEFAULT_CACHE_TIME, EndpointEnum } from '@/lib/endpoint';

import { axiosToken } from './index';

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
  platforms: string
): Promise<CoinsByAddressResponse> => {
  const { data } = await axiosToken.get<CoinsByAddressResponse>(
    EndpointEnum.getCoinsByAddress,
    {
      params: {
        network,
        address,
        platforms,
      },
    }
  );
  return data;
};

// React Query hook for getting coins by address
export function useCoinsByAddress(
  network: string,
  address: string,
  platforms: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: [EndpointEnum.getCoinsByAddress, network, address, platforms],
    queryFn: () => getCoinsByAddress(network, address, platforms),
    enabled: enabled && !!address && !!network && !!platforms,
    staleTime: DEFAULT_CACHE_TIME,
  });
}
