import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from './client';

// Types for user API responses
export interface UserRegistrationResponse {
  code: number;
  msg: string | null;
  data: null;
}

export interface UserRegistrationCheckResponse {
  code: number;
  msg: string | null;
  data: {
    register: boolean;
  };
}

export interface RewardRecord {
  date: number;
  daily_reward: number;
}

export interface UserRewardsResponse {
  code: number;
  msg: string | null;
  data: {
    cumulative_reward: number;
    rewards: RewardRecord[];
  };
}

// API functions
export const registerUser = async (
  address: string
): Promise<UserRegistrationResponse> => {
  const { data } = await axios.post<UserRegistrationResponse>(
    '/router_api/v1/user',
    {
      address,
    }
  );
  return data;
};

export const checkUserRegistration = async (
  address: string
): Promise<UserRegistrationCheckResponse> => {
  const { data } = await axios.get<UserRegistrationCheckResponse>(
    `/router_api/v1/user/register/${address}`
  );
  return data;
};

export const getUserRewards = async (
  user: string,
  days: string = '5'
): Promise<UserRewardsResponse> => {
  const { data } = await axios.get<UserRewardsResponse>(
    '/router_api/v1/vault/rewards',
    {
      params: { user, days },
    }
  );
  return data;
};

export const createUserAccount = async (
  address: string
): Promise<UserRegistrationResponse> => {
  const { data } = await axios.post<UserRegistrationResponse>(
    '/router_api/v1/user',
    {
      address,
    }
  );
  return data;
};

// React Query hooks
export function useUserRegistration(address: string, enabled: boolean = true) {
  const queryEnabled = enabled && !!address;

  return useQuery({
    queryKey: ['userRegistration', address],
    queryFn: () => checkUserRegistration(address),
    enabled: queryEnabled,
    staleTime: 30000, // 30 seconds cache
  });
}

export function useUserRewards(
  user: string,
  days: string = '5',
  enabled: boolean = true
) {
  const queryEnabled = enabled && !!user;

  return useQuery({
    queryKey: ['userRewards', user, days],
    queryFn: () => getUserRewards(user, days),
    enabled: queryEnabled,
    staleTime: 60000, // 1 minute cache
  });
}

export function useRegisterUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserAccount,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['userRegistration', variables],
      });
    },
    mutationKey: ['registerUser'],
  });
}

// Helper functions
export const isUserRegistered = (
  registrationData: UserRegistrationCheckResponse | undefined
): boolean => {
  return registrationData?.data?.register ?? false;
};

export const getTotalRewards = (
  rewardsData: UserRewardsResponse | undefined
): number => {
  return rewardsData?.data?.cumulative_reward ?? 0;
};

export const getDailyRewards = (
  rewardsData: UserRewardsResponse | undefined
): RewardRecord[] => {
  return rewardsData?.data?.rewards ?? [];
};
