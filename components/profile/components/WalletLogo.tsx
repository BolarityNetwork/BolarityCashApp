import React, { useState, useEffect } from 'react';
import { View, Text, Image } from 'react-native';

interface WalletLogoProps {
  type: 'ethereum' | 'solana';
  size?: number;
  style?: any;
}

const LOGOS = {
  ethereum: {
    src: require('@/assets/logos/ethereum.png'),
    fallback: '🔷',
  },
  solana: {
    src: require('@/assets/logos/solana.png'),
    fallback: '🌞',
  },
};

export function WalletLogo({ type, size = 32, style = {} }: WalletLogoProps) {
  const [failed, setFailed] = useState(false);
  const logo = LOGOS[type];

  useEffect(() => {
    setFailed(false);
  }, [type]);

  if (failed || !logo.src) {
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#f3f4f6',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#e5e7eb',
          },
          style,
        ]}
      >
        <Text style={{ fontSize: size * 0.6 }}>{logo.fallback}</Text>
      </View>
    );
  }

  return (
    <Image
      source={logo.src}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1,
          borderColor: '#e5e7eb',
        },
        style,
      ]}
      onError={() => setFailed(true)}
    />
  );
}
