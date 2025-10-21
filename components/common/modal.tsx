import React, {
  forwardRef,
  PropsWithChildren,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useBackHandler } from '@react-native-community/hooks';
import { BlurView } from 'expo-blur';
import {
  Animated,
  Dimensions,
  Keyboard,
  Platform,
  Pressable,
  View,
  ViewProps,
} from 'react-native';

interface ModalProps {
  boxClassName?: string;
  contentClassName?: string;
  blurColor?: string;
  open?: boolean;
  hasBlurBg?: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  animationType?: 'none' | 'fade' | 'slide';
}
const DurationTime = 300;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface CommonModalRef extends ViewProps {
  onClose: (isCancel?: boolean) => void;
}

export const CommonModal = forwardRef<
  CommonModalRef,
  PropsWithChildren<ModalProps>
>((props, ref) => {
  const {
    onClose: _onClose,
    onCancel: _onCancel,
    contentClassName,
    children,
    animationType = 'fade',
    blurColor,
    hasBlurBg = true,
    boxClassName,
  } = props;
  const screenHeight = Dimensions.get('window').height;
  const contentRef = useRef<View>(null);
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(screenHeight));
  const fadeIn = () => {
    Keyboard.dismiss();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: DurationTime,
      useNativeDriver: false,
    }).start();
  };
  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: DurationTime,
      useNativeDriver: false,
    }).start();
  };
  useImperativeHandle(ref, () => ({
    onClose,
  }));
  const slideIn = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: DurationTime,
      useNativeDriver: false,
    }).start();
  };
  const slideOut = () => {
    Animated.timing(slideAnim, {
      toValue: screenHeight,
      duration: DurationTime,
      useNativeDriver: false,
    }).start();
  };

  const onClose = (isCancel?: boolean) => {
    fadeOut();
    slideOut();
    setTimeout(() => {
      if (!isCancel) {
        _onClose?.();
      } else {
        _onCancel?.();
      }
    }, DurationTime);
  };

  useBackHandler(() => {
    if ((fadeAnim as any)._value) {
      onClose();
      return true;
    }
    return false;
  });

  useEffect(() => {
    fadeIn();
    slideIn();
  }, []);

  return (
    <View className={`w-full h-full absolute left-0 z-[999] ${boxClassName}`}>
      <AnimatedPressable
        className={
          'h-full w-full items-center justify-center absolute left-0 top-0'
        }
        style={{
          opacity: fadeAnim,
        }}
        onPress={() => {
          onClose(!!_onCancel);
        }}
      >
        {hasBlurBg && (
          <BlurView
            intensity={20}
            tint="default"
            style={{
              flex: 1,
              position: 'absolute',
              top: 0,
              height: '100%',
              width: '100%',
              backgroundColor: blurColor ? blurColor : '#00000099',
            }}
            experimentalBlurMethod={
              Platform.OS === 'ios' ? 'dimezisBlurView' : 'none'
            }
          ></BlurView>
        )}
      </AnimatedPressable>
      <Animated.View
        pointerEvents="box-none"
        ref={contentRef}
        className={`w-full h-full bg-transparent ${contentClassName}`}
        style={{
          height: '100%',
          width: '100%',
          opacity: animationType === 'fade' ? fadeAnim : 1,
          transform:
            animationType === 'slide' ? [{ translateY: slideAnim }] : undefined,
        }}
      >
        {children}
      </Animated.View>
    </View>
  );
});

CommonModal.displayName = 'CommonModal';
