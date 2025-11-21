import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AnimatedNumber from '../AnimatedNumber';
import { useUserBalances, getProtocolTotalUSD } from '@/api/account';
import { WalletSwitchModal } from '@/components/modals/WalletSwitchModal';
import { formatAddress } from '@/utils/profile';
import RefreshIcon from '@/assets/icon/common/refresh.svg';
import Skeleton from '../common/Skeleton';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { DashedLine } from '@/components/common/DashedLine';
import ArrowDownIcon from '@/assets/icon/profile/arrow-down.svg';
import EthIcon from '@/assets/icon/profile/ETH.svg';
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

  const aaveBalance = getProtocolTotalUSD(balancesData, 'aave');
  const compoundBalance = getProtocolTotalUSD(balancesData, 'compound');
  const pendleBalance = getProtocolTotalUSD(balancesData, 'pendle');

  return (
    <View className="p-5">
      {/* Header */}
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-[18px] font-[600] leading-[25px] text-black ">
            {t('appProfile.portfolioBalances')}
          </Text>
          <TouchableOpacity
            onPress={() => setShowWalletSwitchModal(true)}
            className="flex-row items-center mt-[6px]"
          >
            <EthIcon />
            <Text className="text-[10px] leading-[14px] ml-[6px]">
              {formatAddress(address)}
            </Text>
            <View className="ml-[5px]">
              <ArrowDownIcon />
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => refetch()} className="p-1">
          <RefreshIcon />
        </TouchableOpacity>
      </View>

      {/* Total Balance */}
      <View className="mt-[7px]">
        <View className="flex-row items-center justify-between">
          {isLoading ? (
            <Skeleton width={170} height={28} borderRadius={12} />
          ) : isError ? (
            <Text className="text-[20px] font-[600] leading-[28px] text-[#EF4444]">
              {t('appProfile.error')}
            </Text>
          ) : (
            <AnimatedNumber
              value={totalBalance}
              style={{
                fontSize: 20,
                fontWeight: '600',
                lineHeight: 28,
                color: '#000000',
              }}
              duration={1200}
              formatOptions={{
                minimumFractionDigits: 1,
                maximumFractionDigits: 3,
                prefix: '$',
              }}
            />
          )}
          <Text className="text-[12px] leading-[17px] text-[#ACB3BE]">
            {t('appProfile.totalBalance')}
          </Text>
        </View>
      </View>

      <DashedLine className="mt-3" />
      {/* Balance Breakdown */}
      <View className="flex-row justify-between mt-3">
        <View className="items-start">
          <Text className="text-[10px] leading-[14px] text-[#ACB3BE]">
            {t('appProfile.saving')}
          </Text>
          <AnimatedNumber
            value={depositsTotal}
            style={{
              fontSize: 16,
              fontWeight: '600',
              lineHeight: 22,
              color: '#00C87F',
              marginTop: 2,
            }}
            duration={800}
            formatOptions={{
              minimumFractionDigits: 1,
              maximumFractionDigits: 3,
              prefix: '$',
            }}
          />
        </View>
        <View className="items-start">
          <Text className="text-[10px] leading-[14px] text-[#ACB3BE]">
            {t('appProfile.cash')}
          </Text>
          <AnimatedNumber
            value={cashTotal}
            style={{
              fontSize: 16,
              fontWeight: '600',
              lineHeight: 22,
              color: '#2381FE',
              marginTop: 2,
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
          <Text className="text-[10px] leading-[14px] text-[#ACB3BE]">
            {t('appProfile.protocols')}
          </Text>
          <Text className="text-[16px] font-[600] leading-[22px] text-black">
            {protocolsCount}
          </Text>
        </View>
      </View>

      {/* Separator */}
      <DashedLine className="mt-[14px]" />

      {/* Protocol Breakdown */}
      <TouchableOpacity
        className="mt-3"
        onPress={() => router.push('/portfolio')}
      >
        <Text className="text-[12px] leading-[17px] text-[#ACB3BE]">
          {t('appProfile.protocol')}
        </Text>
        <View className="mt-[2px]">
          <View className="flex-row items-center justify-between my-[3px]">
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-[#2381FE] mr-2" />
              <Text className="text-[12px] leading-[17px] text-[#000000]">
                {t('appProfile.aave')}
              </Text>
            </View>
            <AnimatedNumber
              value={aaveBalance}
              style={{
                fontSize: 16,
                fontWeight: '600',
                lineHeight: 22,
                color: '#000000',
              }}
              duration={800}
              formatOptions={{
                minimumFractionDigits: 1,
                maximumFractionDigits: 3,
                prefix: '$',
              }}
            />
          </View>
          <View className="flex-row items-center justify-between my-[3px]">
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-[#00C87F] mr-2" />
              <Text className="text-[12px] leading-[17px] text-[#000000]">
                {t('appProfile.compound')}
              </Text>
            </View>
            <AnimatedNumber
              value={compoundBalance}
              style={{
                fontSize: 16,
                fontWeight: '600',
                lineHeight: 22,
                color: '#000000',
              }}
              duration={800}
              formatOptions={{
                minimumFractionDigits: 1,
                maximumFractionDigits: 3,
                prefix: '$',
              }}
            />
          </View>
          <View className="flex-row items-center justify-between my-[3px]">
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-[#FF4D00] mr-2" />
              <Text className="text-[12px] leading-[17px] text-[#000000]">
                {t('appProfile.pendle')}
              </Text>
            </View>
            <AnimatedNumber
              value={pendleBalance}
              style={{
                fontSize: 16,
                fontWeight: '600',
                lineHeight: 22,
                color: '#000000',
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
      </TouchableOpacity>

      {/* Wallet Switch Modal */}
      <WalletSwitchModal
        visible={showWalletSwitchModal}
        onClose={() => setShowWalletSwitchModal(false)}
      />
    </View>
  );
};
