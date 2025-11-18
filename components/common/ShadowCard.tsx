import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';

interface ShadowCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
  /**
   * 阴影强度级别
   * - 'sm': 小阴影 (shadow-sm)
   * - 'md': 中等阴影 (shadow-md)
   * - 'lg': 大阴影 (shadow-lg)
   * - 'xl': 超大阴影 (shadow-xl)
   * - 'none': 无阴影
   */
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  /**
   * 是否显示边框
   */
  bordered?: boolean;
  /**
   * 圆角大小
   */
  borderRadius?: number;
  /**
   * 内边距
   */
  padding?: number;
}

export const ShadowCard: React.FC<ShadowCardProps> = ({
  children,
  style,
  className,
  shadow = 'md',
  bordered = true,
  borderRadius = 16,
  padding,
}) => {
  const shadowStyle = shadowStyles[shadow];
  const borderStyle = bordered ? styles.bordered : undefined;

  return (
    <View
      style={[
        styles.card,
        shadowStyle,
        borderStyle,
        {
          borderRadius,
          ...(padding !== undefined && { padding }),
        },
        style,
      ]}
      className={className}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
  },
  bordered: {
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
});

const shadowStyles = StyleSheet.create({
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    // box-shadow: 0px 4px 24px 0px #0000001A
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.102, // 1A in hex = 26/255 ≈ 0.102
    shadowRadius: 24,
    elevation: 8,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 10,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 12,
  },
  none: {},
});
