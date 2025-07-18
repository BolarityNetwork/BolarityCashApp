// components/RedesignedProfileScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import {
  usePrivy,
  useEmbeddedEthereumWallet,
  getUserEmbeddedEthereumWallet,
  useLinkWithOAuth,
  useEmbeddedSolanaWallet,
  getUserEmbeddedSolanaWallet,
} from "@privy-io/expo";
import Constants from "expo-constants";
import { useLinkWithPasskey } from "@privy-io/expo/passkey";
import { useMultiChainWallet } from '../hooks/useMultiChainWallet';

const { width } = Dimensions.get('window');

// 🖼️ 安全导入本地logo图片 - 带try-catch处理
let ethereumLogo, solanaLogo;

try {
  ethereumLogo = require('../assets/logos/ethereum.png');
} catch (e) {
  console.warn('Ethereum logo not found');
}

try {
  solanaLogo = require('../assets/logos/solana.png');
} catch (e) {
  console.warn('Solana logo not found');
}

// 为 getProviderIcon 重新导入 PNG 图片
let ethereumProviderLogo, solanaProviderLogo;

try {
  ethereumProviderLogo = require('../assets/logos/ethereum.png');
  console.log('✅ Ethereum provider logo loaded');
} catch (e) {
  console.warn('❌ Ethereum provider logo not found:', e);
  ethereumProviderLogo = null;
}

try {
  solanaProviderLogo = require('../assets/logos/solana.png');
  console.log('✅ Solana provider logo loaded');
} catch (e) {
  console.warn('❌ Solana provider logo not found:', e);
  solanaProviderLogo = null;
}

// 修复后的 WalletLogo 组件
const WalletLogo = ({ type, size = 32, style = {} }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const logoSrc = type === 'ethereum' ? ethereumLogo : solanaLogo;
  const fallbackIcon = type === 'ethereum' ? '🔷' : '🌞';
  
  console.log(`🎯 WalletLogo ${type}:`, {
    logoSrc: !!logoSrc,
    imageLoaded,
    imageError
  });
  
  // 重置状态当type改变时
  React.useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [type]);
  
  // 如果没有logo源文件，显示fallback
  if (!logoSrc) {
    console.log(`❌ No logo source for ${type}`);
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
          {fallbackIcon}
        </Text>
      </View>
    );
  }

  return (
    <View style={[{ position: 'relative' }, style]}>
      {/* 始终渲染图片，即使还在加载中 */}
      <Image
        source={logoSrc}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1,
          borderColor: '#e5e7eb',
          backgroundColor: imageLoaded ? 'transparent' : '#f3f4f6',
        }}
        onLoad={() => {
          console.log(`✅ ${type} logo loaded`);
          setImageLoaded(true);
        }}
        onError={(error) => {
          console.log(`❌ ${type} logo error:`, error.nativeEvent);
          setImageError(true);
        }}
        onLoadStart={() => {
          console.log(`🔄 ${type} logo loading started`);
        }}
      />
      
      {/* 只有在图片加载失败时才显示fallback覆盖层 */}
      {imageError && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#f3f4f6',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}>
          <Text style={{ fontSize: size * 0.6 }}>
            {fallbackIcon}
          </Text>
        </View>
      )}
      
      {/* 调试指示器 */}
      <View style={{
        position: 'absolute',
        top: 2,
        right: 2,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: imageError ? 'red' : (imageLoaded ? 'green' : 'orange'),
      }} />
    </View>
  );
};

const toMainIdentifier = (account: any) => {
  if (account.type === "phone") {
    return account.phoneNumber;
  }
  if (account.type === "email" || account.type === "wallet") {
    return account.address;
  }
  if (account.type === "twitter_oauth" || account.type === "tiktok_oauth") {
    return account.username;
  }
  if (account.type === "custom_auth") {
    return account.custom_user_id;
  }
  return account.type;
};

