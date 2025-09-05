import React, { FC, useState } from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActionButton from 'react-native-circular-action-menu';
import Icon from 'react-native-vector-icons/Ionicons';

export const TabBar: FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { t: _t } = useTranslation();
  const routeNameArr = ['home', 'actions', 'profile'];
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      {/* 全局蒙版 */}
      {isActionMenuOpen && (
        <View
          className="absolute inset-0 bg-black/30 z-40"
          style={{
            top: -insets.top,
            left: -insets.left,
            right: -insets.right,
            bottom: -insets.bottom,
          }}
        >
          <Pressable
            className="flex-1"
            onPress={() => setIsActionMenuOpen(false)}
          />
        </View>
      )}

      {/* TabBar */}
      <View
        className="absolute left-6 right-6 bg-white rounded-3xl py-4 px-6 flex-row items-center justify-between shadow-lg border border-gray-200"
        style={{
          bottom: insets.bottom + 12,
          zIndex: 50,
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
              <View key={label} className="items-center py-2 flex-1">
                <View className="w-7 h-7"></View>
                <View className="position-absolute bottom-2 -left-3 right-1/2">
                  <ActionButton
                    buttonColor="#000000"
                    onPress={() => setIsActionMenuOpen(!isActionMenuOpen)}
                    active={isActionMenuOpen}
                    size={32}
                    radius={60}
                    verticalOrientation="up"
                    style={{
                      position: 'relative',
                      zIndex: 1000,
                    }}
                  >
                    <ActionButton.Item
                      buttonColor="#F7813C"
                      title="Deposit"
                      onPress={() => {
                        console.log('Deposit pressed');
                        setIsActionMenuOpen(false);
                      }}
                    >
                      <Icon
                        name="arrow-down-circle"
                        style={{ fontSize: 20, height: 22, color: 'white' }}
                      />
                    </ActionButton.Item>
                    <ActionButton.Item
                      buttonColor="#55A180"
                      title="Withdraw"
                      onPress={() => {
                        console.log('Withdraw pressed');
                        setIsActionMenuOpen(false);
                      }}
                    >
                      <Icon
                        name="arrow-up-circle"
                        style={{ fontSize: 20, height: 22, color: 'white' }}
                      />
                    </ActionButton.Item>
                    <ActionButton.Item
                      buttonColor="#6675c0"
                      title="Swap"
                      onPress={() => {
                        console.log('Swap pressed');
                        setIsActionMenuOpen(false);
                      }}
                    >
                      <Icon
                        name="swap-horizontal"
                        style={{ fontSize: 20, height: 22, color: 'white' }}
                      />
                    </ActionButton.Item>
                    <ActionButton.Item
                      buttonColor="#E3446E"
                      title="Send"
                      onPress={() => {
                        console.log('Send pressed');
                        setIsActionMenuOpen(false);
                      }}
                    >
                      <Icon
                        name="send"
                        style={{ fontSize: 20, height: 22, color: 'white' }}
                      />
                    </ActionButton.Item>
                  </ActionButton>
                </View>

                <Text className="text-xs mt-1 text-black font-semibold">
                  Actions
                </Text>
              </View>
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
                  {route.name === 'home' ? 'Home' : 'Profile'}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </>
  );
};
