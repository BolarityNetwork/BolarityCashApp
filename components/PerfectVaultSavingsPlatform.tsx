// components/PerfectVaultSavingsPlatform.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  SafeAreaView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePrivy } from "@privy-io/expo";

const { width, height } = Dimensions.get('window');

// 🖼️ 安全导入本地logo图片 - 带try-catch处理
let aaveLogo, compoundLogo, driftLogo, solendLogo, naviLogo, humaLogo, ratexLogo, pendleLogo, bolarityLogo;

try {
  aaveLogo = require('../assets/logos/aave.png');
} catch (e) {
  console.warn('AAVE logo not found');
}

try {
  compoundLogo = require('../assets/logos/compound.png');
} catch (e) {
  console.warn('Compound logo not found');
}

try {
  driftLogo = require('../assets/logos/drift.png');
} catch (e) {
  console.warn('Drift logo not found');
}

try {
  solendLogo = require('../assets/logos/solend.png');
} catch (e) {
  console.warn('Solend logo not found');
}

try {
  naviLogo = require('../assets/logos/navi.png');
} catch (e) {
  console.warn('Navi logo not found');
}

try {
  humaLogo = require('../assets/logos/huma.png');
} catch (e) {
  console.warn('Huma logo not found');
}

try {
  ratexLogo = require('../assets/logos/ratex.png');
} catch (e) {
  console.warn('Ratex logo not found');
}

try {
  pendleLogo = require('../assets/logos/pendle.png');
} catch (e) {
  console.warn('Pendle logo not found');
}

try {
  bolarityLogo = require('../assets/logos/bolarity.png');
} catch (e) {
  console.warn('Bolarity logo not found');
}

// Protocol Logo映射 - 只包含成功导入的图片
const PROTOCOL_LOGOS = {
  'AAVE': aaveLogo,
  'Drift': driftLogo,
  'Compound': compoundLogo,
  'Solend': solendLogo,
  'Navi': naviLogo,
  'Huma': humaLogo,
  'Ratex': ratexLogo,
  'Pendle': pendleLogo
};

// Protocol Logo组件 - 优化版本
const ProtocolLogo = ({ protocol, size = 32, style = {} }) => {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  const logoSrc = PROTOCOL_LOGOS[protocol];
  
  // 备用显示（如果图片加载失败或不存在）
  const fallbackLogo = {
    'AAVE': '🏛️',
    'Drift': '🌊',
    'Compound': '🔷',
    'Solend': '☀️',
    'Navi': '🧭',
    'Huma': '🌍',
    'Ratex': '💎',
    'Pendle': '🔮'
  };

  // 重置错误状态当protocol改变时
  useEffect(() => {
    setImageError(false);
    setLoading(true);
  }, [protocol]);

  // 如果没有logo文件或加载失败，显示emoji备用
  if (!logoSrc || imageError) {
    return (
      <View style={[{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb'
      }, style]}>
        <Text style={{ fontSize: size * 0.6 }}>
          {fallbackLogo[protocol] || '📦'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[{ position: 'relative' }, style]}>
      {loading && (
        <View style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#e5e7eb',
          borderWidth: 1,
          borderColor: '#e5e7eb'
        }} />
      )}
      <Image
        source={logoSrc}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1,
          borderColor: '#e5e7eb',
          opacity: loading ? 0 : 1
        }}
        onLoad={() => setLoading(false)}
        onError={() => {
          setImageError(true);
          setLoading(false);
        }}
      />
    </View>
  );
};

// 从vault名称获取协议名称
const getProtocolFromVaultName = (vaultName) => {
  if (vaultName.includes('Ratex')) return 'Ratex';
  if (vaultName.includes('Pendle')) return 'Pendle';
  return vaultName;
};

// 图标组件
const IconComponent = ({ name, size = 24, color = '#000' }) => {
  const icons = {
    'Eye': '👁',
    'EyeOff': '🙈',
    'Vault': '🏛️',
    'Clock': '⏰',
    'Zap': '⚡',
    'TrendingUp': '📈',
    'ArrowUpRight': '↗️',
    'Plus': '➕',
    'DollarSign': '💵',
    'Percent': '💹',
    'Gift': '🎁',
    'Star': '⭐',
    'PiggyBank': '🐷',
    'Home': '🏠',
    'User': '👤',
    'Grid3X3': '⚏',
  };

  return (
    <Text style={{ fontSize: size, color }}>
      {icons[name] || '⚫'}
    </Text>
  );
};