// 更新后的 getProviderIcon 函数，返回组件而不是字符串
const getProviderIcon = (type: string, size: number = 18) => {
  // 对于 ethereum 和 solana，返回 PNG 图片组件
  if (type === 'ethereum' && ethereumProviderLogo) {
    return (
      <Image
        source={ethereumProviderLogo}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
        onError={() => {
          console.log('❌ Ethereum provider icon failed to load');
        }}
      />
    );
  }
  
  if (type === 'solana' && solanaProviderLogo) {
    return (
      <Image
        source={solanaProviderLogo}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
        onError={() => {
          console.log('❌ Solana provider icon failed to load');
        }}
      />
    );
  }
  
  // 对于其他类型或PNG加载失败时，返回 emoji 组件
  const icons: { [key: string]: string } = {
    email: "📧",
    phone: "📱",
    wallet: "💼",
    solana: "🌞",      // fallback
    ethereum: "🔷",    // fallback
    twitter_oauth: "🐦",
    tiktok_oauth: "🎵",
    google: "🔍",
    github: "⚡",
    discord: "🎮",
    apple: "🍎",
    custom_auth: "🔐",
  };
  
  const icon = icons[type] || "🔗";
  
  return (
    <Text style={{ fontSize: size * 0.9 }}>
      {icon}
    </Text>
  );
};

const RedesignedProfileScreen: React.FC = () => {
  const [signedMessages, setSignedMessages] = useState<string[]>([]);
  const [transactionResults, setTransactionResults] = useState<string[]>([]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showWalletSwitchModal, setShowWalletSwitchModal] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false); // 新增网络切换模态框
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const { logout, user } = usePrivy();
  const { linkWithPasskey } = useLinkWithPasskey();
  const oauth = useLinkWithOAuth();
  const { wallets: ethWallets, create } = useEmbeddedEthereumWallet();
  const { wallets: solWallets } = useEmbeddedSolanaWallet();
  const account = getUserEmbeddedEthereumWallet(user);
  const solanaAccount = getUserEmbeddedSolanaWallet(user);
  
  // 多链钱包管理 - 使用优化后的 hook
