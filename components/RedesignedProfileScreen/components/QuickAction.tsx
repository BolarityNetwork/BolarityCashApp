import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { QuickActionProps } from '../types';

export const QuickAction: React.FC<QuickActionProps> = ({
  icon,
  text,
  onPress,
  backgroundColor = '#f0f9ff',
  disabled = false
}) => {
  return (
    <TouchableOpacity
      style={{
        width: '47%',
        backgroundColor: disabled ? '#f8fafc' : '#ffffff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        opacity: disabled ? 0.6 : 1,
      }}
      onPress={onPress}
      disabled={disabled}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: disabled ? '#e2e8f0' : backgroundColor,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 24 }}>{icon}</Text>
      </View>
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: disabled ? '#94a3b8' : '#475569',
        }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};