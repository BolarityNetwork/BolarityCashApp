import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';
import SettingsIcon from '@/assets/icon/common/setting.svg';

interface ProfileHeaderProps {
  onSettingsPress: () => void;
}

export function ProfileHeader({ onSettingsPress }: ProfileHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={onSettingsPress}>
          <SettingsIcon />
        </TouchableOpacity>
      </View>
    </View>
  );
}
