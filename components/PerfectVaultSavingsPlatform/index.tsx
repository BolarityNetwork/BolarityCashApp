// components/PerfectVaultSavingsPlatform/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  Animated,
  SafeAreaView,
} from 'react-native';
import { usePrivy } from "@privy-io/expo";
import useMultiChainWallet from '../../hooks/useMultiChainWallet';

// Import Components
import Header from './components/Headers';
import BalanceSection from './components/BalanceSection';
import ChartSection from './components/ChartSection';
import VaultList from './components/VaultList';
import ActivityList from './components/ActivityList';

// Import Modals
import VaultSelectionModal from './modals/VaultSelectionModal';
import TimeVaultModal from './modals/TimeVaultModal';
import DepositModal from './modals/DepositModal';
import ActionsMenu from './modals/ActionsMenu';

// Import Constants and Styles
import {
  vaultOptions,
  timeVaultOptions,
  vaultProducts,
  savingsHistory,
  VaultOption,
  TimeVaultOption,
  VaultProduct,
} from './constants';
import { styles } from './styles';

const PerfectVaultSavingsPlatform: React.FC = () => {
  const { user } = usePrivy();
  const [showBalance, setShowBalance] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showVaultListModal, setShowVaultListModal] = useState(false);
  const [showTimeVaultListModal, setShowTimeVaultListModal] = useState(false);
  const [selectedVault, setSelectedVault] = useState<VaultProduct | null>(null);
  const [selectedSpecificVault, setSelectedSpecificVault] = useState<VaultOption | TimeVaultOption | null>(null);
  const [totalBalance, setTotalBalance] = useState(127845.67);
  const [todayEarnings, setTodayEarnings] = useState(293.52);
  const [monthlyEarnings, setMonthlyEarnings] = useState(8247.18);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // 多链钱包状态
  const {
    activeWalletType,
    ethereumWallet,
    solanaWallet,
    activeWallet
  } = useMultiChainWallet();

  // 动画值
  const actionMenuOpacity = new Animated.Value(0);
  const actionMenuScale = new Animated.Value(0.8);

  // 动画更新余额
  useEffect(() => {
    const interval = setInterval(() => {
      const increment = Math.random() * 0.04 + 0.01;
      setTotalBalance(prev => prev + increment);
      
      // 🎯 今日收益的增量与总余额增量保持一致
      setTodayEarnings(prev => prev + increment);
      
      // 月度收益可以是总余额增量的略微倍数（模拟累积效果）
      const monthlyIncrement = increment * (Math.random() * 0.5 + 1.2); // 1.2-1.7倍
      setMonthlyEarnings(prev => prev + monthlyIncrement);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // 动作菜单动画
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

  const handleVaultSelection = (vaultOption: VaultOption) => {
    setSelectedSpecificVault(vaultOption);
    setSelectedVault(null);
    setShowVaultListModal(false);
    setShowDepositModal(true);
  };

  const handleTimeVaultSelection = (timeVaultOption: TimeVaultOption) => {
    setSelectedSpecificVault(timeVaultOption);
    setSelectedVault(null);
    setShowTimeVaultListModal(false);
    setShowDepositModal(true);
  };

  // 格式化地址显示
  const formatAddress = (address: string) => {
    if (!address) return 'Not Connected';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 获取当前钱包信息用于显示
  const getCurrentWalletInfo = () => {
    if (activeWallet.address) {
      return {
        address: activeWallet.address,
        type: activeWallet.type === 'ethereum' ? 'ETH' : 'SOL',
        icon: activeWallet.icon,
        network: activeWallet.network
      };
    }
    return {
      address: null,
      type: 'Not Connected',
      icon: '💼',
      network: 'N/A'
    };
  };

  const currentWalletInfo = getCurrentWalletInfo();

  const handleVaultPress = (vault: VaultProduct) => {
    if (vault.name === 'FlexiVault') {
      setSelectedVault(vault);
      setSelectedSpecificVault(null);
      setShowVaultListModal(true);
      setShowDepositModal(false);
      setShowTimeVaultListModal(false);
    } else if (vault.name === 'TimeVault Pro') {
      setSelectedVault(vault);
      setSelectedSpecificVault(null);
      setShowTimeVaultListModal(true);
      setShowVaultListModal(false);
      setShowDepositModal(false);
    } else {
      setSelectedVault(vault);
      setSelectedSpecificVault(null);
      setShowDepositModal(true);
      setShowVaultListModal(false);
      setShowTimeVaultListModal(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <SafeAreaView>
          <Header 
            user={user} 
            currentWalletInfo={currentWalletInfo}
            formatAddress={formatAddress}
          />
          <BalanceSection
            totalBalance={totalBalance}
            todayEarnings={todayEarnings}
            monthlyEarnings={monthlyEarnings}
          />
        </SafeAreaView>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Chart */}
        <ChartSection />

        {/* Vault Products */}
        <VaultList 
          vaultProducts={vaultProducts}
          onVaultPress={handleVaultPress}
        />

        {/* Recent Activity */}
        <ActivityList transactions={savingsHistory} />

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
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
        vaultOptions={vaultOptions}
        onClose={() => setShowVaultListModal(false)}
        onSelect={handleVaultSelection}
      />

      {/* TimeVault Pro Selection Modal */}
      <TimeVaultModal
        visible={showTimeVaultListModal}
        timeVaultOptions={timeVaultOptions}
        onClose={() => setShowTimeVaultListModal(false)}
        onSelect={handleTimeVaultSelection}
      />

      {/* Deposit Modal */}
      <DepositModal
        visible={showDepositModal}
        selectedVault={selectedVault}
        selectedSpecificVault={selectedSpecificVault}
        onClose={() => setShowDepositModal(false)}
      />
    </View>
  );
};

export default PerfectVaultSavingsPlatform;