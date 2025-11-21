import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DashedLine } from '@/components/common/DashedLine';

interface SettingItemProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  disabled?: boolean;
  isLast?: boolean;
}

export const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  disabled = false,
  isLast = false,
}) => {
  const ItemContent = (
    <View className="flex-row items-center pl-[1px] pr-[6px] py-[14px]">
      {icon && <View className="items-center justify-center mr-3">{icon}</View>}
      <View className="flex-1">
        <Text className="text-sm text-black">{title}</Text>
        {subtitle && (
          <Text className="text-xs text-[#ACB3BE] mt-1">{subtitle}</Text>
        )}
      </View>
      {showChevron && onPress && (
        <Text className="text-[#DADADA] text-lg">›</Text>
      )}
    </View>
  );

  if (onPress && !disabled) {
    return (
      <>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          className="bg-white"
        >
          {ItemContent}
        </TouchableOpacity>
        {!isLast && <DashedLine />}
      </>
    );
  }

  return <View className="bg-white">{ItemContent}</View>;
};
