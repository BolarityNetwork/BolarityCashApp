import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import AnimatedNumber from '../AnimatedNumber';
import { useUserBalances } from '@/api/account';
import { useUserRewards, getDailyRewards } from '@/api/user';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';
import useAppRefresh from '@/hooks/useAppRefresh';
import { useTranslation } from 'react-i18next';
import Skeleton from '@/components/common/Skeleton';

interface BalanceSectionProps {
  address: string;
  totalBalance?: number;
  todayEarnings?: number;
  monthlyEarnings?: number;
}

const BalanceSection: React.FC<BalanceSectionProps> = ({ address }) => {
  const { t } = useTranslation();
  const {
    data: balancesData,
    isLoading,
    isError,
    refetch: _refetchBalances,
  } = useUserBalances(address, true);

  const { activeWallet } = useMultiChainWallet();
  const { data: rewardsData, refetch: _refetchRewards } = useUserRewards(
    activeWallet?.address || '',
    '7',
    !!activeWallet?.address
  );
  useAppRefresh(() => {
    if (activeWallet?.address && _refetchBalances) {
      _refetchBalances();
    }
  });
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
      <View className="items-center">
        <Text className="text-[14px] leading-[20px] text-[#ACB3BF]">
          {t('home.totalPortfolioBalance')}
        </Text>
        <Skeleton
          width={180}
          height={42}
          borderRadius={16}
          style={{ marginTop: 6 }}
        />
        <Skeleton
          width={280}
          height={20}
          borderRadius={16}
          style={{ marginTop: 4 }}
        />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="items-center">
        <Text className="text-[14px] leading-[20px] text-[#ACB3BF]">
          {t('home.totalPortfolioBalance')}
        </Text>
        <Text
          style={{
            fontSize: 14,
            lineHeight: 20,
            color: '#ef4444',
            marginTop: 6,
          }}
        >
          {t('home.failedToLoadBalance')}
        </Text>
      </View>
    );
  }

  return (
    <View className="items-center">
      <Text className="text-[14px] leading-[20px] text-[#ACB3BF]">
        {t('home.totalPortfolioBalance')}
      </Text>
      <AnimatedNumber
        value={totalBalance}
        style={{
          fontSize: 30,
          fontWeight: '600',
          color: '#000000',
          lineHeight: 42,
          marginTop: 6,
        }}
        duration={1200}
        formatOptions={{
          minimumFractionDigits: 1,
          maximumFractionDigits: 3,
          prefix: '$',
        }}
      />
      <View className="flex-row justify-start gap-10 mt-1 px-[6px]">
        <View className="flex-2 flex-row items-center gap-1.5 h-[20px]">
          <AnimatedNumber
            value={yesterdayEarnings}
            style={{
              fontSize: 14,
              lineHeight: 20,
              color: '#00C87F',
              fontWeight: '600',
            }}
            duration={800}
            formatOptions={{
              minimumFractionDigits: 2,
              maximumFractionDigits: 3,
              prefix: '+$',
            }}
          />
          <Text className="text-[10px] text-[#ACB3BF]">
            {t('home.yesterday')}
          </Text>
        </View>
        {/* Cumulative earning */}
        <View className="flex-3 flex-row items-center gap-1.5">
          <AnimatedNumber
            value={rewardsData?.data?.cumulative_reward || 0}
            duration={800}
            style={{
              fontSize: 14,
              lineHeight: 20,
              color: '#00C87F',
              fontWeight: '600',
            }}
            formatOptions={{
              minimumFractionDigits: 2,
              maximumFractionDigits: 3,
              prefix: '+$',
            }}
          />
          <Text className="text-[10px] text-[#ACB3BF]">
            {t('home.cumulativeEarnings')}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default BalanceSection;
