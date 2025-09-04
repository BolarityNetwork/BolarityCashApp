// components/PerfectVaultSavingsPlatform/modals/DepositModal.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ProtocolLogo from '@/components/home/ProtocolLogo';
import VaultLogo from '@/components/home/VaultLogo';
import { getProtocolFromVaultName } from '@/utils/home';
import { VaultOption, TimeVaultOption, VaultProduct } from '@/interfaces/home';
import { useMultiChainWallet } from '../../hooks/useMultiChainWallet';
import AAVEIntegration from '@/utils/transaction/aave';
import getErrorMessage from '@/utils/error';

interface DepositModalProps {
  visible: boolean;
  selectedVault: VaultProduct | null;
  selectedSpecificVault: VaultOption | TimeVaultOption | null;
  onClose: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({
  visible,
  selectedVault,
  selectedSpecificVault,
  onClose,
}) => {
  // 状态管理
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentDeposits, setCurrentDeposits] = useState<string>('0');
  const [usdcBalance, setUsdcBalance] = useState<string>('0');
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [networkError, setNetworkError] = useState<string>('');

  // 钱包Hook
  const {
    hasEthereumWallet,
    activeWallet,
    getEthereumProvider,
    getCurrentNetworkKey,
  } = useMultiChainWallet();

  // AAVE实例管理
  const [aaveInstance, setAaveInstance] = useState<AAVEIntegration | null>(
    null
  );
  const initializationRef = useRef<boolean>(false);
  const lastNetworkRef = useRef<string>('');
  const lastAddressRef = useRef<string>('');
  const balancesCacheRef = useRef<{
    usdcBalance: string;
    deposits: string;
    timestamp: number;
  } | null>(null);

  // 🔧 防抖和缓存机制
  const CACHE_DURATION = 30000; // 30秒缓存
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 🔧 检查缓存是否有效
  const isCacheValid = useCallback(() => {
    if (!balancesCacheRef.current) return false;
    const now = Date.now();
    return now - balancesCacheRef.current.timestamp < CACHE_DURATION;
  }, []);

  // 🔧 修复后的初始化逻辑 - 防止无限循环
  const initializeAAVE = useCallback(async () => {
    // 防止重复初始化
    if (initializationRef.current) {
      console.log('🔄 AAVE initialization already in progress, skipping...');
      return;
    }

    if (!hasEthereumWallet || !activeWallet?.address) {
      console.log('❌ No Ethereum wallet available');
      setNetworkError('Please connect an Ethereum wallet');
      return;
    }

    // 检查是否真的需要重新初始化
    const currentNetwork = getCurrentNetworkKey();
    const currentAddress = activeWallet?.address || '';

    if (
      aaveInstance &&
      lastNetworkRef.current === currentNetwork &&
      lastAddressRef.current === currentAddress
    ) {
      console.log(
        '🎯 AAVE already initialized for current network/address, skipping...'
      );
      // 如果有有效缓存，直接使用
      if (isCacheValid()) {
        console.log('📋 Using cached balances...');
        const cache = balancesCacheRef.current!;
        setUsdcBalance(cache.usdcBalance);
        setCurrentDeposits(cache.deposits);
        return;
      }
      // 否则只刷新余额
      loadBalances();
      return;
    }

    initializationRef.current = true;
    setLoadingBalance(true);
    setNetworkError('');

    try {
      console.log('🚀 Initializing AAVE integration...');

      const provider = await getEthereumProvider();
      const networkKey = getCurrentNetworkKey();

      console.log(
        `🌐 Network: ${networkKey}, Address: ${activeWallet.address}`
      );

      // 验证网络支持
      const networkConfig = AAVEIntegration.getNetworkConfig(networkKey);
      if (!networkConfig) {
        const supportedNetworks = AAVEIntegration.getSupportedNetworks();
        throw new Error(
          `Unsupported network: ${networkKey}. Supported networks: ${supportedNetworks.join(', ')}`
        );
      }

      // 验证当前链ID
      const currentChainId = await provider.request({ method: 'eth_chainId' });
      if (currentChainId !== networkConfig.CHAIN_ID) {
        throw new Error(
          `Network mismatch. Please switch to ${networkConfig.NAME} (${networkConfig.CHAIN_ID})`
        );
      }

      // 创建AAVE实例
      const aave = new AAVEIntegration(
        provider,
        activeWallet.address,
        networkKey
      );

      // 验证网络连接
      const isValidNetwork = await aave.validateNetwork();
      if (!isValidNetwork) {
        throw new Error(`Please switch to ${networkConfig.NAME} network`);
      }

      setAaveInstance(aave);

      // 直接加载余额
      await loadBalancesForInstance(aave);
    } catch (error) {
      console.error('❌ Failed to initialize AAVE:', error);
      setNetworkError(getErrorMessage(error));
      setCurrentDeposits('0');
      setUsdcBalance('0');
    } finally {
      setLoadingBalance(false);
      initializationRef.current = false;
    }
  }, [
    hasEthereumWallet,
    activeWallet?.address,
    getEthereumProvider,
    getCurrentNetworkKey,
    aaveInstance,
    isCacheValid,
  ]);

