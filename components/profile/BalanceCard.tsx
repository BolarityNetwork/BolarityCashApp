import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import AnimatedNumber from '../AnimatedNumber';
import { useUserBalances, getProtocolTotalUSD } from '@/api/account';

interface BalanceCardProps {
  address: string;
  profileState?: any;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  address,
  profileState: _profileState,
}) => {
  const {
    data: balancesData,
    isLoading,
    isError,
    refetch,
  } = useUserBalances(address, true);

  const totalBalance = balancesData?.totals.usd || 0;
  const depositsTotal = balancesData?.totals.depositsUsd || 0;
  const walletTotal = balancesData?.totals.walletUsd || 0;
  const protocolsCount = balancesData?.protocols.length || 0;

  // Protocol balances
  const aaveBalance = getProtocolTotalUSD(balancesData, 'aave');
  const compoundBalance = getProtocolTotalUSD(balancesData, 'compound');
  const pendleBalance = getProtocolTotalUSD(balancesData, 'pendle');

  return (
    <View className="bg-white mx-5 mt-5 rounded-2xl p-5 shadow-sm border border-slate-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Text className="text-lg font-bold text-slate-800">
            Account Balances
          </Text>
        </View>
        <TouchableOpacity onPress={() => refetch()} className="p-1">
          <Text className="text-lg">🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Total Balance */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between">
          {isLoading ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : isError ? (
            <Text className="text-2xl font-bold text-red-500">Error</Text>
          ) : (
            <AnimatedNumber
              value={totalBalance}
              style={{
                fontSize: 24,
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
          <Text className="text-sm text-slate-500">Total Balance</Text>
        </View>
      </View>

      {/* Separator */}
      <View className="h-px bg-slate-200 mb-4" />

      {/* Balance Breakdown */}
      <View className="flex-row justify-between mb-4">
        <View className="items-center">
          <Text className="text-sm text-slate-500 mb-1">Deposits</Text>
          <AnimatedNumber
            value={depositsTotal}
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#10B981',
            }}
            duration={800}
            formatOptions={{
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              prefix: '$',
            }}
          />
        </View>
        <View className="items-center">
          <Text className="text-sm text-slate-500 mb-1">Wallet</Text>
          <AnimatedNumber
            value={walletTotal}
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#3B82F6',
            }}
            duration={800}
            formatOptions={{
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              prefix: '$',
            }}
          />
        </View>
        <View className="items-center">
          <Text className="text-sm text-slate-500 mb-1">Protocols</Text>
          <Text className="text-lg font-bold text-slate-800">
            {protocolsCount}
          </Text>
        </View>
      </View>

      {/* Separator */}
      <View className="h-px bg-slate-200 mb-4" />

      {/* Protocol Breakdown */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-slate-600 mb-3">
          Protocol Breakdown
        </Text>
        <View className="space-y-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
              <Text className="text-sm text-slate-700">Aave</Text>
            </View>
            <AnimatedNumber
              value={aaveBalance}
              style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: '#1e293b',
              }}
              duration={800}
              formatOptions={{
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                prefix: '$',
              }}
            />
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              <Text className="text-sm text-slate-700">Compound</Text>
            </View>
            <AnimatedNumber
              value={compoundBalance}
              style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: '#1e293b',
              }}
              duration={800}
              formatOptions={{
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                prefix: '$',
              }}
            />
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
              <Text className="text-sm text-slate-700">Pendle</Text>
            </View>
            <AnimatedNumber
              value={pendleBalance}
              style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: '#1e293b',
              }}
              duration={800}
              formatOptions={{
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                prefix: '$',
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};
