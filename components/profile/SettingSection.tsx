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
    <View className="mx-5 mt-6">
      <Text className="text-sm font-medium text-slate-500 mb-3 px-1">
        {title}
      </Text>
      <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        {children}
      </View>
    </View>
  );
};
