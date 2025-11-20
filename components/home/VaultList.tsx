// components/PerfectVaultSavingsPlatform/components/VaultList.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import VaultLogo from './VaultLogo';
import { CategoryInfo, useVaultCategories } from '@/api/vault';
import Skeleton from '../common/Skeleton';
import { useTranslation } from 'react-i18next';

const VaultList: React.FC<{
  handleVaultPress: (category: CategoryInfo) => void;
}> = ({ handleVaultPress }) => {
  const { t } = useTranslation();
  const {
    data: categories,
    isLoading,
    isError,
    refetch,
  } = useVaultCategories();

  const getGradientColors = (categoryId: string) => {
    switch (categoryId) {
      case 'flexi':
        return ['#10b981', '#06b6d4'];
      case 'time':
        return ['#8b5cf6', '#ec4899'];
      default:
        return ['#6b7280', '#9ca3af'];
    }
  };

  if (isLoading) {
    return (
      <View className="px-[20] pt-[20] pb-[26]">
        <View className="flex-row justify-between items-center mb-[27]">
          <Text className="text-[18px] font-[600] text-black">
            {t('home.savingsVaults')}
          </Text>
          <Text className="text-[14px] font-[600] text-[#ACB3BF]">
            {t('common.all')}
          </Text>
        </View>
        <View className="gap-[30]">
          {[1, 2].map(index => (
            <View key={index}>
              <View className="flex-row justify-between items-start">
                <View className="flex-row items-start flex-1">
                  <Skeleton width={48} height={48} borderRadius={16} />
                  <View className="ml-3 flex-1">
                    <Skeleton width={120} height={16} borderRadius={8} />
                    <View className="mt-1">
                      <Skeleton width={200} height={14} borderRadius={7} />
                    </View>
                  </View>
                </View>
                <View className="items-end ml-4">
                  <Skeleton width={60} height={24} borderRadius={12} />
                  <View className="mt-0.5">
                    <Skeleton width={30} height={12} borderRadius={6} />
                  </View>
                </View>
              </View>
              <View className="flex-row justify-between items-center mt-[10]">
                <View className="flex-row gap-6">
                  <View>
                    <Text className="text-[12px] text-[#ACB3BF] mb-1">
                      Type
                    </Text>
                    <Skeleton width={80} height={16} borderRadius={8} />
                  </View>
                  <View>
                    <Text className="text-[12px] text-[#ACB3BF] mb-1">
                      Minimum
                    </Text>
                    <Skeleton width={40} height={16} borderRadius={8} />
                  </View>
                </View>
                <Skeleton width={80} height={32} borderRadius={6} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="px-[20] pt-[20] pb-[26]">
        <View className="flex-row justify-between items-center mb-[27]">
          <Text className="text-[18px] font-[600] text-black">
            {t('home.savingsVaults')}
          </Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text className="text-[14px] font-[600] text-[#ACB3BF]">
              {t('home.retry')}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="items-center justify-center py-10">
          <Text
            style={{
              fontSize: 14,
              lineHeight: 20,
              color: '#ef4444',
            }}
          >
            {t('home.failedToLoadVaults')}
          </Text>
        </View>
      </View>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <View className="px-[20] pt-[20] pb-[26]">
        <View className="flex-row justify-between items-center mb-[27]">
          <Text className="text-[18px] font-[600] text-black">
            {t('home.savingsVaults')}
          </Text>
          <Text className="text-[14px] font-[600] text-[#ACB3BF]">
            {t('common.all')}
          </Text>
        </View>
        <View className="items-center justify-center py-10">
          <Text
            style={{
              fontSize: 14,
              lineHeight: 20,
              color: '#ACB3BF',
            }}
          >
            {t('home.noVaultCategoriesAvailable')}
          </Text>
        </View>
      </View>
    );
  }

  const getVaultIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'flexi':
        return 'FlexiVault';
      case 'time':
        return 'TimeVault Pro';
      default:
        return 'Vault';
    }
  };

  return (
    <View className="px-[20] pt-[20] pb-[26]">
      <View className="flex-row justify-between items-center mb-[27]">
        <Text className="text-[18px] font-[600] text-black">
          {t('home.savingsVaults')}
        </Text>
        <TouchableOpacity>
          <Text className="text-[14px] font-[600] text-[#ACB3BF]">
            {t('common.all')}
          </Text>
        </TouchableOpacity>
      </View>
      <View className="gap-[30]">
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            onPress={() => {
              handleVaultPress(category);
            }}
            activeOpacity={0.7}
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-row items-start flex-1">
                <LinearGradient
                  colors={getGradientColors(category.id) as [string, string]}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <VaultLogo vaultName={getVaultIcon(category.id)} size={24} />
                </LinearGradient>
                <View className="flex-1">
                  <Text className="text-base font-[600] text-[#000000]">
                    {category.name}
                  </Text>
                  <Text className="text-sm text-[#ACB3BF]">
                    {category.description}
                  </Text>
                </View>
              </View>
              <View className="items-end ml-4">
                <Text className="text-[20px] font-[600] text-[#00C87F]">
                  {category.apy}
                </Text>
                <Text className="text-[12px] text-[#ACB3BF]">APY</Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center mt-[10]">
              <View className="flex-row gap-6">
                <View>
                  <Text className="text-[12px] text-[#ACB3BF] mb-1">Type</Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {category.id === 'flexi'
                      ? t('home.currentSavings')
                      : t('home.fixedTermSavings')}
                  </Text>
                </View>
                <View>
                  <Text className="text-[12px] text-[#ACB3BF] mb-1">
                    Minimum
                  </Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    $10
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                className="bg-gray-900 px-6 py-2 rounded-[6]"
                onPress={e => {
                  e.stopPropagation();
                  handleVaultPress(category);
                }}
              >
                <Text className="text-sm font-semibold text-white">
                  {t('home.deposit')}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default VaultList;
