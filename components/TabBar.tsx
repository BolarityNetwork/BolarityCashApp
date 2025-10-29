import React, { FC } from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNiceModal } from '@/hooks/useNiceModal';
import ActionModal from './modals/ActionModal';
import { ReceiveModal } from './modals/ReceiveModal';
import NiceModal from '@ebay/nice-modal-react';
import { TransferModal } from './modals/TransferModal/TransferModal';

export const TabBar: FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { t } = useTranslation();
  const routeNameArr = ['home', 'actions', 'profile'];
  const insets = useSafeAreaInsets();

  const receiveModal = useNiceModal(ReceiveModal);
  const transferModal = useNiceModal(TransferModal);

  const handleActionMenuOpen = () => {
    NiceModal.show(ActionModal, {
      onReceivePress: () => {
        receiveModal.open();
      },
      onTransferPress: () => {
        transferModal.open();
      },
    });
  };

  return (
    <>
      <View
        className="absolute left-0 right-0 bg-white rounded-3xl py-4 px-6 flex-row items-center justify-between shadow-lg border border-gray-200"
        style={{
          bottom: insets.bottom + 12,
          zIndex: 50,
          marginHorizontal: 24,
        }}
      >
        {routeNameArr.map(name => {
          const route = state.routes.find(item => item.name === name)!;
          const { options } = descriptors[route?.key || ''];
          const label = options?.title || route?.name;
          const isFocused = state.routes[state.index]?.name === name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route?.key || '',
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route?.name || '', route?.params || {});
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          if (route.name === 'actions') {
            return (
              <Pressable
                key={label}
                onPress={handleActionMenuOpen}
                className="items-center py-2 flex-1"
              >
                <View className="w-8 h-8 bg-black rounded-full items-center justify-center">
                  <Icon name="add" size={16} color="white" />
                </View>
                <Text className="text-xs mt-1 text-black font-semibold">
                  {t('navigation.actions')}
                </Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={label}
              onPress={onPress}
              onLongPress={onLongPress}
              className="items-center py-2"
              style={{ flex: route.name === 'actions' ? 0 : 1 }}
            >
              <View className="items-center">
                <Icon
                  name={
                    route.name === 'home' ? 'home-outline' : 'person-outline'
                  }
                  size={24}
                  color={isFocused ? '#000' : '#9CA3AF'}
                />
                <Text
                  className={`text-xs mt-1 ${
                    isFocused ? 'text-black font-semibold' : 'text-gray-400'
                  }`}
                >
                  {route.name === 'home'
                    ? t('navigation.home')
                    : t('navigation.profile')}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </>
  );
};
