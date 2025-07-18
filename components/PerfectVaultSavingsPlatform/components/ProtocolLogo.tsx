// components/PerfectVaultSavingsPlatform/components/ProtocolLogo.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { PROTOCOL_LOGOS, PROTOCOL_FALLBACK_ICONS } from '../assets/logos';

interface ProtocolLogoProps {
  protocol: string;
  size?: number;
  style?: any;
}

const ProtocolLogo: React.FC<ProtocolLogoProps> = ({ protocol, size = 32, style = {} }) => {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  const logoSrc = PROTOCOL_LOGOS[protocol];
  const fallbackLogo = PROTOCOL_FALLBACK_ICONS[protocol] || '📦';

  // 重置错误状态当protocol改变时
  useEffect(() => {
    setImageError(false);
    setLoading(true);
  }, [protocol]);

  // 如果没有logo文件或加载失败，显示emoji备用
  if (!logoSrc || imageError) {
    return (
      <View style={[
        styles.fallbackContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style
      ]}>
        <Text style={{ fontSize: size * 0.6 }}>
          {fallbackLogo}
        </Text>
      </View>
    );
  }

  return (
    <View style={[{ position: 'relative' }, style]}>
      {loading && (
        <View style={[
          styles.loadingPlaceholder,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          }
        ]} />
      )}
      <Image
        source={logoSrc}
        style={[
          styles.logo,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity: loading ? 0 : 1
          }
        ]}
        onLoad={() => setLoading(false)}
        onError={() => {
          setImageError(true);
          setLoading(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  loadingPlaceholder: {
    position: 'absolute',
    backgroundColor: '#e5e7eb',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  logo: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
  }
});

export default ProtocolLogo;