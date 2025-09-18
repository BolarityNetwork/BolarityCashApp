import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { formatAddress } from '@/utils/profile';
import AnimatedNumber from '../AnimatedNumber';
import { useMultiChainBalance } from '@/hooks/useBalanceData';
import { calculateAssetDistribution, AssetDistribution } from '@/utils/balance';

interface BalanceCardProps {
  address: string;
  totalBalance?: number;
  assetDistribution?: AssetDistribution;
  profileState?: any;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  address,
  totalBalance: propTotalBalance,
  assetDistribution: propAssetDistribution,
  profileState,
}) => {
  const {
    data: balanceData,
    isLoading,
    isError,
  } = useMultiChainBalance(address);

  const totalBalance = balanceData?.totalBalance ?? propTotalBalance ?? 0;

  // Calculate dynamic asset distribution from balance data
  const dynamicAssetDistribution = balanceData?.allTokens
    ? calculateAssetDistribution(balanceData.allTokens)
    : (propAssetDistribution ?? { USD: 1.0, BTC: 0, ETH: 0, Other: 0 });

  // Use dynamic distribution if available, otherwise fall back to prop
  const assetDistribution =
    totalBalance === 0
      ? { USD: 1.0, BTC: 0, ETH: 0, Other: 0 }
      : balanceData?.allTokens
        ? dynamicAssetDistribution
        : (propAssetDistribution ?? { USD: 1.0, BTC: 0, ETH: 0, Other: 0 });

  const usdPercentage = assetDistribution.USD;
  const btcPercentage = assetDistribution.BTC;
  const ethPercentage = assetDistribution.ETH;
  const otherPercentage = assetDistribution.Other;

  return (
    <View className="bg-white mx-5 mt-5 rounded-2xl p-5 shadow-sm border border-slate-100">
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
      <View className="mb-3">
        <View className="h-6 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <View className="flex-row h-full">
            <View
              style={{
                width: `${usdPercentage * 100}%`,
                backgroundColor: '#10B981',
              }}
            />
            <View
              style={{
                width: `${btcPercentage * 100}%`,
                backgroundColor: '#F59E0B',
              }}
            />
            <View
              style={{
                width: `${ethPercentage * 100}%`,
                backgroundColor: '#3B82F6',
              }}
            />
            <View
              style={{
                width: `${otherPercentage * 100}%`,
                backgroundColor: '#8B5CF6',
              }}
            />
          </View>
        </View>
      </View>

      <View className="flex-row relative h-6">
        {usdPercentage > 0 && (
          <View
            className="absolute items-center"
            style={{
              left: `${usdPercentage * 50}%`,
              transform: [{ translateX: -15 }],
            }}
          >
            <Text className="text-xs font-medium text-slate-600">USD</Text>
          </View>
        )}

        {btcPercentage > 0 && (
          <View
            className="absolute items-center"
            style={{
              left: `${(usdPercentage + btcPercentage * 0.5) * 100}%`,
              transform: [{ translateX: -15 }],
            }}
          >
            <Text className="text-xs font-medium text-slate-600">BTC</Text>
          </View>
        )}

        {ethPercentage > 0 && (
          <View
            className="absolute items-center"
            style={{
              left: `${(usdPercentage + btcPercentage + ethPercentage * 0.5) * 100}%`,
              transform: [{ translateX: -15 }],
            }}
          >
            <Text className="text-xs font-medium text-slate-600">ETH</Text>
          </View>
        )}

        {otherPercentage > 0 && (
          <View
            className="absolute items-center"
            style={{
              left: `${(usdPercentage + btcPercentage + ethPercentage + otherPercentage * 0.5) * 100}%`,
              transform: [{ translateX: -20 }],
            }}
          >
            <Text className="text-xs font-medium text-slate-600">Other</Text>
          </View>
        )}
      </View>
    </View>
  );
};
