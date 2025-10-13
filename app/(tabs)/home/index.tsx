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
import TimeVaultModal from '@/components/modals/TimeVaultModal';
import DepositVaultModal from '@/components/modals/DepositVaultModal';
import ActionsMenu from '@/components/modals/ActionsMenu';

// Import API and Types
import { useVaultData } from '@/hooks/useVaultData';
import { CategoryInfo, VaultItem } from '@/api/vault';
import { CommonSafeAreaView } from '@/components/CommonSafeAreaView';

const PerfectVaultSavingsPlatform: React.FC = () => {
  const { user } = usePrivy();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showVaultListModal, setShowVaultListModal] = useState(false);
  const [showTimeVaultListModal, setShowTimeVaultListModal] = useState(false);
  const [_selectedCategory, setSelectedCategory] =
    useState<CategoryInfo | null>(null);
  const [selectedVault, setSelectedVault] = useState<VaultItem | null>(null);
  const [totalBalance, setTotalBalance] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const { activeWallet } = useMultiChainWallet();
  const { categories } = useVaultData();
  const actionMenuOpacity = new Animated.Value(0);
  const actionMenuScale = new Animated.Value(0.8);

  useEffect(() => {
    const interval = setInterval(() => {
      const increment = Math.random() * 0.04 + 0.01;
      setTotalBalance(prev => prev + increment);

      setTodayEarnings(prev => prev + increment);

      const monthlyIncrement = increment * (Math.random() * 0.5 + 1.2); // 1.2-1.7倍
      setMonthlyEarnings(prev => prev + monthlyIncrement);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

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

  const handleTimeVaultSelection = (vault: VaultItem) => {
    setSelectedVault(vault);
    setSelectedCategory(null);
    setShowTimeVaultListModal(false);
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
    if (category.id === 'flexi') {
      setSelectedCategory(category);
      setSelectedVault(null);
      setShowVaultListModal(true);
      setShowDepositModal(false);
      setShowTimeVaultListModal(false);
    } else if (category.id === 'time') {
      setSelectedCategory(category);
      setSelectedVault(null);
      setShowTimeVaultListModal(true);
      setShowVaultListModal(false);
      setShowDepositModal(false);
    } else {
      setSelectedCategory(category);
      setSelectedVault(null);
      setShowDepositModal(true);
      setShowVaultListModal(false);
      setShowTimeVaultListModal(false);
    }
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
        totalBalance={totalBalance}
        todayEarnings={todayEarnings}
        monthlyEarnings={monthlyEarnings}
      />

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Chart */}
        <ChartSection />

        {/* Vault Products */}
        <VaultList categories={categories} onVaultPress={handleVaultPress} />

        {/* Recent Activity */}
        <ActivityList />

        {/* Bottom Padding */}
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
        visible={showVaultListModal}
        onClose={() => setShowVaultListModal(false)}
        onSelect={handleVaultSelection}
      />

      {/* TimeVault Pro Selection Modal */}
      <TimeVaultModal
        visible={showTimeVaultListModal}
        onClose={() => setShowTimeVaultListModal(false)}
        onSelect={handleTimeVaultSelection}
      />

      {/* Deposit Modal */}
      <DepositVaultModal
        visible={showDepositModal}
        selectedVault={selectedVault}
        selectedSpecificVault={null}
        onClose={() => setShowDepositModal(false)}
      />
    </CommonSafeAreaView>
  );
};

export default PerfectVaultSavingsPlatform;
