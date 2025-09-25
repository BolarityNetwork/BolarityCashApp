import React from 'react';
import { Image } from 'react-native';

interface WalletLogoProps {
  type: 'ethereum' | 'solana';
  size?: number;
  style?: any;
}

const LOGOS = {
  ethereum: {
    src: require('@/assets/logos/ethereum.png'),
  },
  solana: {
    src: require('@/assets/logos/solana.png'),
  },
};

export function WalletLogo({ type, size = 32, style = {} }: WalletLogoProps) {
  const logo = LOGOS[type];

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
    />
  );
}
