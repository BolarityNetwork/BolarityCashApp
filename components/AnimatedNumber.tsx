// components/AnimatedNumber.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Text, TextStyle } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  style?: TextStyle;
  duration?: number;
  formatOptions?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    prefix?: string;
    suffix?: string;
  };
  onAnimationComplete?: () => void;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  style,
  duration = 1000, // 动画持续时间（毫秒）
  formatOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    prefix: '$',
    suffix: '',
  },
  onAnimationComplete,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const startValueRef = useRef(value);
  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // 如果新值与当前显示值相同，不需要动画
    if (value === displayValue) {
      return;
    }

    startValueRef.current = displayValue;
    startTimeRef.current = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - (startTimeRef.current || now);
      const progress = Math.min(elapsed / duration, 1);

      // 使用 easeOutCubic 缓动函数让动画更自然
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const currentValue =
        startValueRef.current + (value - startValueRef.current) * easeProgress;

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // 动画完成
        setDisplayValue(value);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    // 清理函数
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, onAnimationComplete]);

  // 清理动画
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const formattedValue = displayValue.toLocaleString('en-US', {
    minimumFractionDigits: formatOptions.minimumFractionDigits,
    maximumFractionDigits: formatOptions.maximumFractionDigits,
  });

  return (
    <Text style={style}>
      {formatOptions.prefix}
      {formattedValue}
      {formatOptions.suffix}
    </Text>
  );
};

export default AnimatedNumber;
