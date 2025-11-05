import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';

export function ProfileHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
    </View>
  );
}
