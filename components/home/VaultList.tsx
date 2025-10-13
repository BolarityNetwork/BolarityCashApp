// components/PerfectVaultSavingsPlatform/components/VaultList.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import VaultLogo from './VaultLogo';
import { CategoryInfo } from '@/api/vault';

interface VaultListProps {
  categories: CategoryInfo[];
  onVaultPress: (category: CategoryInfo) => void;
  onTestPress?: () => void;
}

const VaultList: React.FC<VaultListProps> = ({
  categories,
  onVaultPress,
  onTestPress,
}) => {
  const getGradientColors = (categoryId: string) => {
    switch (categoryId) {
      case 'flexi':
        return ['#10b981', '#06b6d4'];
      case 'time':
        return ['#8b5cf6', '#ec4899'];
      default:
        return ['#6b7280', '#9ca3af'];
    }
  };

  const getVaultIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'flexi':
        return 'FlexiVault';
      case 'time':
        return 'TimeVault Pro';
      default:
        return 'Vault';
    }
  };

  return (
    <View style={styles.vaultSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Savings Vaults</Text>
        <View style={styles.headerActions}>
          {onTestPress && (
            <TouchableOpacity onPress={onTestPress} style={styles.testButton}>
              <Text style={styles.testButtonText}>Test</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity>
            <Text style={styles.sectionAction}>Compare All</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.vaultList}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={styles.vaultCardBorder}
            onPress={() => onVaultPress(category)}
          >
            <View style={styles.vaultCard}>
              <View style={styles.vaultHeader}>
                <View style={styles.vaultInfo}>
                  <LinearGradient
                    colors={getGradientColors(category.id) as [string, string]}
                    style={styles.vaultIcon}
                  >
                    <VaultLogo
                      vaultName={getVaultIcon(category.id)}
                      size={24}
                    />
                  </LinearGradient>
                  <View>
                    <Text style={styles.vaultName}>{category.name}</Text>
                    <Text style={styles.vaultDescription}>
                      {category.description}
                    </Text>
                  </View>
                </View>
                <View style={styles.vaultApy}>
                  <Text style={styles.vaultApyText}>
                    {category.id === 'flexi' ? '6.29%' : '11.28%'}
                  </Text>
                  <Text style={styles.vaultApyLabel}>APY</Text>
                </View>
              </View>

              <View style={styles.vaultFooter}>
                <View style={styles.vaultDetails}>
                  <View>
                    <Text style={styles.vaultTypeLabel}>Type</Text>
                    <Text style={styles.vaultTypeValue}>
                      {category.id === 'flexi'
                        ? 'Current Savings'
                        : 'Fixed Term Savings'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.vaultMinLabel}>Minimum</Text>
                    <Text style={styles.vaultMinValue}>$10</Text>
                  </View>
                </View>
                <View style={styles.depositButton}>
                  <Text style={styles.depositButtonText}>Deposit</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  vaultSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  testButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  testButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  sectionAction: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  vaultList: {
    gap: 16,
  },
  vaultCardBorder: {
    borderRadius: 24,
    padding: 2,
    backgroundColor: 'linear-gradient(45deg, #10b981, #06b6d4, #8b5cf6)',
  },
  vaultCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
  },
  vaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  vaultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vaultIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vaultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  vaultDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  vaultApy: {
    alignItems: 'flex-end',
  },
  vaultApyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
  },
  vaultApyLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  vaultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vaultDetails: {
    flexDirection: 'row',
    gap: 16,
    flex: 1,
  },
  vaultTypeLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  vaultTypeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  vaultMinLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  vaultMinValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  depositButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  depositButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default VaultList;