const PerfectVaultSavingsPlatform = () => {
  const { user } = usePrivy();
  const [showBalance, setShowBalance] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showVaultListModal, setShowVaultListModal] = useState(false);
  const [showTimeVaultListModal, setShowTimeVaultListModal] = useState(false);
  const [selectedVault, setSelectedVault] = useState(null);
  const [selectedSpecificVault, setSelectedSpecificVault] = useState(null);
  const [totalBalance, setTotalBalance] = useState(127845.67);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // 动画值
  const actionMenuOpacity = new Animated.Value(0);
  const actionMenuScale = new Animated.Value(0.8);

  useEffect(() => {
    const interval = setInterval(() => {
      const increment = Math.random() * 0.04 + 0.01;
      setTotalBalance(prev => prev + increment);
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

  const vaultOptions = [
    { 
      name: 'AAVE', 
      apy: '8.2%', 
      description: 'Decentralized lending protocol',
      tvl: '$12.5B',
      risk: 'Medium'
    },
    { 
      name: 'Drift', 
      apy: '11.8%', 
      description: 'Solana-based DeFi protocol',
      tvl: '$2.1B',
      risk: 'Medium-High'
    },
    { 
      name: 'Compound', 
      apy: '6.5%', 
      description: 'Ethereum money markets',
      tvl: '$8.7B',
      risk: 'Low-Medium'
    },
    { 
      name: 'Solend', 
      apy: '9.3%', 
      description: 'Solana lending protocol',
      tvl: '$1.8B',
      risk: 'Medium'
    },
    { 
      name: 'Navi', 
      apy: '12.4%', 
      description: 'Sui ecosystem lending',
      tvl: '$890M',
      risk: 'High'
    },
    { 
      name: 'Huma', 
      apy: '7.9%', 
      description: 'Real-world asset protocol',
      tvl: '$450M',
      risk: 'Medium'
    }
  ];

  // TimeVault Pro 的 vault 选项
  const timeVaultOptions = [
    {
      name: 'Ratex USD*-2508',
      apy: '14.5%',
      maturity: 'Mature in 54 days',
      description: 'Fixed-term USD yield farming',
      tvl: '$85M',
      risk: 'Medium',
      lockPeriod: '54 days',
      protocol: 'Ratex Protocol'
    },
    {
      name: 'Ratex USD*-2510',
      apy: '11.31%',
      maturity: 'Mature in 115 days',
      description: 'Extended term USD strategy',
      tvl: '$142M',
      risk: 'Medium',
      lockPeriod: '115 days',
      protocol: 'Ratex Protocol'
    },
    {
      name: 'Ratex USDe-2507',
      apy: '9.27%',
      maturity: 'Mature in 26 days',
      description: 'Short-term USDe strategy',
      tvl: '$67M',
      risk: 'Low-Medium',
      lockPeriod: '26 days',
      protocol: 'Ratex Protocol'
    },
    {
      name: 'Pendle sUSP',
      apy: '16.38%',
      maturity: 'Mature in 53 days',
      description: 'Pendle yield strategy',
      tvl: '$98M',
      risk: 'Medium-High',
      lockPeriod: '53 days',
      protocol: 'Pendle Finance'
    },
    {
      name: 'Pendle reUSDe',
      apy: '12.81%',
      maturity: 'Mature in 165 days',
      description: 'Long-term reUSDe yield',
      tvl: '$156M',
      risk: 'Medium',
      lockPeriod: '165 days',
      protocol: 'Pendle Finance'
    },
    {
      name: 'Pendle sYUSD',
      apy: '12.72%',
      maturity: 'Mature in 60 days',
      description: 'Synthetic YUSD strategy',
      tvl: '$89M',
      risk: 'Medium',
      lockPeriod: '60 days',
      protocol: 'Pendle Finance'
    }
  ];

  const handleVaultSelection = (vaultOption) => {
    setSelectedSpecificVault(vaultOption);
    setSelectedVault(null);
    setShowVaultListModal(false);
    setShowDepositModal(true);
  };

  const handleTimeVaultSelection = (timeVaultOption) => {
    setSelectedSpecificVault(timeVaultOption);
    setSelectedVault(null);
    setShowTimeVaultListModal(false);
    setShowDepositModal(true);
  };

  const vaultProducts = [
    {
      name: 'FlexiVault',
      type: 'Current Savings',
      apy: '6.29%',
      description: 'Flexible access anytime',
      minimum: '$100',
      features: ['Instant withdrawals', 'No lock-up period', 'Daily compounding'],
      gradientColors: ['#10b981', '#059669'],
      icon: 'Zap'
    },
    {
      name: 'TimeVault Pro',
      type: 'Fixed Term Savings',
      apy: '11.28%',
      description: 'Higher returns, fixed term',
      minimum: '$1,000',
      features: ['12-month term', 'Guaranteed returns', 'Monthly interest'],
      gradientColors: ['#3b82f6', '#1e40af'],
      icon: 'Clock'
    },
    {
      name: 'MaxVault Elite',
      type: 'Premium Savings',
      apy: '15.75%',
      description: 'Maximum yield for VIP',
      minimum: '$10,000',
      features: ['18-month term', 'Premium rates', 'Priority support'],
      gradientColors: ['#8b5cf6', '#7c3aed'],
      icon: 'Star'
    }
  ];

  const savingsHistory = [
    { type: 'Interest Earned', amount: '+$47.83', date: 'Today', vault: 'FlexiVault', isPositive: true },
    { type: 'Interest Earned', amount: '+$156.24', date: 'Yesterday', vault: 'TimeVault Pro', isPositive: true },
    { type: 'Deposit', amount: '+$5,000', date: 'Dec 15', vault: 'FlexiVault', isPositive: false },
    { type: 'Interest Earned', amount: '+$89.45', date: 'Dec 14', vault: 'MaxVault Elite', isPositive: true }
  ];

  const todayEarnings = 293.52;
  const monthlyEarnings = 8247.18;

  const getBarHeight = (index) => {
    const heights = [24, 40, 56, 160, 80];
    return heights[index] || 24;
  };

  const formatUserAddress = (address) => {
    if (!address) return 'Not Connected';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.logoSection}>
                <View style={styles.logoContainer}>
                  {bolarityLogo ? (
                    <Image 
                      source={bolarityLogo} 
                      style={styles.logoImage}
                    />
                  ) : (
                    <IconComponent name="Vault" size={24} color="#fff" />
                  )}
                </View>
                <View>
                  <Text style={styles.appTitle}>Bolarity</Text>
                  <Text style={styles.appSubtitle}>DeFi Yield Platform</Text>
                </View>
              </View>
              <View style={styles.headerRight}>
                <View style={styles.notificationContainer}>
                  <IconComponent name="Gift" size={24} color="#f59e0b" />
                  <View style={styles.notificationDot} />
                </View>
                <TouchableOpacity style={styles.profileButton}>
                  <Text style={styles.profileIcon}>👤</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* User Info */}
            {user && (
              <View style={styles.userInfo}>
                <Text style={styles.userLabel}>Connected as:</Text>
                <Text style={styles.userAddress}>
                  {formatUserAddress(user.wallet?.address)}
                </Text>
              </View>
            )}

            <View style={styles.balanceSection}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Total Savings Balance</Text>
                <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
                  <IconComponent name={showBalance ? "Eye" : "EyeOff"} size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <View style={styles.balanceContent}>
                <View>
                  <Text style={styles.balanceAmount}>
                    ${showBalance ? totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '••••••••'}
                  </Text>
                  <View style={styles.earningsRow}>
                    <View style={styles.earningsItem}>
                      <Text style={styles.earningsAmount}>+${todayEarnings}</Text>
                      <Text style={styles.earningsLabel}>today</Text>
                    </View>
                    <View style={styles.earningsItem}>
                      <Text style={styles.earningsAmount}>+${monthlyEarnings.toLocaleString()}</Text>
                      <Text style={styles.earningsLabel}>this month</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.apyBadge}>
                  <Text style={styles.apyText}>Earning 8.4%</Text>
                  <Text style={styles.apySubtext}>Across all vaults</Text>
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Chart */}
        <View style={styles.chartSection}>
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <View style={styles.chartYAxis}>
                <Text style={styles.yAxisLabel}>12k</Text>
                <Text style={styles.yAxisLabel}>10k</Text>
                <Text style={styles.yAxisLabel}>8k</Text>
              </View>
              
              <View style={styles.chartBars}>
                {['20 Apr', '21 Apr', '22 Apr', '23 Apr', '24 Apr'].map((date, index) => (
                  <View key={index} style={styles.barContainer}>
                    <View style={styles.barWrapper}>
                      <LinearGradient
                        colors={index === 3 ? ['#3b82f6', '#1e40af'] : 
                               index === 4 ? ['transparent', 'transparent'] :
                               ['#93c5fd', '#60a5fa']}
                        style={[
                          styles.bar,
                          { 
                            height: getBarHeight(index),
                            borderWidth: index === 4 ? 2 : 0,
                            borderColor: index === 4 ? '#d1d5db' : 'transparent',
                            borderStyle: index === 4 ? 'dashed' : 'solid'
                          }
                        ]}
                      />
                      {index === 3 && (
                        <View style={styles.earningsTooltip}>
                          <Text style={styles.tooltipText}>+$83</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[
                      styles.barLabel,
                      { 
                        color: index === 3 ? '#111827' : 
                               index === 4 ? '#9ca3af' : '#6b7280',
                        fontWeight: index === 3 ? '600' : '400'
                      }
                    ]}>
                      {date}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.chartControls}>
              <TouchableOpacity style={styles.activeControl}>
                <Text style={styles.activeControlText}>Daily</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.inactiveControl}>
                <Text style={styles.inactiveControlText}>Monthly</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.inactiveControl}>
                <Text style={styles.inactiveControlText}>Yearly</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Vault Products */}
        <View style={styles.vaultSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Savings Vaults</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>Compare All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.vaultList}>
            {vaultProducts.map((vault, index) => (
              <TouchableOpacity
                key={index} 
                style={styles.vaultCardBorder}
                onPress={() => {
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
                }}
              >
                <View style={styles.vaultCard}>
                  <View style={styles.vaultHeader}>
                    <View style={styles.vaultInfo}>
                      <LinearGradient
                        colors={vault.gradientColors}
                        style={styles.vaultIcon}
                      >
                        <IconComponent name={vault.icon} size={24} color="#fff" />
                      </LinearGradient>
                      <View>
                        <Text style={styles.vaultName}>{vault.name}</Text>
                        <Text style={styles.vaultDescription}>{vault.description}</Text>
                      </View>
                    </View>
                    <View style={styles.vaultApy}>
                      <Text style={styles.vaultApyText}>{vault.apy}</Text>
                      <Text style={styles.vaultApyLabel}>APY</Text>
                    </View>
                  </View>
                  
                  <View style={styles.vaultFooter}>
                    <View style={styles.vaultDetails}>
                      <View>
                        <Text style={styles.vaultTypeLabel}>Type</Text>
                        <Text style={styles.vaultTypeValue}>{vault.type}</Text>
                      </View>
                      <View>
                        <Text style={styles.vaultMinLabel}>Minimum</Text>
                        <Text style={styles.vaultMinValue}>{vault.minimum}</Text>
                      </View>
                    </View>
                    <View style={styles.depositButton}>
                      <Text style={styles.depositButtonText}>Deposit</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityList}>
            {savingsHistory.map((transaction, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityLeft}>
                  <View style={styles.activityIcon}>
                    <IconComponent 
                      name={transaction.type === 'Interest Earned' ? "Percent" : "DollarSign"} 
                      size={20} 
                      color={transaction.type === 'Interest Earned' ? "#059669" : "#2563eb"} 
                    />
                  </View>
                  <View>
                    <Text style={styles.activityType}>{transaction.type}</Text>
                    <Text style={styles.activityDetails}>{transaction.vault} • {transaction.date}</Text>
                  </View>
                </View>
                <Text style={[
                  styles.activityAmount,
                  { color: transaction.isPositive ? "#059669" : "#2563eb" }
                ]}>
                  {transaction.amount}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Actions Menu - Semi-Circle Arc Design */}
      {showActionsMenu && (
        <>
          <Animated.View 
            style={[
              styles.actionMenuOverlay,
              { opacity: actionMenuOpacity }
            ]}
          />
          <Animated.View
            style={[
              styles.actionMenuContainer,
              {
                opacity: actionMenuOpacity,
                transform: [{ scale: actionMenuScale }]
              }
            ]}
          >
            <View style={styles.actionMenuBackground}>
              {/* Action buttons arranged in arc */}
              <View style={styles.actionMenuContent}>
                {/* Save - Top Left */}
                <TouchableOpacity 
                  style={[styles.actionButton, { left: '25%', top: '45%' }]}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionButtonContainer}>
                    <View style={styles.actionButtonIcon}>
                      <IconComponent name="PiggyBank" size={24} color="#fff" />
                    </View>
                    <Text style={styles.actionButtonLabel}>Save</Text>
                  </View>
                </TouchableOpacity>

                {/* Invest - Top Right */}
                <TouchableOpacity 
                  style={[styles.actionButton, { right: '25%', top: '45%' }]}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionButtonContainer}>
                    <View style={styles.actionButtonIcon}>
                      <IconComponent name="TrendingUp" size={24} color="#fff" />
                    </View>
                    <Text style={styles.actionButtonLabel}>Invest</Text>
                  </View>
                </TouchableOpacity>

                {/* Deposit - Center Top (Larger) */}
                <TouchableOpacity 
                  style={[styles.actionButton, { left: '50%', top: '35%', marginLeft: -32 }]}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionButtonContainer}>
                    <View style={[styles.actionButtonIcon, styles.actionButtonIconLarge]}>
                      <IconComponent name="Plus" size={32} color="#fff" />
                    </View>
                    <Text style={styles.actionButtonLabel}>Deposit</Text>
                  </View>
                </TouchableOpacity>

                {/* Actions - Center Bottom */}
                <TouchableOpacity 
                  style={[styles.actionButton, { left: '50%', bottom: '25%', marginLeft: -28 }]}
                  onPress={() => setShowActionsMenu(false)}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionButtonContainer}>
                    <View style={styles.actionButtonIcon}>
                      <IconComponent name="Grid3X3" size={24} color="#fff" />
                    </View>
                    <Text style={styles.actionButtonLabel}>Actions</Text>
                  </View>
                </TouchableOpacity>

                {/* Transfer - Bottom Left */}
                <TouchableOpacity 
                  style={[styles.actionButton, { left: '20%', bottom: '30%' }]}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionButtonContainer}>
                    <View style={styles.actionButtonIcon}>
                      <IconComponent name="DollarSign" size={24} color="#fff" />
                    </View>
                    <Text style={styles.actionButtonLabel}>Transfer</Text>
                  </View>
                </TouchableOpacity>

                {/* Refer a Friend - Bottom Right */}
                <TouchableOpacity 
                  style={[styles.actionButton, { right: '20%', bottom: '30%' }]}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionButtonContainer}>
                    <View style={styles.actionButtonIcon}>
                      <IconComponent name="Gift" size={24} color="#fff" />
                    </View>
                    <Text style={styles.actionButtonLabel}>Refer a Friend</Text>
                  </View>
                </TouchableOpacity>

                {/* Dots indicator at bottom */}
                <View style={styles.dotsIndicator}>
                  <View style={[styles.dot, styles.activeDot]} />
                  <View style={[styles.dot, styles.inactiveDot]} />
                </View>
              </View>
            </View>
          </Animated.View>
        </>
      )}

      {/* FlexiVault Selection Modal */}
      <Modal
        visible={showVaultListModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVaultListModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Your Vault</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowVaultListModal(false)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Select a DeFi protocol to start earning with Bolarity FlexiVault
            </Text>

            <View style={styles.modalVaultList}>
              {vaultOptions.map((vault, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalVaultItem}
                  onPress={() => handleVaultSelection(vault)}
                >
                  <View style={styles.modalVaultLeft}>
                    <ProtocolLogo protocol={vault.name} size={40} />
                    <View style={styles.modalVaultInfo}>
                      <Text style={styles.modalVaultName}>{vault.name}</Text>
                      <Text style={styles.modalVaultDesc}>{vault.description}</Text>
                    </View>
                  </View>
                  <View style={styles.modalVaultRight}>
                    <Text style={styles.modalVaultApy}>{vault.apy}</Text>
                    <Text style={styles.modalVaultApyLabel}>APY</Text>
                  </View>
                  <View style={styles.modalVaultBottom}>
                    <Text style={styles.modalVaultTvl}>TVL: {vault.tvl}</Text>
                    <Text style={styles.modalVaultRisk}>Risk: {vault.risk}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* TimeVault Pro Selection Modal */}
      <Modal
        visible={showTimeVaultListModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTimeVaultListModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>TimeVault Pro Options</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTimeVaultListModal(false)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Select a fixed-term vault with guaranteed returns
            </Text>

            <View style={styles.modalVaultList}>
              {timeVaultOptions.map((vault, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalVaultItem}
                  onPress={() => handleTimeVaultSelection(vault)}
                >
                  <View style={styles.modalVaultLeft}>
                    <ProtocolLogo protocol={getProtocolFromVaultName(vault.name)} size={40} />
                    <View style={styles.modalVaultInfo}>
                      <Text style={styles.modalVaultName}>{vault.name}</Text>
                      <Text style={styles.modalTimeVaultMaturity}>{vault.maturity}</Text>
                    </View>
                  </View>
                  <View style={styles.modalVaultRight}>
                    <Text style={styles.modalVaultApy}>{vault.apy}</Text>
                    <Text style={styles.modalVaultApyLabel}>APY</Text>
                  </View>
                  <View style={styles.modalVaultBottom}>
                    <Text style={styles.modalVaultTvl}>TVL: {vault.tvl}</Text>
                    <Text style={styles.modalVaultRisk}>Risk: {vault.risk}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Deposit Modal */}
      <Modal
        visible={showDepositModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDepositModal(false)}
      >
        {(selectedVault || selectedSpecificVault) && (() => {
          const displayVault = selectedSpecificVault || selectedVault;
          const isSpecificVault = !!selectedSpecificVault;
          const isTimeVault = displayVault && displayVault.lockPeriod;
          
          return (
            <SafeAreaView style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isTimeVault ? `Open ${displayVault.name}` : 
                   isSpecificVault ? `Open ${displayVault.name} Vault` : 
                   `Open ${displayVault.name}`}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowDepositModal(false)}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                {isTimeVault ? (
                  <>
                    <LinearGradient
                      colors={['#2563eb', '#3730a3']}
                      style={styles.depositVaultHeader}
                    >
                      <View style={styles.depositVaultInfo}>
                        <ProtocolLogo protocol={getProtocolFromVaultName(displayVault.name)} size={48} />
                        <View style={styles.depositVaultText}>
                          <Text style={styles.depositVaultName}>{displayVault.name}</Text>
                          <Text style={styles.depositVaultDesc}>{displayVault.description}</Text>
                        </View>
                      </View>
                      <View style={styles.depositVaultStats}>
                        <View style={styles.depositStatItem}>
                          <Text style={styles.depositStatLabel}>APY Rate</Text>
                          <Text style={styles.depositStatValue}>{displayVault.apy}</Text>
                        </View>
                        <View style={styles.depositStatItem}>
                          <Text style={styles.depositStatLabel}>Lock Period</Text>
                          <Text style={styles.depositStatValue}>{displayVault.lockPeriod}</Text>
                        </View>
                      </View>
                      <View style={styles.depositProtocol}>
                        <Text style={styles.depositStatLabel}>Protocol</Text>
                        <Text style={styles.depositStatValue}>{displayVault.protocol}</Text>
                      </View>
                    </LinearGradient>

                    <View style={styles.depositFeatures}>
                      <Text style={styles.depositFeaturesTitle}>Vault Features:</Text>
                      {['Fixed-term guaranteed returns', 'No early withdrawal penalty', 'Automated yield optimization', 'Institutional-grade security'].map((feature, index) => (
                        <View key={index} style={styles.depositFeatureItem}>
                          <View style={styles.depositFeatureDot} />
                          <Text style={styles.depositFeatureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.depositSummary}>
                      <View style={styles.depositSummaryRow}>
                        <Text style={styles.depositSummaryLabel}>Deposit Amount</Text>
                        <Text style={styles.depositSummaryAmount}>$5,000</Text>
                      </View>
                      <View style={styles.depositSummaryRow}>
                        <Text style={styles.depositSummaryLabel}>Maturity Date</Text>
                        <Text style={styles.depositSummaryMaturity}>{displayVault.maturity}</Text>
                      </View>
                      <View style={styles.depositSummaryRow}>
                        <Text style={styles.depositSummaryLabel}>Total Return at Maturity</Text>
                        <Text style={styles.depositSummaryReturn}>
                          ${(5000 * (1 + parseFloat(displayVault.apy) / 100 * (parseInt(displayVault.lockPeriod) / 365))).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                      </View>
                    </View>
                  </>
                ) : isSpecificVault ? (
                  <>
                    <LinearGradient
                      colors={['#2563eb', '#7c3aed']}
                      style={styles.depositVaultHeader}
                    >
                      <View style={styles.depositVaultInfo}>
                        <ProtocolLogo protocol={displayVault.name} size={48} />
                        <View style={styles.depositVaultText}>
                          <Text style={styles.depositVaultName}>{displayVault.name}</Text>
                          <Text style={styles.depositVaultDesc}>{displayVault.description}</Text>
                        </View>
                      </View>
                      <View style={styles.depositVaultStats}>
                        <View style={styles.depositStatItem}>
                          <Text style={styles.depositStatLabel}>APY Rate</Text>
                          <Text style={styles.depositStatValue}>{displayVault.apy}</Text>
                        </View>
                        <View style={styles.depositStatItem}>
                          <Text style={styles.depositStatLabel}>TVL</Text>
                          <Text style={styles.depositStatValue}>{displayVault.tvl}</Text>
                        </View>
                      </View>
                      <View style={styles.depositProtocol}>
                        <Text style={styles.depositStatLabel}>Risk Level</Text>
                        <Text style={styles.depositStatValue}>{displayVault.risk}</Text>
                      </View>
                    </LinearGradient>

                    <View style={styles.depositFeatures}>
                      <Text style={styles.depositFeaturesTitle}>Protocol Features:</Text>
                      {['Flexible access anytime', 'Auto-compounding rewards', 'Audited smart contracts', '24/7 yield optimization'].map((feature, index) => (
                        <View key={index} style={styles.depositFeatureItem}>
                          <View style={[styles.depositFeatureDot, { backgroundColor: '#10b981' }]} />
                          <Text style={styles.depositFeatureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.depositSummary}>
                      <View style={styles.depositSummaryRow}>
                        <Text style={styles.depositSummaryLabel}>Deposit Amount</Text>
                        <Text style={styles.depositSummaryAmount}>$5,000</Text>
                      </View>
                      <View style={styles.depositSummaryRow}>
                        <Text style={styles.depositSummaryLabel}>Estimated Monthly Earnings</Text>
                        <Text style={styles.depositSummaryReturn}>
                          ${((5000 * parseFloat(displayVault.apy)) / 1200).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    <LinearGradient
                      colors={displayVault.gradientColors}
                      style={styles.depositVaultHeader}
                    >
                      <View style={styles.depositVaultHeaderContent}>
                        <Text style={styles.depositVaultName}>{displayVault.name}</Text>
                        <IconComponent name={displayVault.icon} size={24} color="#fff" />
                      </View>
                      <View style={styles.depositVaultStats}>
                        <View style={styles.depositStatItem}>
                          <Text style={styles.depositStatLabel}>APY Rate</Text>
                          <Text style={styles.depositStatValue}>{displayVault.apy}</Text>
                        </View>
                        <View style={styles.depositStatItem}>
                          <Text style={styles.depositStatLabel}>Minimum</Text>
                          <Text style={styles.depositStatValue}>{displayVault.minimum}</Text>
                        </View>
                      </View>
                    </LinearGradient>

                    <View style={styles.depositFeatures}>
                      <Text style={styles.depositFeaturesTitle}>Key Features:</Text>
                      {displayVault.features.map((feature, index) => (
                        <View key={index} style={styles.depositFeatureItem}>
                          <View style={[styles.depositFeatureDot, { backgroundColor: '#10b981' }]} />
                          <Text style={styles.depositFeatureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.depositSummary}>
                      <View style={styles.depositSummaryRow}>
                        <Text style={styles.depositSummaryLabel}>Deposit Amount</Text>
                        <Text style={styles.depositSummaryAmount}>$5,000</Text>
                      </View>
                      <View style={styles.depositSummaryRow}>
                        <Text style={styles.depositSummaryLabel}>Estimated Monthly Earnings</Text>
                        <Text style={styles.depositSummaryReturn}>
                          ${((5000 * parseFloat(displayVault.apy)) / 1200).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </>
                )}

                <View style={styles.depositActions}>
                  <TouchableOpacity
                    style={styles.learnMoreButton}
                    onPress={() => setShowDepositModal(false)}
                  >
                    <Text style={styles.learnMoreText}>Learn More</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.startSavingButton}
                    onPress={() => setShowDepositModal(false)}
                  >
                    <Text style={styles.startSavingText}>Start Saving</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </SafeAreaView>
          );
        })()}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#000',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  appSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    backgroundColor: '#ef4444',
    borderRadius: 6,
  },
  profileButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 18,
    color: '#6b7280',
  },
  userInfo: {
    marginBottom: 10,
  },
  userLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  userAddress: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  balanceSection: {
    marginBottom: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  balanceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 26,
    fontWeight: '300',
    color: '#111827',
    marginBottom: 0,
  },
  earningsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  earningsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  earningsAmount: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  earningsLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  apyBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
  },
  apyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  apySubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 200, // Space for fixed header (reduced from 250)
    paddingBottom: 10, // Reduced bottom padding
  },
  chartSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
    marginTop: 16,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartHeader: {
    height: 192,
    marginBottom: 24,
    position: 'relative',
  },
  chartYAxis: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    justifyContent: 'space-between',
  },
  yAxisLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  chartBars: {
    marginLeft: 32,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barContainer: {
    alignItems: 'center',
  },
  barWrapper: {
    position: 'relative',
  },
  bar: {
    width: 48,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  earningsTooltip: {
    position: 'absolute',
    top: -32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tooltipText: {
    backgroundColor: '#10b981',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  barLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  chartControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  activeControl: {
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeControlText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  inactiveControl: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  inactiveControlText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  vaultSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  sectionAction: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  vaultList: {
    gap: 16,
  },
  vaultCardBorder: {
    borderRadius: 24,
    padding: 2,
    background: 'linear-gradient(45deg, #10b981, #06b6d4, #8b5cf6)',
  },
  vaultCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
  },
  vaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  vaultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vaultIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vaultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  vaultDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  vaultApy: {
    alignItems: 'flex-end',
  },
  vaultApyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
  },
  vaultApyLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  vaultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vaultDetails: {
    flexDirection: 'row',
    gap: 16,
    flex: 1,
  },
  vaultTypeLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  vaultTypeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  vaultMinLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  vaultMinValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  depositButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  depositButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  activitySection: {
    paddingHorizontal: 24,
    marginBottom: 32,
    marginTop: 32,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  activityDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 20,
  },
  actionMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 30,
  },
  actionMenuContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 31,
  },
  actionMenuBackground: {
    height: 380,
    backgroundColor: '#fff',
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    marginLeft: -50,
    marginRight: -50,
    paddingLeft: 50,
    paddingRight: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
  },
  actionMenuContent: {
    position: 'relative',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    position: 'absolute',
  },
  actionButtonContainer: {
    alignItems: 'center',
  },
  actionButtonIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#000',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  actionButtonLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  dotsIndicator: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#000',
  },
  inactiveDot: {
    backgroundColor: '#d1d5db',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6b7280',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  modalVaultList: {
    gap: 12,
  },
  modalVaultItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalVaultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalVaultInfo: {
    marginLeft: 12,
    flex: 1,
  },
  modalVaultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalVaultDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalTimeVaultMaturity: {
    fontSize: 14,
    color: '#2563eb',
  },
  modalVaultRight: {
    position: 'absolute',
    top: 16,
    right: 16,
    alignItems: 'flex-end',
  },
  modalVaultApy: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  modalVaultApyLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalVaultBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalVaultTvl: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalVaultRisk: {
    fontSize: 14,
    color: '#6b7280',
  },
  depositVaultHeader: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  depositVaultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  depositVaultText: {
    marginLeft: 12,
    flex: 1,
  },
  depositVaultName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  depositVaultDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  depositVaultHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  depositVaultStats: {
    flexDirection: 'row',
    gap: 16,
  },
  depositStatItem: {
    flex: 1,
  },
  depositStatLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  depositStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  depositProtocol: {
    marginTop: 12,
  },
  depositFeatures: {
    marginBottom: 24,
  },
  depositFeaturesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  depositFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  depositFeatureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    marginRight: 12,
  },
  depositFeatureText: {
    fontSize: 14,
    color: '#374151',
  },
  depositSummary: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  depositSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  depositSummaryLabel: {
    fontSize: 14,
    color: '#374151',
  },
  depositSummaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  depositSummaryMaturity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  depositSummaryReturn: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  depositActions: {
    flexDirection: 'row',
    gap: 12,
  },
  learnMoreButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  learnMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  startSavingButton: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startSavingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default PerfectVaultSavingsPlatform;