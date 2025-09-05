import React from 'react';
import { StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ViewProps } from 'react-native-svg/lib/typescript/fabric/utils';

export interface CommonSafeAreaViewProps extends ViewProps {
  isIncludeStatusBar?: boolean;
  isIncludeBottomBar?: boolean;
  className?: string;
  bottomClassName?: string;
}

export const CommonSafeAreaView = React.forwardRef<
  View,
  CommonSafeAreaViewProps
>(
  (
    {
      children,
      isIncludeStatusBar,
      isIncludeBottomBar,
      className,
      bottomClassName,
      ...props
    },
    ref
  ) => {
    const statusBarHeight = StatusBar.currentHeight || 0;
    const safeInsets = useSafeAreaInsets();
    return (
      <View
        ref={ref}
        {...props}
        className={className}
        style={{
          flex: 1,
          paddingTop: isIncludeStatusBar
            ? 0
            : safeInsets.top || statusBarHeight,
          paddingBottom:
            isIncludeBottomBar || bottomClassName ? 0 : safeInsets.bottom,
        }}
      >
        {!!children && children}
        {!!bottomClassName && (
          <View
            className={bottomClassName}
            style={{ height: safeInsets.bottom }}
          ></View>
        )}
      </View>
    );
  }
);

CommonSafeAreaView.displayName = 'CommonSafeAreaView';
