import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import AnimatedNumber from '../AnimatedNumber';
import { useUserBalances } from '@/api/account';
import { useUserRewards, getDailyRewards } from '@/api/user';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';

interface BalanceSectionProps {
  address: string;
  totalBalance?: number;
  todayEarnings?: number;
  monthlyEarnings?: number;
}

const BalanceSection: React.FC<BalanceSectionProps> = ({ address }) => {
  const {
    data: balancesData,
    isLoading,
    isError,
  } = useUserBalances(address, true);

  const { activeWallet } = useMultiChainWallet();
  const { data: rewardsData } = useUserRewards(
    activeWallet?.address || '',
    '7',
    !!activeWallet?.address
  );

  const totalBalance =
    (balancesData?.totals?.depositsUsd || 0) +
    (balancesData?.wallet?.totals?.stableUsd || 0);

  const yesterdayEarnings = useMemo(() => {
    if (!rewardsData) return 0;

    const dailyRewards = getDailyRewards(rewardsData);
    if (!dailyRewards || dailyRewards.length === 0) return 0;
    const lastDataPoint = dailyRewards[1];
    return lastDataPoint?.daily_reward || 0;
  }, [rewardsData]);
  if (isLoading) {
    return (
      <View className="px-6 py-4">
        <View className="mb-3">
          <Text className="text-sm text-gray-500 mb-3">
            Total Portfolio Balance
          </Text>
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <View className="h-8 bg-gray-200 rounded mb-3 w-3/5" />
              <View className="flex-row gap-6">
                <View className="h-5 bg-gray-200 rounded w-16" />
                <View className="h-5 bg-gray-200 rounded w-20" />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="px-6 py-4">
        <View className="mb-3">
          <Text className="text-sm text-gray-500 mb-3">
            Total Portfolio Balance
          </Text>
          <View className="items-center justify-center py-8">
            <Text className="text-sm text-red-500">Failed to load balance</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="px-6 py-4">
      <View className="mb-3">
        <Text className="text-sm text-gray-500 mb-3">
          Total Portfolio Balance
        </Text>
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <AnimatedNumber
              value={totalBalance}
              style={{
                fontSize: 28,
                fontWeight: '300',
                color: '#111827',
                marginBottom: 8,
              }}
              duration={1200}
              formatOptions={{
                minimumFractionDigits: 1,
                maximumFractionDigits: 3,
                prefix: '$',
              }}
            />
            <View className="flex-row gap-6">
              <View className="flex-row items-center gap-1.5">
                <AnimatedNumber
                  value={yesterdayEarnings}
                  style={{
                    fontSize: 15,
                    color: '#059669',
                    fontWeight: '600',
                  }}
                  duration={800}
                  formatOptions={{
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 3,
                    prefix: '+$',
                  }}
                />
                <Text className="text-sm text-gray-500">yesterday</Text>
              </View>
              {/* Cumulative earning */}
              <View className="flex-row items-center gap-1.5">
                <AnimatedNumber
                  value={rewardsData?.data?.cumulative_reward || 0}
                  duration={800}
                  style={{
                    fontSize: 15,
                    color: '#059669',
                    fontWeight: '600',
                  }}
                  formatOptions={{
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 3,
                    prefix: '+$',
                  }}
                />
                <Text className="text-sm text-gray-500">
                  cumulative earnings
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default BalanceSection;
