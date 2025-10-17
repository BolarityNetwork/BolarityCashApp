// components/PerfectVaultSavingsPlatform/index.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StatusBar, Animated } from 'react-native';
import { usePrivy } from '@privy-io/expo';
import useMultiChainWallet from '@/hooks/useMultiChainWallet';

// Import Components
import Header from '@/components/home/Headers';
import BalanceSection from '@/components/home/BalanceSection';
import ChartSection from '@/components/home/ChartSection';
import VaultList from '@/components/home/VaultList';
import ActivityList from '@/components/home/ActivityList';

// Import Modals
import VaultSelectionModal from '@/components/modals/VaultSelectionModal';
import DepositVaultModal from '@/components/modals/DepositVaultModal';
import ActionsMenu from '@/components/modals/ActionsMenu';

// Import API and Types
import { CategoryInfo, VaultItem } from '@/api/vault';
import { useUserRewards, getDailyRewards } from '@/api/user';
import { CommonSafeAreaView } from '@/components/CommonSafeAreaView';

const PerfectVaultSavingsPlatform: React.FC = () => {
  const { user } = usePrivy();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showVaultListModal, setShowVaultListModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryInfo | null>(
    null
  );
  const [selectedVault, setSelectedVault] = useState<VaultItem | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const { activeWallet } = useMultiChainWallet();

  // Fetch user rewards data for earnings calculation
  const { data: todayRewardsData } = useUserRewards(
    activeWallet?.address || '',
    '1',
    !!activeWallet?.address
  );

  const { data: monthlyRewardsData } = useUserRewards(
    activeWallet?.address || '',
    '30',
    !!activeWallet?.address
  );

  // Calculate earnings from API data
  const todayEarnings = React.useMemo(() => {
    if (!todayRewardsData) return 0;
    const dailyRewards = getDailyRewards(todayRewardsData);
    // Get today's reward (last item in array)
    return dailyRewards.length > 0
      ? dailyRewards[dailyRewards.length - 1]?.daily_reward || 0
      : 0;
  }, [todayRewardsData]);

  const monthlyEarnings = React.useMemo(() => {
    if (!monthlyRewardsData) return 0;
    const dailyRewards = getDailyRewards(monthlyRewardsData);
    // Sum all rewards in the last 30 days
    return dailyRewards.reduce(
      (total, reward) => total + reward.daily_reward,
      0
    );
  }, [monthlyRewardsData]);
  const actionMenuOpacity = new Animated.Value(0);
  const actionMenuScale = new Animated.Value(0.8);

  useEffect(() => {
    if (showActionsMenu) {
      Animated.parallel([
        Animated.timing(actionMenuOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(actionMenuScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(actionMenuOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(actionMenuScale, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showActionsMenu]);

  const handleVaultSelection = (vault: VaultItem) => {
    setSelectedVault(vault);
    setSelectedCategory(null);
    setShowVaultListModal(false);
    setShowDepositModal(true);
  };

  const formatAddress = (address: string) => {
    if (!address) return 'Not Connected';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getCurrentWalletInfo = () => {
    if (activeWallet.address) {
      return {
        address: activeWallet.address,
        type: activeWallet.type === 'ethereum' ? 'ETH' : 'SOL',
        icon: activeWallet.icon,
        network: activeWallet.network,
      };
    }
    return {
      address: null,
      type: 'Not Connected',
      icon: '💼',
      network: 'N/A',
    };
  };

  const currentWalletInfo = getCurrentWalletInfo();

  const handleVaultPress = (category: CategoryInfo) => {
    setSelectedCategory(category);
    setShowVaultListModal(true);
  };

  return (
    <CommonSafeAreaView className="flex-1 bg-gray-50" isIncludeBottomBar={true}>
      <StatusBar barStyle="dark-content" />

      <Header
        user={user}
        currentWalletInfo={currentWalletInfo}
        formatAddress={formatAddress}
      />
      <BalanceSection
        address={activeWallet.address}
        todayEarnings={todayEarnings}
        monthlyEarnings={monthlyEarnings}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 10 }}
        showsVerticalScrollIndicator={false}
      >
        <ChartSection />

        <VaultList handleVaultPress={handleVaultPress} />

        <ActivityList />

        <View className="h-5" />
      </ScrollView>

      {/* Actions Menu */}
      <ActionsMenu
        visible={showActionsMenu}
        onClose={() => setShowActionsMenu(false)}
        opacity={actionMenuOpacity}
        scale={actionMenuScale}
      />

      {/* FlexiVault Selection Modal */}
      <VaultSelectionModal
        selectedCategory={selectedCategory}
        visible={showVaultListModal}
        onClose={() => setShowVaultListModal(false)}
        onSelect={handleVaultSelection}
      />

      {/* Deposit Modal */}
      <DepositVaultModal
        visible={showDepositModal}
        selectedVault={selectedVault}
        onClose={() => setShowDepositModal(false)}
      />
    </CommonSafeAreaView>
  );
};

export default PerfectVaultSavingsPlatform;
