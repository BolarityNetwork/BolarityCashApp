import React, { FC } from 'react';
import LottieView from 'lottie-react-native';
import { ViewStyle } from 'react-native';

import animation from '@/assets/icon/loading-animation.json';

export const UniversalLoadingFallback: FC<{ style?: ViewStyle }> = ({
  style,
}) => {
  return (
    <LottieView
      source={animation}
      style={style ?? { width: 72, height: 72 }}
      autoPlay
      loop
    />
  );
};