  // 🔧 直接为特定实例加载余额
  const loadBalancesForInstance = useCallback(async (aave: AAVEIntegration) => {
    try {
      console.log('💰 Loading balances for new instance...');

      // 并行加载USDC余额和AAVE存款
      const [usdcBal, deposits] = await Promise.all([
        aave.getUSDCBalance(),
        aave.getUserDeposits(),
      ]);

      console.log('usdcBal', usdcBal);
      console.log('deposits', deposits);

      const formattedUsdcBalance = parseFloat(usdcBal).toFixed(2);
      const depositAmount = parseFloat(deposits.aTokenBalance);
      const formattedDeposits =
        depositAmount > 0 ? depositAmount.toFixed(2) : '0';

      // 更新缓存
      balancesCacheRef.current = {
        usdcBalance: formattedUsdcBalance,
        deposits: formattedDeposits,
        timestamp: Date.now(),
      };

      setUsdcBalance(formattedUsdcBalance);
      setCurrentDeposits(formattedDeposits);

      console.log(
        `✅ Balances loaded and cached for new instance - USDC: ${formattedUsdcBalance}, Deposits: ${formattedDeposits}`
      );
    } catch (error) {
      console.error('❌ Failed to load balances for instance:', error);
      setNetworkError(`Failed to load balances: ${getErrorMessage(error)}`);
    }
  }, []);

  // 🔧 加载余额的单独函数 - 带缓存和防抖
  const loadBalances = useCallback(
    async (aaveInstanceToUse?: AAVEIntegration) => {
      const aave = aaveInstanceToUse || aaveInstance;
      if (!aave) return;

      // 如果传入了特定实例，直接加载
      if (aaveInstanceToUse) {
        await loadBalancesForInstance(aaveInstanceToUse);
        return;
      }

      // 清除之前的防抖定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 检查缓存
      if (isCacheValid()) {
        console.log('📋 Using cached balances (loadBalances)...');
        const cache = balancesCacheRef.current!;
        setUsdcBalance(cache.usdcBalance);
        setCurrentDeposits(cache.deposits);
        return;
      }

      // 防抖：延迟执行
      debounceTimerRef.current = setTimeout(async () => {
        await loadBalancesForInstance(aave);
      }, 500) as any; // 500ms 防抖
    },
    [aaveInstance, isCacheValid, loadBalancesForInstance]
  );

  // 🔧 使用useEffect但限制触发条件
  const currentNetworkKey = getCurrentNetworkKey();
  const currentAddress = activeWallet?.address;

  useEffect(() => {
    if (visible && hasEthereumWallet && currentAddress) {
      console.log('🎯 Modal opened, checking AAVE initialization...');
      initializeAAVE();
    }
  }, [visible, hasEthereumWallet, currentAddress, initializeAAVE]);

