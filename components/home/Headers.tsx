// components/PerfectVaultSavingsPlatform/components/Header.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import IconComponent from '@/components/home/IconComponent';
import bolarityLogo from '@/assets/images/icon.png';
import { router } from 'expo-router';

interface HeaderProps {
  user: any;
  currentWalletInfo: {
    address: string | null;
    type: string;
    icon: string;
    network: string;
  };
  formatAddress: (address: string) => string;
}

const Header: React.FC<HeaderProps> = ({
  user,
  currentWalletInfo,
  formatAddress,
}) => {
  return (
    <View className="px-5 pt-3 pb-1.5">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-black rounded-2xl items-center justify-center mr-3 overflow-hidden">
            {bolarityLogo ? (
              <Image
                source={bolarityLogo}
                className="w-12 h-12"
                resizeMode="cover"
              />
            ) : (
              <IconComponent name="Vault" size={24} color="#fff" />
            )}
          </View>
          <View>
            <Text className="text-xl font-bold text-gray-900">Bolarity</Text>
            <Text className="text-sm text-gray-500">DeFi Yield Platform</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-4">
          <View className="relative">
            <IconComponent name="Notification" size={24} color="#f59e0b" />
          </View>
          <TouchableOpacity
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            onPress={() => {
              router.push('/profile');
            }}
          >
            <Text className="text-lg text-gray-500">👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User Info - 简化版本 */}
      {user && currentWalletInfo.address && (
        <View className="mb-2 px-1">
          <Text className="text-xs text-gray-500 mb-0.5">Connected as</Text>
          <Text className="text-sm text-gray-900 font-mono font-medium">
            {formatAddress(currentWalletInfo.address)}
          </Text>
        </View>
      )}
    </View>
  );
};

export default Header;
