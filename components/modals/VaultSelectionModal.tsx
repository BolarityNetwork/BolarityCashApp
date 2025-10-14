// components/PerfectVaultSavingsPlatform/modals/VaultSelectionModal.tsx
import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import ProtocolLogo from '../home/ProtocolLogo';
import { useVaultData } from '@/hooks/useVaultData';
import VaultSkeleton from '../common/VaultSkeleton';
import { VaultItem } from '@/api/vault';

interface VaultSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (vault: VaultItem) => void;
}

const VaultSelectionModal: React.FC<VaultSelectionModalProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const { vaults, isLoading, loadVaultsByCategory } = useVaultData();

  useEffect(() => {
    if (visible) {
      // Load flexi vaults when modal opens
      loadVaultsByCategory('flexi');
    }
  }, [visible, loadVaultsByCategory]);

  const flexiVaults = vaults.flexi || [];

  const renderVaultList = () => {
    if (isLoading) {
      // Show skeleton loading
      return (
        <View className="gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <VaultSkeleton key={index} />
          ))}
        </View>
      );
    }

    // Show actual vault options
    return (
      <View className="gap-3">
        {flexiVaults.map(vault => (
          <TouchableOpacity
            key={vault.id}
            className="bg-white rounded-2xl p-4 border border-gray-200"
            onPress={() => onSelect(vault)}
          >
            <View className="flex-row items-center mb-3">
              <ProtocolLogo protocol={vault.protocol} size={40} />
              <View className="ml-3 flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-base font-bold text-gray-900">
                    {vault.protocol.toUpperCase()}
                  </Text>
                  <View className="bg-green-500 px-1.5 py-0.5 rounded ml-2">
                    <Text className="text-xs text-white font-bold">LIVE</Text>
                  </View>
                </View>
                <Text className="text-sm text-gray-500">{vault.note}</Text>
              </View>
            </View>
            <View className="absolute top-4 right-4 items-end">
              <Text className="text-lg font-bold text-green-600">
                {vault.apy}
              </Text>
              <Text className="text-xs text-gray-500">APY</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">TVL: {vault.tvl}</Text>
              <Text className="text-sm text-gray-500">Risk: {vault.risk}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

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
            Choose Your Vault
          </Text>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            onPress={onClose}
          >
            <Text className="text-xl text-gray-500">×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-5">
          <Text className="text-base text-gray-500 mb-6">
            Select a DeFi protocol to start earning with Bolarity FlexiVault
          </Text>

          {renderVaultList()}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default VaultSelectionModal;
