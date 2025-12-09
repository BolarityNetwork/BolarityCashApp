import { EventEmitter } from 'events';
import React, { useEffect, useState } from 'react';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { Animated, Dimensions, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

import StatesSuccess from '@/assets/icon/toast/states-success.svg';
import ToastImportantCommon from '@/assets/icon/toast/toast-important-common.svg';
import ToastImportantError from '@/assets/icon/toast/toast-important-error.svg';

type ToastStatus = 'success' | 'error' | 'successCommon' | 'info' | 'loading';
type ToastType =
  | 'important' // Important feedback, custom implementation, centered display
  | 'normal' // Normal feedback, using react-native-toast-message
  | 'weak' // Weak feedback, custom implementation, centered display
  | 'operation' // Operation tips, using react-native-toast-message with special style
  | 'successWithButton'
  | 'growthBubble'
  | 'loading';

interface TakoToastParams {
  type: ToastType;
  status: ToastStatus;
  message: string;
  tips?: string;
  duration?: number;
  icon?: React.ReactNode;
  autoHide?: boolean;
}

const emitter = new EventEmitter();

export const TakoToast = {
  show: ({ ...params }: TakoToastParams) => {
    if (
      params.type === 'important' ||
      params.type === 'weak' ||
      params.type === 'growthBubble' ||
      params.type === 'loading'
    ) {
      emitter.emit('show', {
        message: params.message,
        duration: params.duration || 2000,
        autoHide: params.autoHide,
        type: params.type,
        status: params.status,
        icon: params.icon,
      });
    } else {
      let toastType = 'TakoToastNormalInfo';
      switch (true) {
        case params.type === 'successWithButton':
          toastType = 'TakoToastCreateSuccessWithButton';
          break;
        case params.type === 'operation':
          toastType = 'TakoToastOperation';
          break;
        case params.status === 'success':
          toastType = 'TakoToastNormalSuccess';
          break;
        case params.status === 'error':
          toastType = 'TakoToastNormalError';
          break;
        case params.status === 'successCommon':
          toastType = 'TakoToastNormalSuccessCommon';
          break;
        default:
          toastType = 'TakoToastNormalInfo';
          break;
      }
      Toast.show({
        ...params,
        text1: params.message,
        text2: params.tips,
        visibilityTime: params.duration || 3000,
        type: toastType,
      });
    }
  },

  hide: (isCastomToast = false) => {
    if (isCastomToast) {
      emitter.emit('hide');
    } else {
      Toast.hide();
    }
  },

  Component: () => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<ToastType>('important');
    const [icon, setIcon] = useState<React.ReactNode>();
    const [toastStatus, setToastStatus] = useState<ToastStatus>('success');
    const [windowHeight, setWindowHeight] = useState(
      Dimensions.get('window').height
    );
    const opacity = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const updateDimensions = () => {
        setWindowHeight(Dimensions.get('window').height);
      };
      const subscription = Dimensions.addEventListener(
        'change',
        updateDimensions
      );
      return () => {
        subscription.remove();
      };
    }, []);

    useEffect(() => {
      const handleShow = ({
        message,
        duration = 2000,
        type: toastType = 'important',
        status: toastStatus = 'success',
        icon: toastIcon,
        autoHide = true,
      }: TakoToastParams) => {
        setMessage(message);
        setType(toastType);
        setIcon(toastIcon);
        setVisible(true);
        setToastStatus(toastStatus);

        Animated.timing(opacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }).start();

        if (autoHide) {
          setTimeout(() => {
            Animated.timing(opacity, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }).start(() => {
              setVisible(false);
            });
          }, duration);
        }
      };

      const handleHide = () => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }).start(() => {
          setVisible(false);
        });
      };

      emitter.on('show', handleShow);
      emitter.on('hide', handleHide);

      return () => {
        emitter.off('show', handleShow);
        emitter.off('hide', handleHide);
      };
    }, []);

    const renderContent = () => {
      switch (type) {
        case 'important':
          return (
            <BlurView intensity={4} className="overflow-hidden rounded-[16px]">
              <View className="px-6 py-6 items-center justify-center bg-custom-toast-bg-1">
                {icon ||
                  (toastStatus === 'success' ? (
                    <StatesSuccess />
                  ) : toastStatus === 'error' ? (
                    <ToastImportantError />
                  ) : (
                    <ToastImportantCommon />
                  ))}
                <Text className="max-w-[148px] mt-4 text-white font-medium text-[14px] text-center">
                  {message}
                </Text>
              </View>
            </BlurView>
          );
        case 'growthBubble':
          return (
            <BlurView intensity={4} className="overflow-hidden rounded-[16px]">
              <View className="px-6 py-6 items-center justify-center bg-custom-toast-bg-1">
                <Image
                  source={StatesSuccess}
                  style={{ width: 40, height: 40 }}
                />
                <View className="mt-4">
                  <Text className="min-w-[114px] text-center px-[10] text-white text-sm font-normal">
                    Value:{' '}
                    <Text className="text-base-pri font-bold">{message}</Text>
                  </Text>
                </View>
              </View>
            </BlurView>
          );
        case 'weak':
          return (
            <BlurView intensity={4} className="overflow-hidden rounded-[16px]">
              <View className="px-[9.5px] py-[10px] flex-row items-center justify-center bg-custom-toast-bg-weak">
                {icon}
                <Text
                  className={`${icon ? 'ml-1' : ''} max-w-[208px] text-white text-[13px]`}
                >
                  {message}
                </Text>
              </View>
            </BlurView>
          );
        case 'loading':
          return (
            <BlurView intensity={4} className="overflow-hidden rounded-[16px]">
              <View className="px-12 pt-5 pb-6 items-center justify-center bg-custom-toast-bg-1">
                <StatesSuccess style={{ width: 52, height: 52 }} />
                <Text className="text-white text-sm font-normal mt-3">
                  {message}
                </Text>
              </View>
            </BlurView>
          );

        default:
          return null;
      }
    };

    if (!visible) return null;

    return (
      <View className="absolute left-0 right-0 justify-center items-center pointer-events-none z-[99999]">
        <Animated.View
          style={{
            opacity,
            position: 'absolute',
            top: windowHeight * 0.4,
          }}
        >
          {renderContent()}
        </Animated.View>
      </View>
    );
  },
};