  // 🔧 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 🔧 网络或地址变化时重置状态
  useEffect(() => {
    if (
      visible &&
      (lastNetworkRef.current !== currentNetworkKey ||
        lastAddressRef.current !== currentAddress)
    ) {
      console.log(
        `🔄 Network/Address changed from ${lastNetworkRef.current}/${lastAddressRef.current} to ${currentNetworkKey}/${currentAddress}`
      );

      // 清理现有状态
      setAaveInstance(null);
      initializationRef.current = false;
      balancesCacheRef.current = null;

      // 更新refs
      lastNetworkRef.current = currentNetworkKey;
      lastAddressRef.current = currentAddress || '';

      // 重新初始化
      if (currentAddress) {
        initializeAAVE();
      }
    }
  }, [visible, currentNetworkKey, currentAddress, initializeAAVE]);

  // 🔧 处理存款 - 全英文版本
  const handleDeposit = useCallback(async () => {
    if (!aaveInstance || !depositAmount || parseFloat(depositAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid deposit amount');
      return;
    }

    const amount = parseFloat(depositAmount);
    const availableBalance = parseFloat(usdcBalance);

    if (amount > availableBalance) {
      Alert.alert(
        'Insufficient Balance',
        `You only have ${usdcBalance} USDC, cannot deposit ${depositAmount} USDC`
      );
      return;
    }

    setIsLoading(true);
    try {
      console.log(`💰 Depositing ${depositAmount} USDC...`);

      const result = await aaveInstance.deposit(depositAmount);

      if (result.success) {
        Alert.alert(
          'Deposit Successful!',
          `Successfully deposited ${depositAmount} USDC to AAVE\n\nTransaction Hash: ${result.transactionHash?.substring(0, 10)}...`,
          [
            {
              text: 'View Transaction',
              onPress: () => {
                const explorerUrl = `https://basescan.org/tx/${result.transactionHash}`;
                console.log(`🔗 Opening explorer: ${explorerUrl}`);
              },
            },
            { text: 'OK' },
          ]
        );

        setDepositAmount('');

        // 清除缓存并刷新余额
        balancesCacheRef.current = null;
        await loadBalances();
      } else {
        Alert.alert('Deposit Failed', result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Deposit error:', error);
      Alert.alert('Deposit Failed', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [aaveInstance, depositAmount, usdcBalance, loadBalances]);

  // 🔧 处理提取 - 全英文版本
  const handleWithdraw = useCallback(async () => {
    if (!aaveInstance || !depositAmount || parseFloat(depositAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid withdrawal amount');
      return;
    }

    const amount = parseFloat(depositAmount);
    const availableDeposits = parseFloat(currentDeposits);

    if (amount > availableDeposits) {
      Alert.alert(
        'Insufficient Deposits',
        `You only have ${currentDeposits} USDC deposited, cannot withdraw ${depositAmount} USDC`
      );
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `Are you sure you want to withdraw ${depositAmount} USDC?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setIsLoading(true);
            try {
              console.log(`💸 Withdrawing ${depositAmount} USDC...`);

              const result = await aaveInstance.withdraw(depositAmount);

              if (result.success) {
                Alert.alert(
                  'Withdrawal Successful!',
                  `Successfully withdrew ${depositAmount} USDC\n\nTransaction Hash: ${result.transactionHash?.substring(0, 10)}...`,
                  [
                    {
                      text: 'View Transaction',
                      onPress: () => {
                        const explorerUrl = `https://basescan.org/tx/${result.transactionHash}`;
                        console.log(`🔗 Opening explorer: ${explorerUrl}`);
                      },
                    },
                    { text: 'OK' },
                  ]
                );

                setDepositAmount('');

                // 清除缓存并刷新余额
                balancesCacheRef.current = null;
                await loadBalances();
              } else {
                Alert.alert(
                  'Withdrawal Failed',
                  result.error || 'Unknown error'
                );
              }
            } catch (error) {
              console.error('❌ Withdrawal error:', error);
              Alert.alert('Withdrawal Failed', getErrorMessage(error));
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  }, [aaveInstance, depositAmount, currentDeposits, loadBalances]);

  if (!visible || (!selectedVault && !selectedSpecificVault)) {
    return null;
  }

  const displayVault = selectedSpecificVault || selectedVault;
  const isSpecificVault = !!selectedSpecificVault;
  const isTimeVault = displayVault && 'lockPeriod' in displayVault;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {isTimeVault
              ? `Open ${displayVault?.name}`
              : isSpecificVault
                ? `Open ${displayVault?.name} Vault`
                : `Open ${displayVault?.name}`}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Vault Header - 保持原有样式 */}
          {isTimeVault ? (
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.depositVaultHeader}
            >
              <View style={styles.depositVaultInfo}>
                <ProtocolLogo
                  protocol={getProtocolFromVaultName(displayVault.name)}
                  size={48}
                />
                <View style={styles.depositVaultText}>
                  <Text style={styles.depositVaultName}>
                    {displayVault.name}
                  </Text>
                  <Text style={styles.depositVaultDesc}>
                    {displayVault.description}
                  </Text>
                </View>
              </View>
              <View style={styles.depositVaultStats}>
                <View style={styles.depositStatItem}>
                  <Text style={styles.depositStatLabel}>APY Rate</Text>
                  <Text style={styles.depositStatValue}>
                    {displayVault.apy}
                  </Text>
                </View>
                <View style={styles.depositStatItem}>
                  <Text style={styles.depositStatLabel}>Lock Period</Text>
                  <Text style={styles.depositStatValue}>
                    {(displayVault as TimeVaultOption).lockPeriod}
                  </Text>
                </View>
              </View>
              <View style={styles.depositProtocol}>
                <Text style={styles.depositStatLabel}>Protocol</Text>
                <Text style={styles.depositStatValue}>
                  {(displayVault as TimeVaultOption).protocol}
                </Text>
              </View>
            </LinearGradient>
          ) : isSpecificVault ? (
            <LinearGradient
              colors={['#764ba2', '#c084fc']}
              style={styles.depositVaultHeader}
            >
              <View style={styles.depositVaultInfo}>
                <ProtocolLogo protocol={displayVault?.name} size={48} />
                <View style={styles.depositVaultText}>
                  <Text style={styles.depositVaultName}>
                    {displayVault?.name}
                  </Text>
                  <Text style={styles.depositVaultDesc}>
                    {displayVault?.description}
                  </Text>
                </View>
              </View>
              <View style={styles.depositVaultStats}>
                <View style={styles.depositStatItem}>
                  <Text style={styles.depositStatLabel}>APY Rate</Text>
                  <Text style={styles.depositStatValue}>
                    {displayVault?.apy}
                  </Text>
                </View>
                <View style={styles.depositStatItem}>
                  <Text style={styles.depositStatLabel}>TVL</Text>
                  <Text style={styles.depositStatValue}>
                    {(displayVault as VaultOption).tvl}
                  </Text>
                </View>
              </View>
              <View style={styles.depositProtocol}>
                <Text style={styles.depositStatLabel}>Risk Level</Text>
                <Text style={styles.depositStatValue}>
                  {(displayVault as VaultOption).risk}
                </Text>
              </View>
            </LinearGradient>
          ) : (
            <LinearGradient
              colors={(displayVault as VaultProduct).gradientColors}
              style={styles.depositVaultHeader}
            >
              <View style={styles.depositVaultHeaderContent}>
                <Text style={styles.depositVaultName}>{displayVault.name}</Text>
                <VaultLogo vaultName={displayVault.name} size={24} />
              </View>
              <View style={styles.depositVaultStats}>
                <View style={styles.depositStatItem}>
                  <Text style={styles.depositStatLabel}>APY Rate</Text>
                  <Text style={styles.depositStatValue}>
                    {displayVault.apy}
                  </Text>
                </View>
                <View style={styles.depositStatItem}>
                  <Text style={styles.depositStatLabel}>Minimum</Text>
                  <Text style={styles.depositStatValue}>
                    {(displayVault as VaultProduct).minimum}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          )}

          {/* 恢复原本的功能描述 */}
          <View style={styles.depositFeatures}>
            <Text style={styles.depositFeaturesTitle}>
              {isTimeVault
                ? 'Vault Features:'
                : isSpecificVault
                  ? 'Protocol Features:'
                  : 'Key Features:'}
            </Text>
            {isTimeVault
              ? [
                  'Fixed-term guaranteed returns',
                  'No early withdrawal penalty',
                  'Automated yield optimization',
                  'Institutional-grade security',
                ].map((feature, index) => (
                  <View key={index} style={styles.depositFeatureItem}>
                    <View
                      style={[
                        styles.depositFeatureDot,
                        { backgroundColor: '#667eea' },
                      ]}
                    />
                    <Text style={styles.depositFeatureText}>{feature}</Text>
                  </View>
                ))
              : isSpecificVault
                ? [
                    'Flexible access anytime',
                    'Auto-compounding rewards',
                    'Audited smart contracts',
                    '24/7 yield optimization',
                  ].map((feature, index) => (
                    <View key={index} style={styles.depositFeatureItem}>
                      <View
                        style={[
                          styles.depositFeatureDot,
                          { backgroundColor: '#764ba2' },
                        ]}
                      />
                      <Text style={styles.depositFeatureText}>{feature}</Text>
                    </View>
                  ))
                : (displayVault as VaultProduct).features.map(
                    (feature, index) => (
                      <View key={index} style={styles.depositFeatureItem}>
                        <View
                          style={[
                            styles.depositFeatureDot,
                            { backgroundColor: '#c084fc' },
                          ]}
                        />
                        <Text style={styles.depositFeatureText}>{feature}</Text>
                      </View>
                    )
                  )}
          </View>

          {/* 原本的余额和输入区域 */}
          <View style={styles.depositSummary}>
            <View style={styles.depositSummaryRow}>
              <Text style={styles.depositSummaryLabel}>
                USDC Wallet Balance
              </Text>
              <View style={styles.depositAmountContainer}>
                {loadingBalance ? (
                  <ActivityIndicator size="small" color="#111827" />
                ) : (
                  <Text style={styles.depositSummaryAmount}>
                    ${usdcBalance}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.depositSummaryRow}>
              <Text style={styles.depositSummaryLabel}>
                AAVE Deposit Amount
              </Text>
              <View style={styles.depositAmountContainer}>
                {loadingBalance ? (
                  <ActivityIndicator size="small" color="#111827" />
                ) : networkError ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.depositSummaryAmount}>$0</Text>
                    <Text style={styles.errorText}>⚠️ Network issue</Text>
                  </View>
                ) : (
                  <Text style={styles.depositSummaryAmount}>
                    ${currentDeposits}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* 输入框 */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.amountInput}
              value={depositAmount}
              onChangeText={setDepositAmount}
              placeholder="Enter USDC amount"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* 🔧 改进的错误提示 */}
          {networkError && (
            <View style={styles.networkErrorContainer}>
              <Text style={styles.networkErrorText}>{networkError}</Text>
            </View>
          )}

