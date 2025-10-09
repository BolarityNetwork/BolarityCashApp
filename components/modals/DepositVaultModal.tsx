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
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';
import { useProtocolService } from '@/services/protocolService';
import getErrorMessage from '@/utils/error';
import Skeleton from '@/components/common/Skeleton';
import { ProtocolInfo } from '@/services/protocols/types';
import { useCompoundWallet } from '@/hooks/useCompoundWallet';
import { CHAIN_IDS } from '@/utils/blockchain/chainIds';

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
  const [protocolData, setProtocolData] = useState<ProtocolInfo | null>(null);
  const [loadingProtocolData, setLoadingProtocolData] = useState(false);

  const { activeWallet } = useMultiChainWallet();

  const { getProtocolInfo } = useProtocolService();

  // Compound Hook
  const {
    isLoading: compoundLoading,
    error: compoundError,
    supply,
    withdraw,
    clearError: clearCompoundError,
  } = useCompoundWallet(CHAIN_IDS.BASE);

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
  }, [selectedSpecificVault, getProtocolInfo]);

  // Load live protocol data
  useEffect(() => {
    if (visible && selectedSpecificVault) {
      console.log('🎯 Modal opened, loading live protocol data...');
      loadLiveProtocolData();
    }
  }, [visible, selectedSpecificVault, loadLiveProtocolData]);

  // Handle deposit
  const handleDeposit = useCallback(async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid deposit amount');
      return;
    }

    setIsLoading(true);
    try {
      console.log(`💰 Depositing ${depositAmount} USDC...`);

      // Deposit to Compound
      const txHash = await supply({
        asset: 'USDC',
        amount: depositAmount,
      });

      Alert.alert(
        'Deposit Successful',
        `Successfully deposited ${depositAmount} USDC\nTransaction: ${txHash.slice(0, 10)}...`,
        [
          {
            text: 'OK',
            onPress: () => {
              setDepositAmount('');
              // Reload protocol data
              loadLiveProtocolData();
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Deposit error:', error);
      Alert.alert('Deposit Failed', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [depositAmount, supply, loadLiveProtocolData]);

  // Handle withdraw
  const handleWithdraw = useCallback(async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid withdrawal amount');
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

              // Withdraw from Compound
              const txHash = await withdraw({
                asset: 'USDC',
                amount: depositAmount,
              });

              Alert.alert(
                'Withdrawal Successful',
                `Successfully withdrew ${depositAmount} USDC\nTransaction: ${txHash.slice(0, 10)}...`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setDepositAmount('');
                      // Reload protocol data
                      loadLiveProtocolData();
                    },
                  },
                ]
              );
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
  }, [depositAmount, withdraw, loadLiveProtocolData]);

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
          {/* Compound Error Display */}
          {compoundError && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <Text className="text-red-700 text-sm font-medium mb-1">
                Transaction Error
              </Text>
              <Text className="text-red-600 text-xs">{compoundError}</Text>
              <TouchableOpacity
                onPress={clearCompoundError}
                className="mt-2 self-start"
              >
                <Text className="text-red-600 text-xs font-semibold">
                  Dismiss
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Vault Header - Keep original style */}
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
                    {protocolData?.description || displayVault?.description}
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
                      {displayVault?.apy}
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
                      {(displayVault as VaultOption).tvl}
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

          {/* Restore original feature description */}
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

          {/* Balance and input area */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-gray-700">Wallet Balance</Text>
              <View className="items-end">
                <Text className="text-base font-semibold text-gray-900">
                  $0.00
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-gray-700">
                {isSpecificVault
                  ? `${displayVault?.name} Deposit Amount`
                  : 'Deposit Amount'}
              </Text>
              <View className="items-end">
                {loadingProtocolData ? (
                  <Skeleton width={60} height={20} />
                ) : protocolData ? (
                  <Text className="text-base font-semibold text-gray-900">
                    ${protocolData.balance.toFixed(2)}
                  </Text>
                ) : (
                  <Text className="text-base font-semibold text-gray-900">
                    $0.00
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
                isLoading || compoundLoading ? 'opacity-60' : ''
              }`}
              onPress={handleWithdraw}
              disabled={isLoading || compoundLoading}
            >
              {isLoading || compoundLoading ? (
                <ActivityIndicator size="small" color="#374151" />
              ) : (
                <Text className="text-base font-semibold text-gray-700">
                  Withdraw
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 bg-gray-900 rounded-2xl py-4 items-center ${
                isLoading || compoundLoading ? 'opacity-60' : ''
              }`}
              onPress={handleDeposit}
              disabled={isLoading || compoundLoading}
            >
              {isLoading || compoundLoading ? (
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
