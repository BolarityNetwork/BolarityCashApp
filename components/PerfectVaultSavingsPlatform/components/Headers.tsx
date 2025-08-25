// components/PerfectVaultSavingsPlatform/components/Header.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import IconComponent from './IconComponent';
import { bolarityLogo } from '../assets/logos';

interface HeaderProps {
  user: any;
  currentWalletInfo: {
    address: string | null;
    type: string;
    icon: string;
    network: string;
  };
  formatAddress: (address: string) => string;
}

const Header: React.FC<HeaderProps> = ({
  user,
  currentWalletInfo,
  formatAddress,
}) => {
  return (
    <View style={styles.headerContent}>
      <View style={styles.headerTop}>
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            {bolarityLogo ? (
              <Image source={bolarityLogo} style={styles.logoImage} />
            ) : (
              <IconComponent name="Vault" size={24} color="#fff" />
            )}
          </View>
          <View>
            <Text style={styles.appTitle}>Bolarity</Text>
            <Text style={styles.appSubtitle}>DeFi Yield Platform</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.notificationContainer}>
            <IconComponent name="Gift" size={24} color="#f59e0b" />
            <View style={styles.notificationDot} />
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User Info - 简化版本 */}
      {user && currentWalletInfo.address && (
        <View style={styles.userInfo}>
          <Text style={styles.userLabel}>Connected as</Text>
          <Text style={styles.userAddressSimple}>
            {formatAddress(currentWalletInfo.address)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#000',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  appSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    backgroundColor: '#ef4444',
    borderRadius: 6,
  },
  profileButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 18,
    color: '#6b7280',
  },
  userInfo: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  userLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  userAddressSimple: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'monospace',
    fontWeight: '500',
  },
});

export default Header;
