// components/PerfectVaultSavingsPlatform/components/IconComponent.tsx
import React from 'react';
import { Text } from 'react-native';

interface IconComponentProps {
  name: string;
  size?: number;
  color?: string;
}

const IconComponent: React.FC<IconComponentProps> = ({
  name,
  size = 24,
  color = '#000',
}) => {
  const icons: Record<string, string> = {
    Eye: '👁',
    EyeOff: '🙈',
    Vault: '🏛️',
    Clock: '⏰',
    Zap: '⚡',
    TrendingUp: '📈',
    ArrowUpRight: '↗️',
    Plus: '➕',
    DollarSign: '💵',
    Percent: '💹',
    Gift: '🎁',
    Star: '⭐',
    PiggyBank: '🐷',
    Home: '🏠',
    User: '👤',
    Grid3X3: '⚏',
    Notification: '🔔',
  };

  return <Text style={{ fontSize: size, color }}>{icons[name] || '⚫'}</Text>;
};

export default IconComponent;
