import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './styles';

interface OAuthButtonProps {
  provider: {
    name: string;
    label: string;
    colors: readonly [string, string];
    icon: string;
  };
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  isLast?: boolean;
}

export function OAuthButton({
  provider,
  onPress,
  disabled,
  loading,
  isLast,
}: OAuthButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.oauthButton, { marginBottom: isLast ? 0 : 12 }]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <LinearGradient
        colors={provider.colors}
        style={styles.oauthGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.oauthIcon}>{provider.icon}</Text>
        <Text style={styles.oauthText}>{provider.label}</Text>
        {loading && <ActivityIndicator color="#fff" size="small" />}
      </LinearGradient>
    </TouchableOpacity>
  );
}
