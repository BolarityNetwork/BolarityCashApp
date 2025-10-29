import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AnimatedNumber from '../AnimatedNumber';
import { useUserBalances, getProtocolTotalUSD } from '@/api/account';
import { WalletSwitchModal } from '@/components/modals/WalletSwitchModal';
import { WalletLogo } from '@/components/profile/WalletLogo';
import { formatAddress } from '@/utils/profile';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';
import RefreshIcon from '@/assets/icon/common/refresh.svg';
import Skeleton from '../common/Skeleton';
import { useTranslation } from 'react-i18next';
interface AccountCardProps {
  address: string;
  profileState?: any;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  address,
  profileState: _profileState,
}) => {
  const { t } = useTranslation();
  const [showWalletSwitchModal, setShowWalletSwitchModal] = useState(false);
  const { activeWallet } = useMultiChainWallet();
  const {
    data: balancesData,
    isLoading,
    isError,
    refetch,
  } = useUserBalances(address, true);

  const totalBalance =
    (balancesData?.totals?.depositsUsd || 0) +
    (balancesData?.wallet?.totals?.stableUsd || 0);
  const depositsTotal = balancesData?.totals?.depositsUsd || 0;
  const cashTotal = balancesData?.wallet?.totals?.stableUsd || 0;
  const protocolsCount = balancesData?.protocols.length || 0;

  const ethData = balancesData?.wallet?.assets?.find(
    asset => asset.symbol === 'ETH'
  ) || { amount: 0, usdValue: 0 };
  const totalStablecoins = balancesData?.wallet?.totals?.stableUsd || 0;

  const aaveBalance = getProtocolTotalUSD(balancesData, 'aave');
  const compoundBalance = getProtocolTotalUSD(balancesData, 'compound');
  const pendleBalance = getProtocolTotalUSD(balancesData, 'pendle');

  return (
    <View className="bg-white mx-5 mt-5 rounded-2xl p-5 shadow-sm border border-slate-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-800">
            {t('appProfile.portfolioBalances')}
          </Text>
          <TouchableOpacity
            onPress={() => setShowWalletSwitchModal(true)}
            className="mt-1"
          >
            <View className="flex-row items-center">
              <Text className="text-sm text-slate-500 font-mono">
                {formatAddress(address)}
              </Text>
              <WalletLogo
                type={activeWallet.type === 'ethereum' ? 'ethereum' : 'solana'}
                size={16}
                style={{ marginLeft: 8, marginRight: 4 }}
              />
              <Text className="text-xs text-slate-400">▼</Text>
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => refetch()} className="p-1">
          <RefreshIcon />
        </TouchableOpacity>
      </View>

      {/* Total Balance */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between">
          {isLoading ? (
            <Skeleton width={100} height={24} borderRadius={12} />
          ) : isError ? (
            <Text className="text-2xl font-bold text-red-500">
              {t('appProfile.error')}
            </Text>
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
                minimumFractionDigits: 1,
                maximumFractionDigits: 3,
                prefix: '$',
              }}
            />
          )}
          <Text className="text-sm text-slate-500">
            {t('appProfile.totalBalance')}
          </Text>
        </View>
      </View>

      {/* Separator */}
      <View className="h-px bg-slate-200 mb-4" />

      {/* Balance Breakdown */}
      <View className="flex-row justify-between mb-4">
        <View className="items-center">
          <Text className="text-sm text-slate-500 mb-1">
            {t('appProfile.saving')}
          </Text>
          <AnimatedNumber
            value={depositsTotal}
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#10B981',
            }}
            duration={800}
            formatOptions={{
              minimumFractionDigits: 1,
              maximumFractionDigits: 3,
              prefix: '$',
            }}
          />
        </View>
        <View className="items-center">
          <Text className="text-sm text-slate-500 mb-1">
            {t('appProfile.cash')}
          </Text>
          <AnimatedNumber
            value={cashTotal}
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#3B82F6',
            }}
            duration={800}
            formatOptions={{
              minimumFractionDigits: 1,
              maximumFractionDigits: 3,
              prefix: '$',
            }}
          />
        </View>
        <View className="items-center">
          <Text className="text-sm text-slate-500 mb-1">
            {t('appProfile.protocols')}
          </Text>
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
          {t('appProfile.protocol')}
        </Text>
        <View className="space-y-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
              <Text className="text-sm text-slate-700">
                {t('appProfile.aave')}
              </Text>
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
                minimumFractionDigits: 1,
                maximumFractionDigits: 3,
                prefix: '$',
              }}
            />
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              <Text className="text-sm text-slate-700">
                {t('appProfile.compound')}
              </Text>
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
                minimumFractionDigits: 1,
                maximumFractionDigits: 3,
                prefix: '$',
              }}
            />
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
              <Text className="text-sm text-slate-700">
                {t('appProfile.pendle')}
              </Text>
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
                minimumFractionDigits: 1,
                maximumFractionDigits: 3,
                prefix: '$',
              }}
            />
          </View>
        </View>
      </View>

      {/* Separator */}
      <View className="h-px bg-slate-200 mb-4" />

      {/* ETH and Stablecoin Balance */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-slate-600 mb-3">
          {t('appProfile.asset')}
        </Text>
        <View className="space-y-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
              <Text className="text-sm text-slate-700">
                {t('appProfile.eth')}
              </Text>
            </View>
            <View className="flex items-end">
              <AnimatedNumber
                value={ethData.amount}
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: '#1e293b',
                }}
                duration={800}
                formatOptions={{
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 6,
                }}
              />
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-teal-500 mr-2" />
              <Text className="text-sm text-slate-700">
                {t('appProfile.stablecoins')}
              </Text>
            </View>
            <AnimatedNumber
              value={totalStablecoins}
              style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: '#1e293b',
              }}
              duration={800}
              formatOptions={{
                minimumFractionDigits: 1,
                maximumFractionDigits: 3,
                prefix: '$',
              }}
            />
          </View>
        </View>
      </View>

      {/* Wallet Switch Modal */}
      <WalletSwitchModal
        visible={showWalletSwitchModal}
        onClose={() => setShowWalletSwitchModal(false)}
      />
    </View>
  );
};
