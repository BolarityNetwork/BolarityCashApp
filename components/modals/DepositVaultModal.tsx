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
import { useTranslation } from 'react-i18next';
import { TakoToast } from '@/components/common/TakoToast';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/components/common/ToastConfig';

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
  const { t } = useTranslation();
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
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
      TakoToast.show({
        type: 'normal',
        status: 'error',
        message: t('modals.pleaseEnterValidDepositAmount'),
      });
      return;
    }

    if (!selectedVault) {
      TakoToast.show({
        type: 'normal',
        status: 'error',
        message: t('modals.noVaultSelected'),
      });
      return;
    }

    // Check if vault is expired (APY is "n/a")
    if (selectedVault.apy === 'n/a' || selectedVault.apy === 'N/A') {
      TakoToast.show({
        type: 'important',
        status: 'error',
        message: t('modals.vaultExpired'),
      });
      return;
    }

    // Pendle requires minimum $0.01
    if (
      selectedVault.protocol.toLowerCase() === 'pendle' &&
      parseFloat(depositAmount) < 0.01
    ) {
      TakoToast.show({
        type: 'normal',
        status: 'error',
        message: t('modals.pendleMinimumDepositInfo'),
      });
      return;
    }

    setIsDepositing(true);

    try {
      const protocol = selectedVault.protocol.toLowerCase() as
        | 'aave'
        | 'compound'
        | 'pendle'
        | 'morpho';

      console.log(
        `💰 Depositing ${depositAmount} USDC to ${selectedVault.protocol}...`
      );

      const marketAddress =
        protocol === 'morpho' && selectedVault.market
          ? selectedVault.market
          : selectedVault.id;

      // Create vault market info for the selected protocol
      const vaultMarketInfo = createVaultMarketInfo(protocol, {
        assetAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
        marketAddress: marketAddress,
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
        TakoToast.show({
          type: 'important',
          status: 'success',
          message: `${t('modals.depositSuccessfulDetails')} ${depositAmount} USDC ${t('modals.toProtocol')} ${selectedVault.protocol}`,
        });
        setDepositAmount('');
        refetchBalance();
      } else {
        throw new Error(result.error || t('modals.depositFailed'));
      }
    } catch (err) {
      console.error('❌ Deposit error:', err);
      const errorMsg = getErrorMessage(err, t);
      TakoToast.show({
        type: 'important',
        status: 'error',
        message: errorMsg,
      });
    } finally {
      setIsDepositing(false);
    }
  }, [
    depositAmount,
    selectedVault,
    vaultDeposit,
    activeWallet?.address,
    refetchBalance,
    t,
  ]);

  // Handle withdraw
  const handleWithdraw = useCallback(async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      TakoToast.show({
        type: 'important',
        status: 'error',
        message: t('modals.pleaseEnterValidWithdrawAmount'),
      });
      return;
    }

    if (!selectedVault) {
      TakoToast.show({
        type: 'important',
        status: 'error',
        message: t('modals.noVaultSelected'),
      });
      return;
    }

    Alert.alert(
      t('modals.confirmWithdrawal'),
      `${t('modals.areYouSureWithdraw')} ${depositAmount} ${t('modals.withdrawUSDCCapital')} ${selectedVault.protocol}?`,
      [
        { text: t('modals.cancel'), style: 'cancel' },
        {
          text: t('modals.confirm'),
          onPress: async () => {
            setIsWithdrawing(true);

            try {
              const protocol = selectedVault.protocol.toLowerCase() as
                | 'aave'
                | 'compound'
                | 'pendle'
                | 'morpho';

              console.log(
                `💸 Withdrawing ${depositAmount} USDC from ${selectedVault.protocol}...`
              );

              // For Morpho, use market field as marketAddress (ERC-4626 vault address)
              // For other protocols, use id as marketAddress
              const marketAddress =
                protocol === 'morpho' && selectedVault.market
                  ? selectedVault.market
                  : selectedVault.id;

              // Create vault market info for the selected protocol
              const vaultMarketInfo = createVaultMarketInfo(protocol, {
                assetAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
                marketAddress: marketAddress,
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
                // Morpho uses ERC-4626 standard, no additional protocol-specific fields needed
              });

              const result = await vaultWithdraw(
                vaultMarketInfo,
                depositAmount,
                activeWallet?.address
              );

              if (result.success) {
                TakoToast.show({
                  type: 'important',
                  status: 'success',
                  message: `${t('modals.withdrawalSuccessfulDetails')} ${depositAmount} ${t('modals.withdrew')} ${selectedVault.protocol}`,
                });
                setDepositAmount('');
                refetchBalance();
              } else {
                throw new Error(result.error || t('modals.withdrawalFailed'));
              }
            } catch (err) {
              console.error('❌ Withdrawal error:', err);
              const errorMsg = getErrorMessage(err, t);
              TakoToast.show({
                type: 'important',
                status: 'error',
                message: errorMsg,
              });
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
    t,
  ]);

  if (!visible || !selectedVault) {
    return null;
  }
  console.log('selectedVault', selectedVault);

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
              {`${t('modals.openVault')} ${selectedVault.protocol.toUpperCase()} ${t('modals.vaultPlaceholder')}`}
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
                  <Text className="text-sm text-white/80">
                    {t('modals.apyRate')}
                  </Text>
                  <Text className="text-lg font-bold text-white">
                    {selectedVault.apy}
                  </Text>
                </View>
                <View className="flex-1" style={{ flex: 1 }}>
                  <Text className="text-sm text-white/80">
                    {t('modals.tvl')}
                  </Text>
                  <Text className="text-lg font-bold text-white">
                    {selectedVault.tvl}
                  </Text>
                </View>
              </View>
              <View className="mt-3" style={{ marginTop: 12 }}>
                <Text className="text-sm text-white/80">
                  {t('modals.riskLevel')}
                </Text>
                <Text className="text-lg font-bold text-white">
                  {selectedVault.risk}
                </Text>
              </View>
            </LinearGradient>

            {/* Features */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 mb-4">
                {t('modals.protocolFeatures')}
              </Text>
              {[
                t('modals.flexibleAccess'),
                t('modals.autoCompounding'),
                t('modals.auditedContracts'),
                t('modals.yieldOptimization'),
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
                  {t('modals.walletUSDCBalance')}
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
                  {`${selectedVault.protocol.toUpperCase()} ${t('modals.deposited')}`}
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
                placeholder={t('modals.enterUSDCAmount')}
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
                    {t('modals.withdraw')}
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
                    {t('modals.startSaving')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
      <Toast config={toastConfig} />
      <TakoToast.Component />
    </Modal>
  );
};

export default DepositVaultModal;
