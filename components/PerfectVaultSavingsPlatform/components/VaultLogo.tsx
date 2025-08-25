// components/PerfectVaultSavingsPlatform/components/VaultLogo.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { VAULT_LOGOS, VAULT_FALLBACK_ICONS } from '../assets/logos';

interface VaultLogoProps {
  vaultName: string;
  size?: number;
  style?: any;
}

const VaultLogo: React.FC<VaultLogoProps> = ({
  vaultName,
  size = 24,
  style = {},
}) => {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  const logoSrc = VAULT_LOGOS[vaultName];
  const fallbackIcon = VAULT_FALLBACK_ICONS[vaultName] || '💼';

  useEffect(() => {
    setImageError(false);
    setLoading(true);
  }, [vaultName]);

  if (!logoSrc || imageError) {
    return (
      <Text style={{ fontSize: size, color: '#fff' }}>{fallbackIcon}</Text>
    );
  }

  return (
    <View style={[{ position: 'relative' }, style]}>
      {loading && (
        <View
          style={[
            styles.loadingPlaceholder,
            {
              width: size,
              height: size,
              borderRadius: size / 8,
            },
          ]}
        />
      )}
      <Image
        source={logoSrc}
        style={[
          styles.logo,
          {
            width: size,
            height: size,
            opacity: loading ? 0 : 1,
          },
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
  loadingPlaceholder: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  logo: {
    tintColor: '#fff', // 🎯 关键：将黑色logo反转为白色
  },
});

export default VaultLogo;
