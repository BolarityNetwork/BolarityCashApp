import React from 'react';
import { View, ViewStyle } from 'react-native';

interface DashedLineProps {
  /**
   * 虚线颜色
   */
  color?: string;
  /**
   * 虚线高度
   */
  height?: number;
  /**
   * 每个虚线段的宽度
   */
  dashWidth?: number;
  /**
   * 虚线之间的间距
   */
  gap?: number;
  /**
   * 容器样式
   */
  style?: ViewStyle;
  /**
   * 容器类名
   */
  className?: string;
}

export const DashedLine: React.FC<DashedLineProps> = ({
  color = '#DADADA',
  height = 1,
  dashWidth = 3,
  gap = 2,
  style,
  className,
}) => {
  // 计算需要多少个虚线段来填满屏幕宽度（使用一个较大的数字确保覆盖）
  const dashCount = 100;

  return (
    <View
      className={`flex-row items-center overflow-hidden ${className || ''}`}
      style={[{ height }, style]}
    >
      {Array.from({ length: dashCount }).map((_, i) => (
        <View
          key={i}
          style={{
            width: dashWidth,
            height,
            backgroundColor: color,
            marginRight: gap,
          }}
        />
      ))}
    </View>
  );
};
