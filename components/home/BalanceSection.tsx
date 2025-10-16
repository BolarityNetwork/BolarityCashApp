// components/PerfectVaultSavingsPlatform/components/BalanceSection.tsx
import React from 'react';
import { View, Text } from 'react-native';
import AnimatedNumber from '../AnimatedNumber';
import { useUserBalances } from '@/api/account';

interface BalanceSectionProps {
  address: string;
  totalBalance?: number;
  todayEarnings?: number;
  monthlyEarnings?: number;
}

const BalanceSection: React.FC<BalanceSectionProps> = ({
  address,
  todayEarnings: propTodayEarnings,
  monthlyEarnings: propMonthlyEarnings,
}) => {
  const {
    data: balancesData,
    isLoading,
    isError,
  } = useUserBalances(address, true);
  const totalBalance = balancesData?.totals.usd ?? 0;
  const todayEarnings = propTodayEarnings ?? 0;
  const monthlyEarnings = propMonthlyEarnings ?? 0;
  if (isLoading) {
    return (
      <View className="px-6 py-4">
        <View className="mb-3">
          <Text className="text-sm text-gray-500 mb-3">
            Total Savings Balance
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
            Total Savings Balance
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
          Total Savings Balance
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
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                prefix: '$',
              }}
            />
            <View className="flex-row gap-6">
              <View className="flex-row items-center gap-1.5">
                <AnimatedNumber
                  value={todayEarnings}
                  style={{
                    fontSize: 15,
                    color: '#059669',
                    fontWeight: '600',
                  }}
                  duration={800}
                  formatOptions={{
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                    prefix: '+$',
                  }}
                />
                <Text className="text-sm text-gray-500">today</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <AnimatedNumber
                  value={monthlyEarnings}
                  style={{
                    fontSize: 15,
                    color: '#059669',
                    fontWeight: '600',
                  }}
                  duration={1000}
                  formatOptions={{
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                    prefix: '+$',
                  }}
                />
                <Text className="text-sm text-gray-500">this month</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default BalanceSection;
