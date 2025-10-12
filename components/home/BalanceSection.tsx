// components/PerfectVaultSavingsPlatform/components/BalanceSection.tsx
import React from 'react';
import { View, Text } from 'react-native';
import AnimatedNumber from '../AnimatedNumber';
import { useMultiChainBalance } from '@/hooks/useBalanceData';

interface BalanceSectionProps {
  address: string;
  totalBalance?: number;
  todayEarnings?: number;
  monthlyEarnings?: number;
}

const BalanceSection: React.FC<BalanceSectionProps> = ({
  address,
  totalBalance: propTotalBalance,
  todayEarnings: propTodayEarnings,
  monthlyEarnings: propMonthlyEarnings,
}) => {
  const {
    data: balanceData,
    isLoading,
    isError,
  } = useMultiChainBalance(address);
  const totalBalance = balanceData?.totalBalance ?? propTotalBalance ?? 0;
  const todayEarnings = balanceData?.todayEarnings ?? propTodayEarnings ?? 0;
  const monthlyEarnings =
    balanceData?.monthlyEarnings ?? propMonthlyEarnings ?? 0;

  if (isLoading) {
    return (
      <View className="px-5 pb-1.5">
        <View className="mb-1">
          <View className="flex-row items-center mb-2 gap-2">
            <Text className="text-sm text-gray-500">Total Savings Balance</Text>
          </View>
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <View className="h-8 bg-gray-200 rounded mb-2 w-3/5" />
              <View className="flex-row gap-4">
                <View className="h-5 bg-gray-200 rounded w-15" />
                <View className="h-5 bg-gray-200 rounded w-15" />
              </View>
            </View>
            <View className="bg-gray-200 px-3 py-1.5 rounded-2xl h-8 w-20 -mt-1" />
          </View>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="px-5 pb-1.5">
        <View className="mb-1">
          <View className="flex-row items-center mb-2 gap-2">
            <Text className="text-sm text-gray-500">Total Savings Balance</Text>
          </View>
          <View className="items-center justify-center py-5">
            <Text className="text-sm text-red-500">Failed to load balance</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="px-5 pb-1.5">
      <View className="mb-1">
        <View className="flex-row items-center mb-2 gap-2">
          <Text className="text-sm text-gray-500">Total Savings Balance</Text>
        </View>
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <AnimatedNumber
              value={totalBalance}
              style={{
                fontSize: 26,
                fontWeight: '300',
                color: '#111827',
                marginBottom: 0,
              }}
              duration={1200}
              formatOptions={{
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                prefix: '$',
              }}
            />
            {(todayEarnings > 0 || monthlyEarnings > 0) && (
              <View className="flex-row gap-4">
                {todayEarnings > 0 && (
                  <View className="flex-row items-center gap-1">
                    <AnimatedNumber
                      value={todayEarnings}
                      style={{
                        fontSize: 14,
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
                )}
                {monthlyEarnings > 0 && (
                  <View className="flex-row items-center gap-1">
                    <AnimatedNumber
                      value={monthlyEarnings}
                      style={{
                        fontSize: 14,
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
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default BalanceSection;
