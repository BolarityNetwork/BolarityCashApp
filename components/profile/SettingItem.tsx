import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SettingItemProps {
  icon?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  disabled?: boolean;
}

export const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  disabled = false,
}) => {
  const ItemContent = (
    <View className="flex-row items-center py-4 px-5">
      {icon && (
        <View className="w-8 h-8 items-center justify-center mr-3">
          <Text className="text-lg">{icon}</Text>
        </View>
      )}
      <View className="flex-1">
        <Text className="text-base font-medium text-slate-800">{title}</Text>
        {subtitle && (
          <Text className="text-sm text-slate-500 mt-0.5">{subtitle}</Text>
        )}
      </View>
      {showChevron && onPress && (
        <Text className="text-slate-400 text-lg">›</Text>
      )}
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="bg-white border-b border-slate-100"
      >
        {ItemContent}
      </TouchableOpacity>
    );
  }

  return (
    <View className="bg-white border-b border-slate-100">{ItemContent}</View>
  );
};
