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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ProtocolLogo from '@/components/home/ProtocolLogo';
import VaultLogo from '@/components/home/VaultLogo';
import { getProtocolFromVaultName } from '@/utils/home';
import { VaultOption, TimeVaultOption, VaultProduct } from '@/interfaces/home';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';
import { useProtocolService } from '@/services/protocolService';
import AAVEIntegration from '@/utils/transaction/aave';
import getErrorMessage from '@/utils/error';
import Skeleton from '@/components/common/Skeleton';

interface DepositVaultModalProps {
  visible: boolean;
  selectedVault: VaultProduct | null;
  selectedSpecificVault: VaultOption | TimeVaultOption | null;
  onClose: () => void;
}

const DepositVaultModal: React.FC<DepositVaultModalProps> = ({
  visible,
  selectedVault,
  selectedSpecificVault,
  onClose,
}) => {
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentDeposits, setCurrentDeposits] = useState<string>('0');
  const [usdcBalance, setUsdcBalance] = useState<string>('0');
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [networkError, setNetworkError] = useState<string>('');
  const [liveProtocolData, setLiveProtocolData] = useState<any>(null);
  const [loadingProtocolData, setLoadingProtocolData] = useState(false);

  const {
    hasEthereumWallet,
    activeWallet,
    getEthereumProvider,
    getCurrentNetworkKey,
  } = useMultiChainWallet();

  const { getProtocolInfo } = useProtocolService();

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

  const CACHE_DURATION = 30000; // 30秒缓存
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isCacheValid = useCallback(() => {
    if (!balancesCacheRef.current) return false;
    const now = Date.now();
    return now - balancesCacheRef.current.timestamp < CACHE_DURATION;
  }, []);

  const loadLiveProtocolData = useCallback(async () => {
    if (!selectedSpecificVault) return;

    setLoadingProtocolData(true);
    try {
      console.log(
        '🔄 Loading live protocol data for:',
        selectedSpecificVault.name
      );

      const protocolData = await getProtocolInfo(
        selectedSpecificVault.name,
        false
      );

      if (protocolData) {
        setLiveProtocolData(protocolData);
        console.log('✅ Live protocol data loaded:', protocolData);
      } else {
        console.warn('⚠️ No live protocol data available');
        setLiveProtocolData(null);
      }
    } catch (error) {
      console.error('❌ Failed to load live protocol data:', error);
      setLiveProtocolData(null);
    } finally {
      setLoadingProtocolData(false);
    }
  }, [selectedSpecificVault, getProtocolInfo]);

  const initializeAAVE = useCallback(async () => {
    if (initializationRef.current) {
      console.log('🔄 AAVE initialization already in progress, skipping...');
      return;
    }

    if (!hasEthereumWallet || !activeWallet?.address) {
      console.log('❌ No Ethereum wallet available');
      setNetworkError('Please connect an Ethereum wallet');
      return;
    }

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
      if (isCacheValid()) {
        console.log('📋 Using cached balances...');
        const cache = balancesCacheRef.current!;
        setUsdcBalance(cache.usdcBalance);
        setCurrentDeposits(cache.deposits);
        return;
      }
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

      const networkConfig = AAVEIntegration.getNetworkConfig(networkKey);
      if (!networkConfig) {
        const supportedNetworks = AAVEIntegration.getSupportedNetworks();
        throw new Error(
          `Unsupported network: ${networkKey}. Supported networks: ${supportedNetworks.join(', ')}`
        );
      }

      const currentChainId = await provider.request({ method: 'eth_chainId' });
      if (currentChainId !== networkConfig.CHAIN_ID) {
        throw new Error(
          `Network mismatch. Please switch to ${networkConfig.NAME} (${networkConfig.CHAIN_ID})`
        );
      }

      const aave = new AAVEIntegration(
        provider,
        activeWallet.address,
        networkKey
      );

      const isValidNetwork = await aave.validateNetwork();
      if (!isValidNetwork) {
        throw new Error(`Please switch to ${networkConfig.NAME} network`);
      }

      setAaveInstance(aave);

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

  // 🔧 加载实时协议数据
  useEffect(() => {
    if (visible && selectedSpecificVault) {
      console.log('🎯 Modal opened, loading live protocol data...');
      loadLiveProtocolData();
    }
  }, [visible, selectedSpecificVault, loadLiveProtocolData]);

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
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row justify-between items-center p-5 bg-white border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-900">
            {isTimeVault
              ? `Open ${displayVault?.name}`
              : isSpecificVault
                ? `Open ${displayVault?.name} Vault`
                : `Open ${displayVault?.name}`}
          </Text>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            onPress={onClose}
          >
            <Text className="text-xl text-gray-500">×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-5">
          {/* Vault Header - 保持原有样式 */}
          {isTimeVault ? (
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              className="rounded-2xl p-6 mb-6"
              style={{ borderRadius: 16, padding: 24, marginBottom: 24 }}
            >
              <View
                className="flex-row items-center mb-4"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <ProtocolLogo
                  protocol={getProtocolFromVaultName(displayVault.name)}
                  size={48}
                />
                <View
                  className="ml-3 flex-1"
                  style={{ marginLeft: 12, flex: 1 }}
                >
                  <Text className="text-xl font-bold text-white">
                    {displayVault.name}
                  </Text>
                  <Text className="text-sm text-white/80">
                    {displayVault.description}
                  </Text>
                </View>
              </View>
              <View
                className="flex-row gap-4"
                style={{ flexDirection: 'row', gap: 16 }}
              >
                <View className="flex-1" style={{ flex: 1 }}>
                  <Text className="text-sm text-white/80">APY Rate</Text>
                  <Text className="text-lg font-bold text-white">
                    {displayVault?.apy}
                  </Text>
                </View>
                <View className="flex-1" style={{ flex: 1 }}>
                  <Text className="text-sm text-white/80">Lock Period</Text>
                  <Text className="text-lg font-bold text-white">
                    {(displayVault as TimeVaultOption).lockPeriod}
                  </Text>
                </View>
              </View>
              <View className="mt-3" style={{ marginTop: 12 }}>
                <Text className="text-sm text-white/80">Protocol</Text>
                <Text className="text-lg font-bold text-white">
                  {(displayVault as TimeVaultOption).protocol}
                </Text>
              </View>
            </LinearGradient>
          ) : isSpecificVault ? (
            <LinearGradient
              colors={['#764ba2', '#c084fc']}
              className="rounded-2xl p-6 mb-6"
              style={{ borderRadius: 16, padding: 24, marginBottom: 24 }}
            >
              <View
                className="flex-row items-center mb-4"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <ProtocolLogo protocol={displayVault?.name || ''} size={48} />
                <View
                  className="ml-3 flex-1"
                  style={{ marginLeft: 12, flex: 1 }}
                >
                  <Text className="text-xl font-bold text-white">
                    {displayVault?.name}
                  </Text>
                  <Text className="text-sm text-white/80">
                    {liveProtocolData?.description || displayVault?.description}
                  </Text>
                </View>
              </View>
              <View
                className="flex-row gap-4"
                style={{ flexDirection: 'row', gap: 16 }}
              >
                <View className="flex-1" style={{ flex: 1 }}>
                  <Text className="text-sm text-white/80">APY Rate</Text>
                  {loadingProtocolData ? (
                    <Skeleton width={60} height={20} />
                  ) : liveProtocolData ? (
                    <View className="flex-row items-center">
                      <Text className="text-lg font-bold text-white">
                        {liveProtocolData.apyDisplay}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-lg font-bold text-white">
                      {displayVault?.apy}
                    </Text>
                  )}
                </View>
                <View className="flex-1" style={{ flex: 1 }}>
                  <Text className="text-sm text-white/80">TVL</Text>
                  {loadingProtocolData ? (
                    <Skeleton width={80} height={20} />
                  ) : liveProtocolData ? (
                    <View className="flex-row items-center">
                      <Text className="text-lg font-bold text-white">
                        {liveProtocolData.tvl}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-lg font-bold text-white">
                      {(displayVault as VaultOption).tvl}
                    </Text>
                  )}
                </View>
              </View>
              <View className="mt-3" style={{ marginTop: 12 }}>
                <Text className="text-sm text-white/80">Risk Level</Text>
                {loadingProtocolData ? (
                  <Skeleton width={100} height={20} />
                ) : liveProtocolData ? (
                  <View className="flex-row items-center">
                    <Text className="text-lg font-bold text-white">
                      {liveProtocolData.risk}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-lg font-bold text-white">
                    {(displayVault as VaultOption).risk}
                  </Text>
                )}
              </View>
            </LinearGradient>
          ) : (
            <LinearGradient
              colors={
                ((displayVault as VaultProduct)?.gradientColors as [
                  string,
                  string,
                  ...string[],
                ]) || ['#c084fc', '#f472b6']
              }
              className="rounded-2xl p-6 mb-6"
              style={{ borderRadius: 16, padding: 24, marginBottom: 24 }}
            >
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-white">
                  {displayVault?.name}
                </Text>
                <VaultLogo vaultName={displayVault?.name || ''} size={24} />
              </View>
              <View
                className="flex-row gap-4"
                style={{ flexDirection: 'row', gap: 16 }}
              >
                <View className="flex-1" style={{ flex: 1 }}>
                  <Text className="text-sm text-white/80">APY Rate</Text>
                  <Text className="text-lg font-bold text-white">
                    {displayVault?.apy}
                  </Text>
                </View>
                <View className="flex-1" style={{ flex: 1 }}>
                  <Text className="text-sm text-white/80">Minimum</Text>
                  <Text className="text-lg font-bold text-white">
                    {(displayVault as VaultProduct).minimum}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          )}

          {/* 恢复原本的功能描述 */}
          <View className="mb-6">
            <Text className="text-base font-bold text-gray-900 mb-4">
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
                  <View key={index} className="flex-row items-center mb-2">
                    <View className="w-2 h-2 rounded-full bg-indigo-500 mr-3" />
                    <Text className="text-sm text-gray-700">{feature}</Text>
                  </View>
                ))
              : isSpecificVault
                ? [
                    'Flexible access anytime',
                    'Auto-compounding rewards',
                    'Audited smart contracts',
                    '24/7 yield optimization',
                  ].map((feature, index) => (
                    <View key={index} className="flex-row items-center mb-2">
                      <View className="w-2 h-2 rounded-full bg-purple-600 mr-3" />
                      <Text className="text-sm text-gray-700">{feature}</Text>
                    </View>
                  ))
                : (displayVault as VaultProduct).features.map(
                    (feature, index) => (
                      <View key={index} className="flex-row items-center mb-2">
                        <View className="w-2 h-2 rounded-full bg-purple-400 mr-3" />
                        <Text className="text-sm text-gray-700">{feature}</Text>
                      </View>
                    )
                  )}
          </View>

          {/* 原本的余额和输入区域 */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-gray-700">USDC Wallet Balance</Text>
              <View className="items-end">
                {loadingBalance ? (
                  <ActivityIndicator size="small" color="#111827" />
                ) : (
                  <Text className="text-base font-semibold text-gray-900">
                    ${usdcBalance}
                  </Text>
                )}
              </View>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-gray-700">AAVE Deposit Amount</Text>
              <View className="items-end">
                {loadingBalance ? (
                  <ActivityIndicator size="small" color="#111827" />
                ) : networkError ? (
                  <View className="items-end">
                    <Text className="text-base font-semibold text-gray-900">
                      $0
                    </Text>
                    <Text className="text-xs text-red-500 mt-0.5">
                      ⚠️ Network issue
                    </Text>
                  </View>
                ) : (
                  <Text className="text-base font-semibold text-gray-900">
                    ${currentDeposits}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* 输入框 */}
          <View className="mb-4">
            <TextInput
              className="bg-white rounded-xl p-4 text-base border border-gray-200 text-gray-900"
              value={depositAmount}
              onChangeText={setDepositAmount}
              placeholder="Enter USDC amount"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* 🔧 改进的错误提示 */}
          {networkError && (
            <View className="bg-red-50 rounded-xl p-4 mb-4 border border-red-200">
              <Text className="text-sm text-red-600 leading-5">
                {networkError}
              </Text>
            </View>
          )}

          <View className="flex-row gap-3">
            <TouchableOpacity
              className={`flex-1 bg-gray-100 rounded-2xl py-4 items-center ${
                isLoading || networkError ? 'opacity-60' : ''
              }`}
              onPress={handleWithdraw}
              disabled={isLoading || !!networkError}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#374151" />
              ) : (
                <Text className="text-base font-semibold text-gray-700">
                  Withdraw
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 bg-gray-900 rounded-2xl py-4 items-center ${
                isLoading || networkError ? 'opacity-60' : ''
              }`}
              onPress={handleDeposit}
              disabled={isLoading || !!networkError}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-base font-semibold text-white">
                  Start Saving
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default DepositVaultModal;
