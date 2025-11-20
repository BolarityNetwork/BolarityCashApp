import React, { FC } from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNiceModal } from '@/hooks/useNiceModal';
import ActionModal from './modals/ActionModal';
import { ReceiveModal } from './modals/ReceiveModal';
import NiceModal from '@ebay/nice-modal-react';
import { TransferModal } from './modals/TransferModal/TransferModal';
import AddIcon from '@/assets/icon/nav/add.svg';
import ProfileIcon from '@/assets/icon/nav/profile.svg';
import HomeIcon from '@/assets/icon/nav/home.svg';
import HomeOffIcon from '@/assets/icon/nav/home_off.svg';
import ProfileOffIcon from '@/assets/icon/nav/profile_off.svg';

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
        className="absolute left-0 right-0 bg-white rounded-[300px] py-4 px-6 flex-row items-center justify-between"
        style={{
          bottom: insets.bottom + 12,
          zIndex: 50,
          marginHorizontal: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.102, // 1A in hex = 26/255 ≈ 0.102
          shadowRadius: 20,
          elevation: 8,
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
                  <AddIcon />
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
                {route.name === 'home' ? (
                  isFocused ? (
                    <HomeIcon />
                  ) : (
                    <HomeOffIcon />
                  )
                ) : route.name === 'profile' ? (
                  isFocused ? (
                    <ProfileIcon />
                  ) : (
                    <ProfileOffIcon />
                  )
                ) : null}
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
