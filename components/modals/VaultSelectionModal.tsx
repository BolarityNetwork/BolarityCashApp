// components/PerfectVaultSavingsPlatform/modals/VaultSelectionModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import VaultSkeleton from '../common/VaultSkeleton';
import { VaultItem, CategoryInfo, useVaultsByCategory } from '@/api/vault';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

interface VaultSelectionModalProps {
  visible: boolean;
  selectedCategory: CategoryInfo | null;
  onClose: () => void;
  onSelect: (vault: VaultItem) => void;
}

const VaultSelectionModal: React.FC<VaultSelectionModalProps> = ({
  visible,
  selectedCategory,
  onClose,
  onSelect,
}) => {
  const { t } = useTranslation();
  // Use the new API hook to fetch vaults by category
  const {
    data: vaults,
    isLoading,
    isError,
    refetch,
  } = useVaultsByCategory(
    selectedCategory?.id || 'flexi',
    visible && !!selectedCategory?.id
  );

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

    if (isError) {
      return (
        <View className="items-center justify-center py-10">
          <Text className="text-sm text-red-500 mb-4">
            {t('modals.failedToLoadVaults')}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-red-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">
              {t('modals.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!vaults || vaults.length === 0) {
      return (
        <View className="items-center justify-center py-10">
          <Text className="text-sm text-gray-500">
            {t('modals.noVaultsAvailable')}
          </Text>
        </View>
      );
    }

    // Show actual vault options
    return (
      <View className="gap-3">
        {vaults.map(vault => (
          <TouchableOpacity
            key={vault.id}
            className="bg-white rounded-2xl p-4 border border-gray-200"
            onPress={() => onSelect(vault)}
          >
            <View className="flex-row items-center mb-3">
              <Image
                source={vault.icon}
                style={{ width: 40, height: 40 }}
                contentFit="contain"
              />
              <View className="ml-3 flex-1 mr-20 items-start">
                <View className="flex-row items-center mb-1">
                  <Text className="text-base font-bold text-gray-900">
                    {vault.protocol.toUpperCase()}
                  </Text>
                </View>
                <Text
                  className="text-sm text-gray-500"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {vault.note}
                </Text>
              </View>
            </View>
            {/* APY information placed in the top right corner */}
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
            {selectedCategory
              ? `${selectedCategory.name} ${t('modals.vaults')}`
              : t('modals.chooseYourVault')}
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
            {selectedCategory
              ? `${t('modals.selectDefiProtocol')} ${selectedCategory.name} ${t('modals.startEarning')}`
              : t('modals.selectDefiStartEarning')}
          </Text>

          {renderVaultList()}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default VaultSelectionModal;