          <View style={styles.depositActions}>
            <TouchableOpacity
              style={[
                styles.learnMoreButton,
                (isLoading || networkError) && styles.disabledButton,
              ]}
              onPress={handleWithdraw}
              disabled={isLoading || !!networkError}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#374151" />
              ) : (
                <Text style={styles.learnMoreText}>Withdraw</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.startSavingButton,
                (isLoading || networkError) && styles.disabledButton,
              ]}
              onPress={handleDeposit}
              disabled={isLoading || !!networkError}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.startSavingText}>Start Saving</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
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

  // Vault Header Styles (保持原有样式)
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

  // 功能描述样式
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
    backgroundColor: '#667eea',
    marginRight: 12,
  },
  depositFeatureText: {
    fontSize: 14,
    color: '#374151',
  },

  // 原本的存款汇总样式
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
    fontSize: 16,
    fontWeight: '600',
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
  depositAmountContainer: {
    alignItems: 'flex-end',
  },
  errorContainer: {
    alignItems: 'flex-end',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 2,
  },

  // 输入框样式
  inputContainer: {
    marginBottom: 16,
  },
  amountInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#111827',
  },

  // 操作按钮样式
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
  disabledButton: {
    opacity: 0.6,
  },

  // 🔧 错误提示
  networkErrorContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  networkErrorText: {
    fontSize: 14,
    color: '#dc2626',
    lineHeight: 20,
  },
});

export default DepositModal;
