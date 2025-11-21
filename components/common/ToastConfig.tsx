import React from 'react';
import { BlurView } from 'expo-blur';
import { Text, View } from 'react-native';
import { ToastConfig } from 'react-native-toast-message';
import ToastImportantCommon from '@/assets/icon/toast/toast-important-common.svg';
import ToastImportantSuccess from '@/assets/icon/toast/toast-important-success.svg';
import ToastImportantError from '@/assets/icon/toast/toast-important-error.svg';
import ToastSuccessWithBackground from '@/assets/icon/toast/toast-success-with-background.svg';
import ToastNormalError from '@/assets/icon/toast/toast-normal-error.svg';
import ToastNormalSuccess from '@/assets/icon/toast/toast-normal-success.svg';

export const toastConfig: ToastConfig = {
  TakoToastError: ({ text1 }) => (
    <View className="w-full mt-[12px] flex-row bg-[#E3446EE5] h-[60px] justify-center items-center">
      <ToastImportantError />
      <Text className="ml-1 text-white font-bold text-[14px]">{text1}</Text>
    </View>
  ),

  TakoToastSuccess: ({ text1 }) => (
    <View className="w-full mt-[12px] flex-row bg-[#CFE9E5E5] h-[60px] justify-center items-center">
      <ToastImportantSuccess />
      <Text className="ml-1 text-base-pri font-bold text-[14px]">{text1}</Text>
    </View>
  ),

  CommonToast: ({ text1 }) => {
    return (
      <View className="w-full mt-[12px]">
        <View className="shadow">
          <BlurView
            intensity={4}
            tint="default"
            style={{
              backgroundColor: '#000000E5',
            }}
            className="h-[52px] mx-2 px-2.5 overflow-hidden rounded-[20px] border border-white/20 backdrop-blur-[10px] justify-center items-center inline-flex flex-row"
            experimentalBlurMethod={'dimezisBlurView'}
          >
            <Text className="text-center text-white text-sm font-normal">
              {text1}
            </Text>
          </BlurView>
        </View>
      </View>
    );
  },
  TakoToastNormalError: ({ text1 }: any) => {
    return (
      <View className="w-full mt-[12px]">
        <View className="shadow">
          <BlurView
            intensity={4}
            tint="default"
            style={{
              backgroundColor: '#000000E5',
            }}
            className="h-[52px] mx-2 px-2.5 overflow-hidden rounded-[20px] border border-white/20 backdrop-blur-[10px] justify-center items-center inline-flex flex-row"
            experimentalBlurMethod={'dimezisBlurView'}
          >
            <ToastNormalError />
            <Text className="ml-[10px] text-white font-bold text-[14px]">
              {text1}
            </Text>
          </BlurView>
        </View>
      </View>
    );
  },

  TakoToastNormalSuccess: ({ text1 }: any) => {
    return (
      <View className="w-full mt-[12px]">
        <View className="shadow">
          <BlurView
            intensity={4}
            tint="default"
            style={{
              backgroundColor: '#000000E5',
            }}
            className="h-[52px] mx-2 px-2.5 overflow-hidden rounded-[20px] border border-white/20 backdrop-blur-[10px] justify-center items-center inline-flex flex-row"
            experimentalBlurMethod={'dimezisBlurView'}
          >
            <ToastNormalSuccess />
            <Text className="ml-[10px] text-white font-bold text-[14px]">
              {text1}
            </Text>
          </BlurView>
        </View>
      </View>
    );
  },

  TakoToastNormalSuccessCommon: ({ text1 }: any) => {
    return (
      <View className="w-full mt-[12px]">
        <View className="shadow">
          <BlurView
            intensity={4}
            tint="default"
            style={{
              backgroundColor: '#000000E5',
            }}
            className="h-[52px] mx-2 px-2.5 overflow-hidden rounded-[20px] border border-white/20 backdrop-blur-[10px] justify-center items-center inline-flex flex-row"
            experimentalBlurMethod={'dimezisBlurView'}
          >
            <ToastImportantCommon />
            <Text className="ml-[10px] text-white font-bold text-[14px]">
              {text1}
            </Text>
          </BlurView>
        </View>
      </View>
    );
  },
  TakoToastNormalInfo: ({ text1 }: any) => {
    return (
      <View className="w-full mt-[12px]">
        <View className="shadow">
          <BlurView
            intensity={4}
            tint="default"
            style={{
              backgroundColor: '#000000E5',
            }}
            className="h-[52px] mx-2 px-8 py-[14px] overflow-hidden rounded-[20px] border border-white/20 backdrop-blur-[10px] justify-center items-center inline-flex flex-row"
            experimentalBlurMethod={'dimezisBlurView'}
          >
            <Text className="text-white font-bold text-[14px]">{text1}</Text>
          </BlurView>
        </View>
      </View>
    );
  },
  TakoToastOperation: ({ text1 }: any) => {
    return (
      <View className="mt-[12px]">
        <View className="shadow-xl">
          <View
            style={{
              backgroundColor: '#000000E5',
            }}
            className="px-[10px] py-[9px] overflow-hidden rounded-[20px] justify-center items-center inline-flex flex-row"
          >
            <Text className="text-font-1 text-[14px]">{text1}</Text>
          </View>
        </View>
      </View>
    );
  },
  TakoToastCreateSuccessWithButton: ({ text1, text2 }) => {
    return (
      <View className="w-full mt-[12px]">
        <View className="shadow">
          <BlurView
            intensity={4}
            tint="default"
            style={{
              backgroundColor: '#000000E5',
            }}
            className="h-[62px] mx-2 px-3 overflow-hidden rounded-[20px] border border-white/20 backdrop-blur-[10px] justify-center items-center inline-flex flex-row"
            experimentalBlurMethod={'dimezisBlurView'}
          >
            <ToastSuccessWithBackground />

            <View className="ml-3 flex-1">
              <Text className="text-white text-sm font-semibold">{text1}</Text>
              <Text className="text-font-9 text-[13px] font-normal">
                {text2}
              </Text>
            </View>
            {/* <Pressable
              onPress={() => {
                router.replace({
                  pathname: '/(drawer)/(tabs)/home/follow',
                  params: {
                    isTabForceRender: 'true',
                    screen: 'follow',
                    isScrollToTop: 'true',
                  },
                });
              }}
              hitSlop={10}
            >
              <Text className="text-base-pri text-[13px] font-normal px-2.5">
                {t('toast.View')}
              </Text>
            </Pressable> */}
          </BlurView>
        </View>
      </View>
    );
  },
};
