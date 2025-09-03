import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { styles } from './styles';

interface LoginButtonProps {
  icon: string;
  text: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

export function LoginButton({
  icon,
  text,
  onPress,
  disabled,
  loading,
  style,
}: LoginButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.primaryButton, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          <Text style={styles.primaryButtonIcon}>{icon}</Text>
          <Text style={styles.primaryButtonText}>{text}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
