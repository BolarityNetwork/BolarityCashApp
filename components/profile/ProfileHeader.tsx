import React from 'react';
import { View, Text, Image } from 'react-native';
import bolarityLogo from '@/assets/images/icon.png';

export function ProfileHeader() {
  return (
    <View className="px-5 pb-[10px]">
      <View className="flex-row items-center">
        <Image
          source={bolarityLogo}
          className="w-12 h-12 rounded-full"
          resizeMode="cover"
        />
        <Text className="text-[20px] font-[600] leading-[28px] text-[#1E293B] ml-2">
          Bolarity
        </Text>
      </View>
    </View>
  );
}
