import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { formatAddress } from '@/utils/profile';
import AnimatedNumber from '../AnimatedNumber';
import { useMultiChainBalance } from '@/hooks/useBalanceData';

interface BalanceCardProps {
  address: string;
  totalBalance?: number;
  assetDistribution?: {
    USD: number;
    BTC: number;
    ETH: number;
  };
  profileState?: any;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  address,
  totalBalance: propTotalBalance,
  assetDistribution = { USD: 0.4, BTC: 0.35, ETH: 0.25 },
  profileState,
}) => {
  const {
    data: balanceData,
    isLoading,
    isError,
  } = useMultiChainBalance(address);

  const totalBalance = balanceData?.totalBalance ?? propTotalBalance ?? 0;

  // Calculate total for percentage calculation
  const total =
    assetDistribution.USD + assetDistribution.BTC + assetDistribution.ETH;
  const usdPercentage = total > 0 ? assetDistribution.USD / total : 0;
  const btcPercentage = total > 0 ? assetDistribution.BTC / total : 0;
  const ethPercentage = total > 0 ? assetDistribution.ETH / total : 0;

  return (
    <View className="bg-white mx-5 mt-5 rounded-2xl p-5 shadow-sm border border-slate-100">
      {/* Balance Section */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-medium text-slate-600">balance</Text>
          <View className="flex-row items-center">
            {isLoading ? (
              <Text className="text-lg font-bold text-slate-800">
                Loading...
              </Text>
            ) : isError ? (
              <Text className="text-lg font-bold text-red-500">Error</Text>
            ) : (
              <AnimatedNumber
                value={totalBalance}
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#1e293b',
                }}
                duration={1200}
                formatOptions={{
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                  prefix: '$',
                }}
              />
            )}
          </View>
        </View>
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-slate-600">account</Text>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => profileState?.openModal('walletSwitch')}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Text className="text-sm font-mono text-slate-800 mr-2">
                {formatAddress(address)}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-xs text-indigo-500">🔄</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Asset Distribution Bar */}
      <View className="mb-3">
        <View className="h-6 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <View className="flex-row h-full">
            {/* USD Segment */}
            <View
              className="bg-green-500"
              style={{ width: `${usdPercentage * 100}%` }}
            />
            {/* BTC Segment */}
            <View
              className="bg-yellow-500"
              style={{ width: `${btcPercentage * 100}%` }}
            />
            {/* ETH Segment */}
            <View
              className="bg-red-500"
              style={{ width: `${ethPercentage * 100}%` }}
            />
            {/* Empty space */}
            <View
              className="bg-white"
              style={{
                width: `${(1 - usdPercentage - btcPercentage - ethPercentage) * 100}%`,
              }}
            />
          </View>
        </View>
      </View>

      {/* Asset Labels */}
      <View className="flex-row justify-between">
        <View className="items-center">
          <Text className="text-xs font-medium text-slate-600">USD</Text>
        </View>
        <View className="items-center">
          <Text className="text-xs font-medium text-slate-600">BTC</Text>
        </View>
        <View className="items-center">
          <Text className="text-xs font-medium text-slate-600">ETH</Text>
        </View>
        <View className="items-center">
          <Text className="text-xs font-medium text-slate-400">Other</Text>
        </View>
      </View>
    </View>
  );
};
