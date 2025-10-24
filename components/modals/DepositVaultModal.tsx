import React, { useState, useCallback } from 'react';
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { VaultItem } from '@/api/vault';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';
import { useVaultOperations } from '@/hooks/useVaultOperations';
import { createVaultMarketInfo } from '@/services/VaultService';
import getErrorMessage from '@/utils/error';
import Skeleton from '@/components/common/Skeleton';
import {
  useUserBalances,
  getProtocolUSDCAmount,
  getWalletUSDCBalance as getWalletUSDC,
} from '@/api/account';
import AnimatedNumber from '../AnimatedNumber';
import { Image } from 'expo-image';

interface DepositVaultModalProps {
  visible: boolean;
  selectedVault: VaultItem | null;
  onClose: () => void;
}

const DepositVaultModal: React.FC<DepositVaultModalProps> = ({
  visible,
  selectedVault,
  onClose,
}) => {
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activeWallet } = useMultiChainWallet();

  const {
    data: balancesData,
    refetch: refetchBalance,
    isLoading: isLoadingBalance,
  } = useUserBalances(activeWallet?.address || '', !!activeWallet?.address);

  // Use vault operations for new architecture
  const { deposit: vaultDeposit, withdraw: vaultWithdraw } =
    useVaultOperations();

  const getProtocolDepositAmount = useCallback(() => {
    if (!selectedVault) return 0;
    const protocolName = selectedVault.protocol.toLowerCase();
    return getProtocolUSDCAmount(balancesData, protocolName);
  }, [balancesData, selectedVault]);

  const getWalletUSDCBalance = useCallback(() => {
    return getWalletUSDC(balancesData);
  }, [balancesData]);

  // Handle deposit
  const handleDeposit = useCallback(async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid deposit amount');
      return;
    }

    if (!selectedVault) {
      Alert.alert('Error', 'No vault selected');
      return;
    }

    // Pendle requires minimum $0.01
    if (
      selectedVault.protocol.toLowerCase() === 'pendle' &&
      parseFloat(depositAmount) < 0.01
    ) {
      Alert.alert('Error', 'Pendle requires minimum deposit of $0.01 USD');
      return;
    }

    setIsDepositing(true);
    setError(null);

    try {
      const protocol = selectedVault.protocol.toLowerCase() as
        | 'aave'
        | 'compound'
        | 'pendle';

      console.log(
        `💰 Depositing ${depositAmount} USDC to ${selectedVault.protocol}...`
      );

      // Create vault market info for the selected protocol
      const vaultMarketInfo = createVaultMarketInfo(protocol, {
        assetAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
        marketAddress: selectedVault.id,
        chainId: 8453, // Base
        network: 'base',
        decimals: 6,
        symbol: 'USDC',
        // Aave specific
        poolAddress:
          protocol === 'aave'
            ? '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5'
            : undefined,
        // Compound specific
        cometAddress:
          protocol === 'compound'
            ? '0xb125E6687d4313864e53df431d5425969c15Eb2F'
            : undefined,
        // Pendle specific
        ptAddress:
          protocol === 'pendle'
            ? '0x194b8fed256c02ef1036ed812cae0c659ee6f7fd' // PT USDe Dec 2025
            : undefined,
        ytAddress:
          protocol === 'pendle'
            ? '0x1490516d8391e4d0bcbd13b7a56b4fe4996478be' // YT USDe Dec 2025
            : undefined,
      });

      const result = await vaultDeposit(
        vaultMarketInfo,
        depositAmount,
        activeWallet?.address
      );

      if (result.success) {
        Alert.alert(
          'Deposit Successful',
          `Successfully deposited ${depositAmount} USDC to ${selectedVault.protocol}\nTransaction: ${result.txHash?.slice(0, 10)}...`,
          [
            {
              text: 'OK',
              onPress: () => {
                setDepositAmount('');
                refetchBalance();
              },
            },
          ]
        );
      } else {
        throw new Error(result.error || 'Deposit failed');
      }
    } catch (err) {
      console.error('❌ Deposit error:', err);
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      Alert.alert('Deposit Failed', errorMsg);
    } finally {
      setIsDepositing(false);
    }
  }, [
    depositAmount,
    selectedVault,
    vaultDeposit,
    activeWallet?.address,
    refetchBalance,
  ]);

  // Handle withdraw
  const handleWithdraw = useCallback(async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid withdrawal amount');
      return;
    }

    if (!selectedVault) {
      Alert.alert('Error', 'No vault selected');
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `Are you sure you want to withdraw ${depositAmount} USDC from ${selectedVault.protocol}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setIsWithdrawing(true);
            setError(null);

            try {
              const protocol = selectedVault.protocol.toLowerCase() as
                | 'aave'
                | 'compound'
                | 'pendle';

              console.log(
                `💸 Withdrawing ${depositAmount} USDC from ${selectedVault.protocol}...`
              );

              // Create vault market info for the selected protocol
              const vaultMarketInfo = createVaultMarketInfo(protocol, {
                assetAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
                marketAddress: selectedVault.id,
                chainId: 8453, // Base
                network: 'base',
                decimals: 6,
                symbol: 'USDC',
                // Aave specific
                poolAddress:
                  protocol === 'aave'
                    ? '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5'
                    : undefined,
                // Compound specific
                cometAddress:
                  protocol === 'compound'
                    ? '0xb125E6687d4313864e53df431d5425969c15Eb2F'
                    : undefined,
                // Pendle specific
                ptAddress:
                  protocol === 'pendle'
                    ? '0x194b8fed256c02ef1036ed812cae0c659ee6f7fd' // PT USDe Dec 2025
                    : undefined,
                ytAddress:
                  protocol === 'pendle'
                    ? '0x1490516d8391e4d0bcbd13b7a56b4fe4996478be' // YT USDe Dec 2025
                    : undefined,
              });

              const result = await vaultWithdraw(
                vaultMarketInfo,
                depositAmount,
                activeWallet?.address
              );

              if (result.success) {
                Alert.alert(
                  'Withdrawal Successful',
                  `Successfully withdrew ${depositAmount} USDC from ${selectedVault.protocol}\nTransaction: ${result.txHash?.slice(0, 10)}...`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        setDepositAmount('');
                        refetchBalance();
                      },
                    },
                  ]
                );
              } else {
                throw new Error(result.error || 'Withdrawal failed');
              }
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
    selectedVault,
    vaultWithdraw,
    activeWallet?.address,
    refetchBalance,
  ]);

  if (!visible || !selectedVault) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        className="flex-1 bg-gray-50"
      >
        <SafeAreaView className="flex-1">
          <View className="flex-row justify-between items-center p-5 bg-white border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">
              {`Open ${selectedVault.protocol.toUpperCase()} Vault`}
            </Text>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              onPress={onClose}
            >
              <Text className="text-xl text-gray-500">×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1 p-5"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 40 }}
          >
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

            {/* Vault Header */}
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
                <Image
                  source={selectedVault.icon}
                  style={{ width: 48, height: 48 }}
                  contentFit="contain"
                />
                <View
                  className="ml-3 flex-1"
                  style={{ marginLeft: 12, flex: 1 }}
                >
                  <Text className="text-xl font-bold text-white">
                    {selectedVault.protocol.toUpperCase()}
                  </Text>
                  <Text className="text-sm text-white/80">
                    {selectedVault.note}
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
                    {selectedVault.apy}
                  </Text>
                </View>
                <View className="flex-1" style={{ flex: 1 }}>
                  <Text className="text-sm text-white/80">TVL</Text>
                  <Text className="text-lg font-bold text-white">
                    {selectedVault.tvl}
                  </Text>
                </View>
              </View>
              <View className="mt-3" style={{ marginTop: 12 }}>
                <Text className="text-sm text-white/80">Risk Level</Text>
                <Text className="text-lg font-bold text-white">
                  {selectedVault.risk}
                </Text>
              </View>
            </LinearGradient>

            {/* Features */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 mb-4">
                Protocol Features:
              </Text>
              {[
                'Flexible access anytime',
                'Auto-compounding rewards',
                'Audited smart contracts',
                '24/7 yield optimization',
              ].map((feature, index) => (
                <View key={index} className="flex-row items-center mb-2">
                  <View className="w-2 h-2 rounded-full bg-green-500 mr-3" />
                  <Text className="text-sm text-gray-700">{feature}</Text>
                </View>
              ))}
            </View>

            {/* Balance and input area */}
            <View className="bg-gray-50 rounded-2xl p-4 mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-gray-700">
                  Wallet USDC Balance
                </Text>
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
                  {`${selectedVault.protocol.toUpperCase()} Deposited`}
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
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default DepositVaultModal;
