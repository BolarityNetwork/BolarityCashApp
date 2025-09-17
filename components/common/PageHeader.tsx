import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import BackBlack from '@/assets/icon/nav/back-black.svg';
import BackWhite from '@/assets/icon/nav/back-white.svg';

interface PageHeaderProps {
  title?: string;
  className?: string;
  leftClassName?: string;
  backStyleType?: 1 | 2;
  style?: StyleProp<ViewStyle>;
  hasBackButton?: boolean;
  backFunc?: () => void;
  renderContent?: () => React.ReactNode;
  renderRight?: () => React.ReactNode;
  renderLeft?: () => React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  className,
  leftClassName,
  backStyleType = 1,
  hasBackButton = true,
  backFunc,
  renderContent,
  renderRight,
  renderLeft,
  style,
}) => {
  const router = useRouter();

  const handleBackPress = () => {
    if (backFunc) {
      backFunc();
    } else {
      router.back();
    }
  };

  const BackButton = () => {
    if (backStyleType === 1) {
      return (
        <View
          className="w-10 h-10 items-center justify-center mr-3"
          onTouchEnd={handleBackPress}
        >
          <BackBlack />
        </View>
      );
    } else {
      return (
        <View
          className="w-8 h-8 items-center justify-center mr-3"
          onTouchEnd={handleBackPress}
        >
          <BackWhite />
        </View>
      );
    }
  };

  return (
    <View
      className={`flex-row items-center h-11 px-[14px] justify-between pt-15 bg-white ${className || ''}`}
      style={style}
    >
      <View className={`flex-row h-full items-center ${leftClassName || ''}`}>
        {hasBackButton && <BackButton />}
        {renderLeft && renderLeft()}
      </View>

      {title && (
        <View
          pointerEvents="none"
          className="items-center justify-center absolute top-15 left-[14px] h-11 w-full"
        >
          <Text className="text-center text-gray-900 text-[17px] font-normal">
            {title}
          </Text>
        </View>
      )}

      {renderContent && renderContent()}
      {renderRight && renderRight()}
    </View>
  );
};