const {
    activeWalletType,
    ethereumWallet,
    solanaWallet,
    hasSolanaWallet,
    isCreatingSolanaWallet,
    switchWalletType,
    createSolanaWallet,
    removeSolanaWallet,
    activeWallet,
    canSwitchTo,
    // 添加缺失的网络相关属性
    getCurrentEthereumNetwork,
    getAvailableNetworks,
    switchEthereumNetwork,
    activeEthereumNetwork,
    isSwitchingNetwork,
    // 签名和交易方法
    signMessage,
    sendTestTransaction,
    signTestTransaction,
  } = useMultiChainWallet();

  // 复制地址到剪贴板
  const copyToClipboard = useCallback(async (address: string, walletType: string) => {
    try {
      await Clipboard.setStringAsync(address);
      Alert.alert(
        'Copy Success',
        `${walletType} address copied to clipboard`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Copy failed:', error);
      Alert.alert('Error', 'Failed to copy address');
    }
  }, []);

  // =============== 使用官方 API 的简化方法 ===============
  
  // 签名消息 - 统一方法
  const handleSignMessage = useCallback(async () => {
    if (!activeWallet.address) {
      Alert.alert('Error', 'No wallet available');
      return;
    }

    setIsLoading(true);
    try {
      const message = `Hello from Bolarity! Timestamp: ${Date.now()}`;
      console.log(`🎯 Signing message with ${activeWalletType} wallet`);
      
      const signature = await signMessage(message);
      
      console.log('✅ Message signed successfully:', signature);
      setSignedMessages(prev => [
        `${activeWalletType.toUpperCase()}: ${signature}`,
        ...prev
      ]);
      Alert.alert("Success", `${activeWalletType.toUpperCase()} message signed successfully!`);
    } catch (error) {
      console.error('❌ Sign message error:', error);
      Alert.alert("Error", `Failed to sign message: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [activeWallet, activeWalletType, signMessage]);

  // 发送测试交易（金额为0）
  const handleSendTestTransaction = useCallback(async () => {
    if (!activeWallet.address) {
      Alert.alert('Error', 'No wallet available');
      return;
    }

    setIsLoading(true);
    try {
      console.log(`🎯 Sending test transaction with ${activeWalletType} wallet`);
      
      const txHash = await sendTestTransaction();
      
      console.log('✅ Test transaction sent successfully:', txHash);
      setTransactionResults(prev => [
        `${activeWalletType.toUpperCase()} TX: ${txHash}`,
        ...prev
      ]);
      Alert.alert("Success", `${activeWalletType.toUpperCase()} test transaction sent successfully!`);
    } catch (error) {
      console.error('❌ Send transaction error:', error);
      Alert.alert("Error", `Failed to send transaction: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [activeWallet, activeWalletType, sendTestTransaction]);

  // 签名测试交易
  const handleSignTestTransaction = useCallback(async () => {
    if (!activeWallet.address) {
      Alert.alert('Error', 'No wallet available');
      return;
    }

    setIsLoading(true);
    try {
      console.log(`🎯 Signing test transaction with ${activeWalletType} wallet`);
      
      const signedTx = await signTestTransaction();
      
      console.log('✅ Test transaction signed successfully:', signedTx);
      setTransactionResults(prev => [
        `${activeWalletType.toUpperCase()} SIGNED: ${JSON.stringify(signedTx).substring(0, 100)}...`,
        ...prev
      ]);
      Alert.alert("Success", `${activeWalletType.toUpperCase()} test transaction signed successfully!`);
    } catch (error) {
      console.error('❌ Sign transaction error:', error);
      Alert.alert("Error", `Failed to sign transaction: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [activeWallet, activeWalletType, signTestTransaction]);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity style={styles.settingsIconButton} onPress={() => setShowSettingsModal(true)}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {user.email?.address ? user.email.address.charAt(0).toUpperCase() : '👤'}
                </Text>
              </LinearGradient>
              <View style={styles.statusIndicator}>
                <View style={styles.statusDot} />
              </View>
            </View>
            
            <Text style={styles.profileName}>
              {user.email?.address || 'Bolarity User'}
            </Text>
            <Text style={styles.profileId}>
              ID: {formatAddress(user.id)}
            </Text>
            
            {/* 当前活跃钱包显示 - 带网络信息 */}
            <TouchableOpacity 
              style={styles.currentWalletCard}
              onPress={() => setShowWalletSwitchModal(true)}
            >
              <WalletLogo 
                type={activeWallet.iconType} 
                size={28} 
                style={{ marginRight: 12 }} 
              />
              <View style={styles.currentWalletInfo}>
                <Text style={styles.currentWalletType}>
                  {activeWallet.type === 'ethereum' ? 'Ethereum Wallet' : 'Solana Wallet'}
                </Text>
                <Text style={styles.currentWalletAddress}>
                  {activeWallet.address ? formatAddress(activeWallet.address) : 'Not connected'}
                </Text>
                
                {/* 网络信息显示 */}
                <View style={styles.networkInfoContainer}>
                  {activeWallet.type === 'ethereum' ? (
                    <TouchableOpacity 
                      style={styles.networkDisplayButton}
                      onPress={() => setShowNetworkModal(true)}
                    >
                      <Text style={styles.networkIcon}>
                        {getCurrentEthereumNetwork().icon}
                      </Text>
                      <Text style={styles.networkName}>
                        {getCurrentEthereumNetwork().name}
                      </Text>
                      <Text style={styles.networkSwitchIcon}>⚙️</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.networkDisplayButton}>
                      <Text style={styles.networkIcon}>🌞</Text>
                      <Text style={styles.networkName}>{activeWallet.network}</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={styles.switchIcon}>🔄</Text>
            </TouchableOpacity>
            
            <View style={styles.profileStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user.linked_accounts.length}</Text>
                <Text style={styles.statLabel}>Accounts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{signedMessages.length}</Text>
                <Text style={styles.statLabel}>Messages</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{transactionResults.length}</Text>
                <Text style={styles.statLabel}>Transactions</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions - 更新后的版本 */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => setShowWalletSwitchModal(true)}
              >
                <View style={[styles.quickActionIconContainer, { backgroundColor: '#f0f9ff' }]}>
                  <Text style={styles.quickActionIcon}>🔄</Text>
                </View>
                <Text style={styles.quickActionText}>Switch Wallet</Text>
              </TouchableOpacity>

              {/* 网络切换按钮 - 只有Ethereum时显示 */}
              {activeWalletType === 'ethereum' && (
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => setShowNetworkModal(true)}
                  disabled={isSwitchingNetwork}
                >
                  <View style={[styles.quickActionIconContainer, { backgroundColor: '#fef3c7' }]}>
                    <Text style={styles.quickActionIcon}>🌐</Text>
                  </View>
                  <Text style={styles.quickActionText}>
                    {isSwitchingNetwork ? 'Switching...' : 'Switch Network'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={handleSignMessage}
                disabled={isLoading || !activeWallet.address}
              >
                <View style={[styles.quickActionIconContainer, { backgroundColor: '#ecfdf5' }]}>
                  <Text style={styles.quickActionIcon}>✍️</Text>
                </View>
                <Text style={styles.quickActionText}>Sign Message</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={handleSendTestTransaction}
                disabled={isLoading || !activeWallet.address}
              >
                <View style={[styles.quickActionIconContainer, { backgroundColor: '#f3e8ff' }]}>
                  <Text style={styles.quickActionIcon}>📤</Text>
                </View>
                <Text style={styles.quickActionText}>Send Test TX</Text>
              </TouchableOpacity>

              {/* 第二行 - 只显示一个按钮居中 */}
              <TouchableOpacity
                style={[styles.quickActionButton, { width: '47%' }]}
                onPress={handleSignTestTransaction}
                disabled={isLoading || !activeWallet.address}
              >
                <View style={[styles.quickActionIconContainer, { backgroundColor: '#fef2f2' }]}>
                  <Text style={styles.quickActionIcon}>🔏</Text>
                </View>
                <Text style={styles.quickActionText}>Sign Test TX</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Multi-Chain Wallet Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('wallet')}
            >
              <View style={styles.sectionTitleContainer}>
                <View style={styles.sectionIconContainer}>
                  <Text style={styles.sectionIcon}>💰</Text>
                </View>
                <Text style={styles.sectionTitleText}>Multi-Chain Wallets</Text>
              </View>
              <Text style={styles.expandIcon}>
                {expandedSection === 'wallet' ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {expandedSection === 'wallet' && (
              <View style={styles.sectionContent}>
                {/* Ethereum Wallet */}
                <View style={styles.walletSection}>
                  <View style={styles.walletSectionHeader}>
                    <View style={styles.walletTitleContainer}>
                      <WalletLogo type="ethereum" size={24} style={{ marginRight: 8 }} />
                      <Text style={styles.walletSectionTitle}>Ethereum Wallet</Text>
                    </View>
                    {activeWalletType === 'ethereum' && (
                      <View style={styles.activeWalletBadge}>
                        <Text style={styles.activeWalletBadgeText}>Active</Text>
                      </View>
                    )}
                  </View>
                  
                  {ethereumWallet?.address ? (
                    <View style={styles.walletCard}>
                      <LinearGradient
                        colors={activeWalletType === 'ethereum' ? ['#667eea', '#764ba2'] : ['#94a3b8', '#64748b']}
                        style={styles.walletCardGradient}
                      >
                        <View style={styles.walletStatusContainer}>
                          <View style={styles.walletStatusDot} />
                          <Text style={styles.walletStatus}>Connected</Text>
                        </View>
                        
                        {/* 地址显示区域 */}
                        <View style={styles.addressContainer}>
                          <Text style={styles.walletAddress}>
                            {formatAddress(ethereumWallet.address)}
                          </Text>
                          <TouchableOpacity 
                            style={styles.copyButton}
                            onPress={() => copyToClipboard(ethereumWallet.address, 'Ethereum')}
                          >
                            <Text style={styles.copyIcon}>📋</Text>
                          </TouchableOpacity>
                        </View>
                        
                        {/* 网络信息和切换 */}
                        <TouchableOpacity 
                          style={styles.networkSelector}
                          onPress={() => setShowNetworkModal(true)}
                          disabled={isSwitchingNetwork}
                        >
                          <Text style={styles.networkSelectorIcon}>
                            {getCurrentEthereumNetwork().icon}
                          </Text>
                          <Text style={styles.networkSelectorName}>
                            {isSwitchingNetwork ? 'Switching...' : getCurrentEthereumNetwork().name}
                          </Text>
                          <Text style={styles.networkSelectorArrow}>⚙️</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={styles.walletManageButton}
                          onPress={() => {
                            if (activeWalletType !== 'ethereum') {
                              switchWalletType('ethereum');
                            }
                            setShowWalletModal(true);
                          }}
                        >
                          <Text style={styles.walletManageText}>
                            {activeWalletType === 'ethereum' ? 'Manage' : 'Switch to ETH'}
                          </Text>
                        </TouchableOpacity>
                      </LinearGradient>
                    </View>
                  ) : (
                    <View style={styles.walletCreate}>
                      <View style={styles.emptyWalletIcon}>
                        <WalletLogo type="ethereum" size={40} />
                      </View>
                      <Text style={styles.walletCreateTitle}>No Ethereum Wallet</Text>
                      <Text style={styles.walletCreateDesc}>
                        Create an Ethereum wallet to use ETH DeFi features
                      </Text>
                      <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => create()}
                      >
                        <Text style={styles.createButtonText}>Create ETH Wallet</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Solana Wallet */}
                <View style={styles.walletSection}>
                  <View style={styles.walletSectionHeader}>
                    <View style={styles.walletTitleContainer}>
                      <WalletLogo type="solana" size={24} style={{ marginRight: 8 }} />
                      <Text style={styles.walletSectionTitle}>Solana Wallet</Text>
                    </View>
                    {activeWalletType === 'solana' && (
                      <View style={styles.activeWalletBadge}>
                        <Text style={styles.activeWalletBadgeText}>Active</Text>
                      </View>
                    )}
                  </View>
                  
                  {hasSolanaWallet ? (
                    <View style={styles.walletCard}>
                      <LinearGradient
                        colors={activeWalletType === 'solana' ? ['#f59e0b', '#d97706'] : ['#94a3b8', '#64748b']}
                        style={styles.walletCardGradient}
                      >
                        <View style={styles.walletStatusContainer}>
                          <View style={styles.walletStatusDot} />
                          <Text style={styles.walletStatus}>Connected</Text>
                        </View>
                        
                        {/* 地址显示区域 */}
                        <View style={styles.addressContainer}>
                          <Text style={styles.walletAddress}>
                            {solanaWallet?.address ? formatAddress(solanaWallet.address) : 'Loading...'}
                          </Text>
                          {solanaWallet?.address && (
                            <TouchableOpacity 
                              style={styles.copyButton}
                              onPress={() => copyToClipboard(solanaWallet.address, 'Solana')}
                            >
                              <Text style={styles.copyIcon}>📋</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        
                        <View style={styles.walletButtonsRow}>
                          <TouchableOpacity
                            style={styles.walletManageButton}
                            onPress={() => {
                              if (activeWalletType !== 'solana') {
                                switchWalletType('solana');
                              }
                            }}
                          >
                            <Text style={styles.walletManageText}>
                              {activeWalletType === 'solana' ? 'Active' : 'Switch to SOL'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </LinearGradient>
                    </View>
                  ) : (
                    <View style={styles.walletCreate}>
                      <View style={styles.emptyWalletIcon}>
                        <WalletLogo type="solana" size={40} />
                      </View>
                      <Text style={styles.walletCreateTitle}>No Solana Wallet</Text>
                      <Text style={styles.walletCreateDesc}>
                        Create a Solana wallet to use SOL DeFi features
                      </Text>
                      <TouchableOpacity
                        style={styles.createButton}
                        onPress={createSolanaWallet}
                        disabled={isCreatingSolanaWallet}
                      >
                        {isCreatingSolanaWallet ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={styles.createButtonText}>Create SOL Wallet</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Security Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('security')}
            >
              <View style={styles.sectionTitleContainer}>
                <View style={styles.sectionIconContainer}>
                  <Text style={styles.sectionIcon}>🔐</Text>
                </View>
                <Text style={styles.sectionTitleText}>Security & Access</Text>
              </View>
              <Text style={styles.expandIcon}>
                {expandedSection === 'security' ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {expandedSection === 'security' && (
              <View style={styles.sectionContent}>
                <TouchableOpacity
                  style={styles.securityOption}
                  onPress={() =>
                    linkWithPasskey({
                      relyingParty: Constants.expoConfig?.extra?.passkeyAssociatedDomain,
                    })
                  }
                >
                  <View style={styles.securityIconContainer}>
                    <Text style={styles.securityOptionIcon}>🔑</Text>
                  </View>
                  <View style={styles.securityInfo}>
                    <Text style={styles.securityTitle}>Passkey Security</Text>
                    <Text style={styles.securityDesc}>Enhanced biometric authentication</Text>
                  </View>
                  <TouchableOpacity style={styles.linkButton}>
                    <Text style={styles.linkButtonText}>Link</Text>
                  </TouchableOpacity>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.securityOption}
                  onPress={() => setShowMessagesModal(true)}
                >
                  <View style={styles.securityIconContainer}>
                    <Text style={styles.securityOptionIcon}>✍️</Text>
                  </View>
                  <View style={styles.securityInfo}>
                    <Text style={styles.securityTitle}>Signed Messages</Text>
                    <Text style={styles.securityDesc}>View your message signatures</Text>
                  </View>
                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.securityOption}
                  onPress={() => setShowTransactionsModal(true)}
                >
                  <View style={styles.securityIconContainer}>
                    <Text style={styles.securityOptionIcon}>📊</Text>
                  </View>
                  <View style={styles.securityInfo}>
                    <Text style={styles.securityTitle}>Transaction History</Text>
                    <Text style={styles.securityDesc}>View your test transactions</Text>
                  </View>
                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Connected Accounts */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('accounts')}
            >
              <View style={styles.sectionTitleContainer}>
                <View style={styles.sectionIconContainer}>
                  <Text style={styles.sectionIcon}>🌐</Text>
                </View>
                <Text style={styles.sectionTitleText}>Connected Accounts</Text>
                <View style={styles.accountsBadge}>
                  <Text style={styles.accountsBadgeText}>{user.linked_accounts.length}</Text>
                </View>
              </View>
              <Text style={styles.expandIcon}>
                {expandedSection === 'accounts' ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {expandedSection === 'accounts' && (
              <View style={styles.sectionContent}>
                {user.linked_accounts.slice(0, 3).map((accountItem, index) => (
                  <View key={index} style={styles.accountPreview}>
                    <View style={styles.accountIconContainer}>
                      {getProviderIcon(accountItem.type, 18)}
                    </View>
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountType}>
                        {accountItem.type.replace('_oauth', '').replace('_', ' ')}
                      </Text>
                      <Text style={styles.accountId}>
                        {toMainIdentifier(accountItem)}
                      </Text>
                    </View>
                    <View style={styles.accountStatus}>
                      <Text style={styles.accountStatusText}>✓</Text>
                    </View>
                  </View>
                ))}
                
                {user.linked_accounts.length > 3 && (
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => setShowAccountsModal(true)}
                  >
                    <Text style={styles.viewAllText}>
                      View All ({user.linked_accounts.length})
                    </Text>
                  </TouchableOpacity>
                )}

                <View style={styles.linkNewSection}>
                  <Text style={styles.linkNewTitle}>Link New Account</Text>
                  <View style={styles.providerGrid}>
                    {["google", "github", "discord", "apple"].map((provider) => (
                      <TouchableOpacity
                        key={provider}
                        style={styles.providerButton}
                        onPress={() => oauth.link({ provider } as any)}
                        disabled={oauth.state.status === "loading"}
                      >
                        {getProviderIcon(provider, 16)}
                        <Text style={styles.providerName}>
                          {provider.charAt(0).toUpperCase() + provider.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity style={styles.signOutButton} onPress={logout}>
            <View style={styles.signOutContent}>
              <Text style={styles.signOutIcon}>🚪</Text>
              <Text style={styles.signOutText}>Sign Out</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>

      {/* 各种模态框保持原有样式... */}
      {/* Network Switch Modal */}
      <Modal
        visible={showNetworkModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNetworkModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Switch Network</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowNetworkModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Choose which Ethereum network to connect to
            </Text>

            {getAvailableNetworks().map((network) => {
              // 通过比较配置找到对应的网络键
              const networkKey = Object.entries({
                mainnet: { name: 'Ethereum Mainnet' },
                sepolia: { name: 'Ethereum Sepolia' },
                polygon: { name: 'Polygon Mainnet' },
                bsc: { name: 'BSC Mainnet' },
                arbitrum: { name: 'Arbitrum One' },
                optimism: { name: 'Optimism' },
                base: { name: 'Base Mainnet' }
              }).find(([_, config]) => config.name === network.name)?.[0] || 'mainnet';
              
              const isActive = activeEthereumNetwork === networkKey;
              
              return (
                <TouchableOpacity
                  key={network.name}
                  style={[
                    styles.networkOption,
                    isActive && styles.activeNetworkOption
                  ]}
                  onPress={async () => {
                    try {
                      await switchEthereumNetwork(networkKey);
                      setShowNetworkModal(false);
                    } catch (error) {
                      // 错误已在 switchEthereumNetwork 中处理
                    }
                  }}
                  disabled={isSwitchingNetwork}
                >
                  <View style={styles.networkOptionContent}>
                    <View style={[styles.networkIconContainer, { backgroundColor: network.color + '20' }]}>
                      <Text style={styles.networkOptionIcon}>{network.icon}</Text>
                    </View>
                    <View style={styles.networkOptionInfo}>
                      <Text style={styles.networkOptionTitle}>{network.name}</Text>
                      <Text style={styles.networkOptionDesc}>
                        Chain ID: {network.chainId} • {network.symbol}
                      </Text>
                      <Text style={styles.networkOptionUrl}>{network.blockExplorer}</Text>
                    </View>
                    {isActive && (
                      <Text style={styles.networkOptionCheck}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            {isSwitchingNetwork && (
              <View style={styles.switchingIndicator}>
                <ActivityIndicator color="#667eea" size="large" />
                <Text style={styles.switchingText}>Switching network...</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Wallet Switch Modal */}
      <Modal
        visible={showWalletSwitchModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWalletSwitchModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Switch Wallet</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowWalletSwitchModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Choose which wallet to use as your primary wallet
            </Text>

            {/* Ethereum Wallet Option */}
            {ethereumWallet?.address && (
              <TouchableOpacity
                style={[
                  styles.walletOption,
                  activeWalletType === 'ethereum' && styles.activeWalletOption
                ]}
                onPress={() => {
                  switchWalletType('ethereum');
                  setShowWalletSwitchModal(false);
                }}
              >
                <View style={styles.walletOptionContent}>
                  <WalletLogo type="ethereum" size={32} style={{ marginRight: 12 }} />
                  <View style={styles.walletOptionInfo}>
                    <Text style={styles.walletOptionTitle}>Ethereum Wallet</Text>
                    <Text style={styles.walletOptionAddress}>
                      {formatAddress(ethereumWallet.address)}
                    </Text>
                    <Text style={styles.walletOptionNetwork}>Ethereum Mainnet</Text>
                  </View>
                  {activeWalletType === 'ethereum' && (
                    <Text style={styles.walletOptionCheck}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}

            {/* Solana Wallet Option */}
            {hasSolanaWallet && solanaWallet && (
              <TouchableOpacity
                style={[
                  styles.walletOption,
                  activeWalletType === 'solana' && styles.activeWalletOption
                ]}
                onPress={() => {
                  switchWalletType('solana');
                  setShowWalletSwitchModal(false);
                }}
              >
                <View style={styles.walletOptionContent}>
                  <WalletLogo type="solana" size={32} style={{ marginRight: 12 }} />
                  <View style={styles.walletOptionInfo}>
                    <Text style={styles.walletOptionTitle}>Solana Wallet</Text>
                    <Text style={styles.walletOptionAddress}>
                      {formatAddress(solanaWallet.address)}
                    </Text>
                    <Text style={styles.walletOptionNetwork}>mainnet-beta</Text>
                  </View>
                  {activeWalletType === 'solana' && (
                    <Text style={styles.walletOptionCheck}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}

            {/* Create New Wallet Section */}
            <View style={styles.createWalletSection}>
              <Text style={styles.createWalletTitle}>Create New Wallet</Text>
              
              {!ethereumWallet?.address && (
                <TouchableOpacity
                  style={styles.createWalletButton}
                  onPress={() => {
                    create();
                    setShowWalletSwitchModal(false);
                  }}
                >
                  <WalletLogo type="ethereum" size={24} style={{ marginRight: 12 }} />
                  <Text style={styles.createWalletText}>Create Ethereum Wallet</Text>
                </TouchableOpacity>
              )}

              {!hasSolanaWallet && (
                <TouchableOpacity
                  style={styles.createWalletButton}
                  onPress={async () => {
                    setShowWalletSwitchModal(false);
                    await createSolanaWallet();
                  }}
                  disabled={isCreatingSolanaWallet}
                >
                  <WalletLogo type="solana" size={24} style={{ marginRight: 12 }} />
                  <Text style={styles.createWalletText}>
                    {isCreatingSolanaWallet ? 'Creating...' : 'Create Solana Wallet'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Messages Modal */}
      <Modal
        visible={showMessagesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMessagesModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Signed Messages</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowMessagesModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {signedMessages.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📝</Text>
                <Text style={styles.emptyStateTitle}>No Messages Signed</Text>
                <Text style={styles.emptyStateDesc}>
                  Sign your first message to see it here
                </Text>
              </View>
            ) : (
              signedMessages.map((message, index) => (
                <View key={index} style={styles.messageItem}>
                  <Text style={styles.messageIndex}>#{index + 1}</Text>
                  <Text style={styles.messageContent}>{message}</Text>
                  <Text style={styles.messageTime}>
                    {new Date().toLocaleString()}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Transactions Modal */}
      <Modal
        visible={showTransactionsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTransactionsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Transaction History</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTransactionsModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {transactionResults.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📊</Text>
                <Text style={styles.emptyStateTitle}>No Transactions</Text>
                <Text style={styles.emptyStateDesc}>
                  Send your first test transaction to see it here
                </Text>
              </View>
            ) : (
              transactionResults.map((transaction, index) => (
                <View key={index} style={styles.messageItem}>
                  <Text style={styles.messageIndex}>#{index + 1}</Text>
                  <Text style={styles.messageContent}>{transaction}</Text>
                  <Text style={styles.messageTime}>
                    {new Date().toLocaleString()}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 其他模态框... */}
      {/* 省略其他模态框代码以节省空间，保持原有样式 */}
    </View>
  );
};

const styles = StyleSheet.create({
  // 保持原有的所有样式...
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  settingsIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 18,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  profileId: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  currentWalletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    width: '100%',
  },
  currentWalletInfo: {
    flex: 1,
  },
  currentWalletType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  currentWalletAddress: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  switchIcon: {
    fontSize: 20,
    color: '#667eea',
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
  // 新增网络相关样式
  networkInfoContainer: {
    marginTop: 4,
  },
  networkDisplayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.2)',
  },
  networkIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  networkName: {
    fontSize: 11,
    color: '#64748b',
    flex: 1,
  },
  networkSwitchIcon: {
    fontSize: 10,
    marginLeft: 4,
  },
  networkSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  networkSelectorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  networkSelectorName: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
    fontWeight: '500',
  },
  networkSelectorArrow: {
    fontSize: 14,
    color: '#fff',
  },
  networkOption: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  activeNetworkOption: {
    borderColor: '#667eea',
    borderWidth: 2,
  },
  networkOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  networkIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  networkOptionIcon: {
    fontSize: 24,
  },
  networkOptionInfo: {
    flex: 1,
  },
  networkOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  networkOptionDesc: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  networkOptionUrl: {
    fontSize: 11,
    color: '#9ca3af',
  },
  networkOptionCheck: {
    fontSize: 24,
    color: '#667eea',
    fontWeight: 'bold',
  },
  switchingIndicator: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  switchingText: {
    fontSize: 16,
    color: '#667eea',
    marginTop: 12,
    fontWeight: '500',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionIcon: {
    fontSize: 24,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  section: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  accountsBadge: {
    backgroundColor: '#667eea',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  accountsBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  expandIcon: {
    fontSize: 14,
    color: '#94a3b8',
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  walletSection: {
    marginBottom: 20,
  },
  walletSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  activeWalletBadge: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeWalletBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  walletCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  walletCardGradient: {
    padding: 20,
    alignItems: 'center',
  },
  walletStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  walletStatus: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  walletAddress: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
    flex: 1,
  },
  copyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  copyIcon: {
    fontSize: 16,
  },
  walletButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  walletManageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dangerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  walletManageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  walletCreate: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyWalletIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  walletCreateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  walletCreateDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  securityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  securityOptionIcon: {
    fontSize: 18,
  },
  securityInfo: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  securityDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  linkButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  linkButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  viewButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  accountPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  accountIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textTransform: 'capitalize',
  },
  accountId: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  accountStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountStatusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  viewAllButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  linkNewSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  linkNewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  providerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  providerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  providerName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
    marginLeft: 6,
  },
  signOutButton: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fee2e2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  signOutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  signOutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  bottomPadding: {
    height: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#64748b',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
  walletOption: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  activeWalletOption: {
    borderColor: '#667eea',
    borderWidth: 2,
  },
  walletOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  walletOptionInfo: {
    flex: 1,
  },
  walletOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  walletOptionAddress: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  walletOptionNetwork: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  walletOptionCheck: {
    fontSize: 20,
    color: '#667eea',
    fontWeight: 'bold',
  },
  createWalletSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  createWalletTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  createWalletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  createWalletText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyStateDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  messageItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageIndex: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 8,
  },
  messageContent: {
    fontSize: 13,
    color: '#1e293b',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  messageTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
});

export default RedesignedProfileScreen;