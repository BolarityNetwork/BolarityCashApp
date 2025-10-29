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
  // Fetch vault categories from API
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

  // Handle loading state with skeleton
  if (isLoading) {
    return (
      <View className="px-6 mb-8 mt-4">
        <Text className="text-xl font-bold text-gray-900 mb-4">
          {t('home.savingsVaults')}
        </Text>
        <View className="gap-4">
          {/* Render 2 skeleton cards */}
          {[1, 2].map(index => (
            <View
              key={index}
              className="rounded-3xl p-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500"
            >
              <View className="bg-white rounded-[22px] p-5">
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-row items-center flex-1">
                    <Skeleton width={48} height={48} borderRadius={16} />
                    <View className="ml-3 flex-1">
                      <Skeleton width={120} height={16} borderRadius={8} />
                      <View className="mt-1">
                        <Skeleton width={200} height={14} borderRadius={7} />
                      </View>
                    </View>
                  </View>
                  <View className="items-end">
                    <Skeleton width={60} height={24} borderRadius={12} />
                    <View className="mt-0.5">
                      <Skeleton width={30} height={12} borderRadius={6} />
                    </View>
                  </View>
                </View>

                <View className="flex-row justify-between items-center">
                  <View className="flex-row gap-4 flex-1">
                    <View>
                      <Skeleton width={40} height={12} borderRadius={6} />
                      <View className="mt-1">
                        <Skeleton width={100} height={14} borderRadius={7} />
                      </View>
                    </View>
                  </View>
                  <Skeleton width={80} height={32} borderRadius={20} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <View className="px-6 mb-8 mt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-900">
            {t('home.savingsVaults')}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-red-500 px-3 py-1.5 rounded-2xl"
          >
            <Text className="text-xs text-white font-semibold">
              {t('home.retry')}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="items-center justify-center py-10">
          <Text className="text-sm text-red-500">
            {t('home.failedToLoadVaults')}
          </Text>
        </View>
      </View>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <View className="px-6 mb-8 mt-4">
        <Text className="text-xl font-bold text-gray-900 mb-4">
          {t('home.savingsVaults')}
        </Text>
        <View className="items-center justify-center py-10">
          <Text className="text-sm text-gray-500">
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
    <View className="px-6 mb-8 mt-4">
      <Text className="text-xl font-bold text-gray-900 mb-4">
        {t('home.savingsVaults')}
      </Text>
      <View className="gap-4">
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            className="rounded-3xl p-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500"
            onPress={() => {
              handleVaultPress(category);
            }}
          >
            <View className="bg-white rounded-[22px] p-5">
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center flex-1">
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
                    <VaultLogo
                      vaultName={getVaultIcon(category.id)}
                      size={24}
                    />
                  </LinearGradient>
                  <View>
                    <Text className="text-base font-bold text-gray-900">
                      {category.name}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {category.description}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-2xl font-bold text-emerald-600">
                    {category.apy}
                  </Text>
                  <Text className="text-xs text-gray-500">APY</Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <View className="flex-row gap-4 flex-1">
                  <View>
                    <Text className="text-xs text-gray-500">Type</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {category.id === 'flexi'
                        ? t('home.currentSavings')
                        : t('home.fixedTermSavings')}
                    </Text>
                  </View>
                </View>
                <View className="bg-gray-900 px-6 py-2 rounded-2xl">
                  <Text className="text-sm font-semibold text-white">
                    {t('home.deposit')}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default VaultList;
