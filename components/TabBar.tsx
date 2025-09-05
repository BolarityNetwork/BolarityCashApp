import React, { FC } from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TabBar: FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { t: _t } = useTranslation();
  const routeNameArr = ['home', 'actions', 'profile'];

  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-base-FFF flex flex-row items-center justify-center border-t border-div-bg-E py-2"
      style={{
        paddingBottom: insets.bottom,
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
              onPress={onPress}
              onLongPress={onLongPress}
              className="flex-1 items-center justify-center mb-1"
            >
              <View>
                <Text>Actions</Text>
              </View>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={label}
            onPress={onPress}
            onLongPress={onLongPress}
            className="flex-1 items-center"
          >
            <View className="relative">
              <Text>{route.name}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};
