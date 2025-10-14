// components/PerfectVaultSavingsPlatform/modals/DepositModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
import { VaultItem } from '@/api/vault';
import { useVaultStore } from '@/stores/vaultStore';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';
import { useProtocolService } from '@/services/protocolService';
import getErrorMessage from '@/utils/error';
import Skeleton from '@/components/common/Skeleton';
import { ProtocolInfo } from '@/services/protocols/types';
import {
  useUserBalances,
  getProtocolUSDCAmount,
  getWalletUSDCBalance as getWalletUSDC,
} from '@/api/account';
import AnimatedNumber from '../AnimatedNumber';

interface DepositVaultModalProps {
  visible: boolean;
  selectedVault: VaultItem | null;
  selectedSpecificVault: VaultOption | TimeVaultOption | null;
  vaultId?: string; // Optional vault ID for direct access
  onClose: () => void;
}

const DepositVaultModal: React.FC<DepositVaultModalProps> = ({
  visible,
  selectedVault,
  selectedSpecificVault,
  vaultId,
  onClose,
}) => {
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [protocolData, setProtocolData] = useState<ProtocolInfo | null>(null);
  const [loadingProtocolData, setLoadingProtocolData] = useState(false);
  const { activeWallet } = useMultiChainWallet();

  // Get vault from store by ID if provided
  const { getVaultById } = useVaultStore();
  const vaultFromStore = vaultId ? getVaultById(vaultId) : null;

  // Type guards
  const isVaultItem = (vault: any): vault is VaultItem => {
    return vault && 'protocol' in vault && 'id' in vault;
  };

  const isVaultOption = (vault: any): vault is VaultOption => {
    return vault && 'name' in vault && !('protocol' in vault);
  };

  const isTimeVaultOption = (vault: any): vault is TimeVaultOption => {
    return vault && 'lockPeriod' in vault;
  };

  const isVaultProduct = (vault: any): vault is VaultProduct => {
    return vault && 'features' in vault && 'gradientColors' in vault;
  };

  const {
    data: balancesData,
    refetch: refetchBalance,
    isLoading: isLoadingBalance,
  } = useUserBalances(activeWallet?.address || '', !!activeWallet?.address);

  const {
    getProtocolInfo,
    deposit: depositToProtocol,
    withdraw: withdrawFromProtocol,
  } = useProtocolService();

  // Get current protocol name
  const getProtocolName = useCallback(() => {
    if (selectedSpecificVault) {
      return selectedSpecificVault.name;
    }
    return null;
  }, [selectedSpecificVault]);

  // 获取协议的存款金额
  const getProtocolDepositAmount = useCallback(() => {
    if (!selectedSpecificVault) return 0;
    const protocolName = selectedSpecificVault.name.toLowerCase();
    return getProtocolUSDCAmount(balancesData, protocolName);
  }, [balancesData, selectedSpecificVault]);

  // 获取钱包的 USDC 余额
  const getWalletUSDCBalance = useCallback(() => {
    return getWalletUSDC(balancesData);
  }, [balancesData]);

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
        activeWallet?.address,
        true
      );

      if (protocolData) {
        setProtocolData(protocolData);
        console.log('✅ Live protocol data loaded:', protocolData);
      } else {
        console.warn('⚠️ No live protocol data available');
        setProtocolData(null);
      }
    } catch (error) {
      console.error('❌ Failed to load live protocol data:', error);
      setProtocolData(null);
    } finally {
      setLoadingProtocolData(false);
    }
  }, [selectedSpecificVault, getProtocolInfo, activeWallet?.address]);

  // Load live protocol data (只在 modal 打开或选择的 vault 变化时加载)
  useEffect(() => {
    if (visible && selectedSpecificVault) {
      console.log('🎯 Modal opened, loading live protocol data...');
      loadLiveProtocolData();
    }
  }, [visible, selectedSpecificVault]);

  // Handle deposit
  const handleDeposit = useCallback(async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid deposit amount');
      return;
    }

    const protocolName = getProtocolName();
    if (!protocolName) {
      Alert.alert('Error', 'No protocol selected');
      return;
    }

    setIsDepositing(true);
    setError(null);

    try {
      console.log(`💰 Depositing ${depositAmount} USDC to ${protocolName}...`);

      const txHash = await depositToProtocol(protocolName, {
        asset: 'USDC',
        amount: depositAmount,
      });
      Alert.alert(
        'Deposit Successful',
        `Successfully deposited ${depositAmount} USDC to ${protocolName}\nTransaction: ${txHash.slice(0, 10)}...`,
        [
          {
            text: 'OK',
            onPress: () => {
              setDepositAmount('');
              loadLiveProtocolData();
              refetchBalance();
            },
          },
        ]
      );
    } catch (err) {
      console.error('❌ Deposit error:', err);
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      Alert.alert('Deposit Failed', errorMsg);
    } finally {
      setIsDepositing(false);
    }
  }, [depositAmount, getProtocolName, depositToProtocol, loadLiveProtocolData]);

  // Handle withdraw
  const handleWithdraw = useCallback(async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid withdrawal amount');
      return;
    }

    const protocolName = getProtocolName();
    if (!protocolName) {
      Alert.alert('Error', 'No protocol selected');
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `Are you sure you want to withdraw ${depositAmount} USDC from ${protocolName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setIsWithdrawing(true);
            setError(null);

            try {
              console.log(
                `💸 Withdrawing ${depositAmount} USDC from ${protocolName}...`
              );

              const txHash = await withdrawFromProtocol(protocolName, {
                asset: 'USDC',
                amount: depositAmount,
              });

              Alert.alert(
                'Withdrawal Successful',
                `Successfully withdrew ${depositAmount} USDC from ${protocolName}\nTransaction: ${txHash.slice(0, 10)}...`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setDepositAmount('');
                      loadLiveProtocolData();
                      refetchBalance();
                    },
                  },
                ]
              );
            } catch (err) {
              console.error('❌ Withdrawal error:', err);
              const errorMsg = getErrorMessage(err);
              setError(errorMsg);
              Alert.alert('Withdrawal Failed', errorMsg);
            } finally {
              setIsWithdrawing(false);
            }
          },
        },
      ]
    );
  }, [
    depositAmount,
    getProtocolName,
    withdrawFromProtocol,
    loadLiveProtocolData,
  ]);

  // Determine the vault to display - prioritize vault from store by ID
  const displayVault = vaultFromStore || selectedSpecificVault || selectedVault;
  const isSpecificVault = !!selectedSpecificVault;
  const isTimeVault = isTimeVaultOption(displayVault);
  const isVaultFromStore = !!vaultFromStore;

  if (!visible || !displayVault) {
    return null;
  }

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
            {isVaultFromStore && isVaultItem(displayVault)
              ? `Open ${displayVault.protocol.toUpperCase()} Vault`
              : isTimeVault && isTimeVaultOption(displayVault)
                ? `Open ${displayVault.name}`
                : isSpecificVault && isVaultOption(displayVault)
                  ? `Open ${displayVault.name} Vault`
                  : isVaultProduct(displayVault)
                    ? `Open ${displayVault.name}`
                    : 'Open Vault'}
          </Text>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            onPress={onClose}
          >
            <Text className="text-xl text-gray-500">×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-5">
          {/* Error Display */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <Text className="text-red-700 text-sm font-medium mb-1">
                Transaction Error
              </Text>
              <Text className="text-red-600 text-xs">{error}</Text>
              <TouchableOpacity
                onPress={() => setError(null)}
                className="mt-2 self-start"
              >
                <Text className="text-red-600 text-xs font-semibold">
                  Dismiss
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Vault Header - Support vault from store */}
          {isVaultFromStore && isVaultItem(displayVault) ? (
            <LinearGradient
              colors={['#10b981', '#06b6d4']}
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
                <ProtocolLogo protocol={displayVault.protocol} size={48} />
                <View
                  className="ml-3 flex-1"
                  style={{ marginLeft: 12, flex: 1 }}
                >
                  <Text className="text-xl font-bold text-white">
                    {displayVault.protocol.toUpperCase()}
                  </Text>
                  <Text className="text-sm text-white/80">
                    {displayVault.note}
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
                    {displayVault.apy}
                  </Text>
                </View>
                <View className="flex-1" style={{ flex: 1 }}>
                  <Text className="text-sm text-white/80">TVL</Text>
                  <Text className="text-lg font-bold text-white">
                    {displayVault.tvl}
                  </Text>
                </View>
              </View>
              <View className="mt-3" style={{ marginTop: 12 }}>
                <Text className="text-sm text-white/80">Risk Level</Text>
                <Text className="text-lg font-bold text-white">
                  {displayVault.risk}
                </Text>
              </View>
            </LinearGradient>
          ) : isTimeVault && isTimeVaultOption(displayVault) ? (
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
          ) : isSpecificVault && isVaultOption(displayVault) ? (
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
                <ProtocolLogo protocol={displayVault.name} size={48} />
                <View
                  className="ml-3 flex-1"
                  style={{ marginLeft: 12, flex: 1 }}
                >
                  <Text className="text-xl font-bold text-white">
                    {displayVault.name}
                  </Text>
                  <Text className="text-sm text-white/80">
                    {protocolData?.description || displayVault.description}
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
                  ) : protocolData ? (
                    <View className="flex-row items-center">
                      <Text className="text-lg font-bold text-white">
                        {protocolData.apyDisplay}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-lg font-bold text-white">
                      {displayVault.apy}
                    </Text>
                  )}
                </View>
                <View className="flex-1" style={{ flex: 1 }}>
                  <Text className="text-sm text-white/80">TVL</Text>
                  {loadingProtocolData ? (
                    <Skeleton width={80} height={20} />
                  ) : protocolData ? (
                    <View className="flex-row items-center">
                      <Text className="text-lg font-bold text-white">
                        {protocolData.tvl}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-lg font-bold text-white">
                      {displayVault.tvl}
                    </Text>
                  )}
                </View>
              </View>
              <View className="mt-3" style={{ marginTop: 12 }}>
                <Text className="text-sm text-white/80">Risk Level</Text>
                {loadingProtocolData ? (
                  <Skeleton width={100} height={20} />
                ) : protocolData ? (
                  <View className="flex-row items-center">
                    <Text className="text-lg font-bold text-white">
                      {protocolData.risk}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-lg font-bold text-white">
                    {displayVault.risk}
                  </Text>
                )}
              </View>
            </LinearGradient>
          ) : isVaultProduct(displayVault) ? (
            <LinearGradient
              colors={
                (displayVault.gradientColors as [
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
                  {displayVault.name}
                </Text>
                <VaultLogo vaultName={displayVault.name} size={24} />
              </View>
              <View
                className="flex-row gap-4"
                style={{ flexDirection: 'row', gap: 16 }}
              >
                <View className="flex-1" style={{ flex: 1 }}>
                  <Text className="text-sm text-white/80">APY Rate</Text>
                  <Text className="text-lg font-bold text-white">
                    {displayVault.apy}
                  </Text>
                </View>
                <View className="flex-1" style={{ flex: 1 }}>
                  <Text className="text-sm text-white/80">Minimum</Text>
                  <Text className="text-lg font-bold text-white">
                    {displayVault.minimum}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          ) : null}

          {/* Restore original feature description */}
          <View className="mb-6">
            <Text className="text-base font-bold text-gray-900 mb-4">
              {isVaultFromStore
                ? 'Protocol Features:'
                : isTimeVault
                  ? 'Vault Features:'
                  : isSpecificVault
                    ? 'Protocol Features:'
                    : 'Key Features:'}
            </Text>
            {isVaultFromStore
              ? [
                  'Flexible access anytime',
                  'Auto-compounding rewards',
                  'Audited smart contracts',
                  '24/7 yield optimization',
                ].map((feature, index) => (
                  <View key={index} className="flex-row items-center mb-2">
                    <View className="w-2 h-2 rounded-full bg-green-500 mr-3" />
                    <Text className="text-sm text-gray-700">{feature}</Text>
                  </View>
                ))
              : isTimeVault
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
                  : isVaultProduct(displayVault)
                    ? displayVault.features.map((feature, index) => (
                        <View
                          key={index}
                          className="flex-row items-center mb-2"
                        >
                          <View className="w-2 h-2 rounded-full bg-purple-400 mr-3" />
                          <Text className="text-sm text-gray-700">
                            {feature}
                          </Text>
                        </View>
                      ))
                    : null}
          </View>

          {/* Balance and input area */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-gray-700">Wallet USDC Balance</Text>
              <View className="items-end">
                {isLoadingBalance ? (
                  <Skeleton width={80} height={20} />
                ) : (
                  <Text className="text-base font-semibold text-gray-900">
                    <AnimatedNumber
                      value={getWalletUSDCBalance()}
                      style={{
                        fontSize: 14,
                      }}
                      duration={1200}
                      formatOptions={{
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                        suffix: ' $',
                      }}
                    />
                  </Text>
                )}
              </View>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-gray-700">
                {isVaultFromStore && isVaultItem(displayVault)
                  ? `${displayVault.protocol.toUpperCase()} Deposited`
                  : isSpecificVault && isVaultOption(displayVault)
                    ? `${displayVault.name} Deposited`
                    : 'Deposited Amount'}
              </Text>
              <View className="items-end">
                {isLoadingBalance ? (
                  <Skeleton width={60} height={20} />
                ) : (
                  <Text className="text-base font-semibold text-gray-900">
                    {getProtocolDepositAmount().toFixed(2)} $
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Input field */}
          <View className="mb-4">
            <TextInput
              className="bg-white rounded-xl p-4 text-base border border-gray-200 text-gray-900"
              value={depositAmount}
              onChangeText={setDepositAmount}
              placeholder="Enter USDC amount"
              keyboardType="decimal-pad"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              className={`flex-1 bg-gray-100 rounded-2xl py-4 items-center ${
                isWithdrawing || isDepositing || isLoadingBalance
                  ? 'opacity-60'
                  : ''
              }`}
              onPress={handleWithdraw}
              disabled={isWithdrawing || isDepositing || isLoadingBalance}
            >
              {isWithdrawing ? (
                <ActivityIndicator size="small" color="#374151" />
              ) : (
                <Text className="text-base font-semibold text-gray-700">
                  Withdraw
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 bg-gray-900 rounded-2xl py-4 items-center ${
                isDepositing || isWithdrawing || isLoadingBalance
                  ? 'opacity-60'
                  : ''
              }`}
              onPress={handleDeposit}
              disabled={isDepositing || isWithdrawing || isLoadingBalance}
            >
              {isDepositing ? (
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
