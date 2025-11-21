import React from 'react';
import { View, Text } from 'react-native';

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

export const SettingSection: React.FC<SettingSectionProps> = ({
  title,
  children,
}) => {
  return (
    <View className="pt-5 pb-[10px] px-5">
      <Text className="text-[18px] font-[600] leading-[26px] text-black mb-[3px]">
        {title}
      </Text>
      {children}
    </View>
  );
};
