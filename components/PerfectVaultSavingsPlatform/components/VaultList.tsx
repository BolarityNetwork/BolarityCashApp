// components/PerfectVaultSavingsPlatform/components/VaultList.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import VaultLogo from './VaultLogo';
import { VaultProduct } from '../constants';

interface VaultListProps {
  vaultProducts: VaultProduct[];
  onVaultPress: (vault: VaultProduct) => void;
}

const VaultList: React.FC<VaultListProps> = ({
  vaultProducts,
  onVaultPress,
}) => {
  return (
    <View style={styles.vaultSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Savings Vaults</Text>
        <TouchableOpacity>
          <Text style={styles.sectionAction}>Compare All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.vaultList}>
        {vaultProducts.map((vault, index) => (
          <TouchableOpacity
            key={index}
            style={styles.vaultCardBorder}
            onPress={() => onVaultPress(vault)}
          >
            <View style={styles.vaultCard}>
              <View style={styles.vaultHeader}>
                <View style={styles.vaultInfo}>
                  <LinearGradient
                    colors={vault.gradientColors}
                    style={styles.vaultIcon}
                  >
                    <VaultLogo vaultName={vault.name} size={24} />
                  </LinearGradient>
                  <View>
                    <Text style={styles.vaultName}>{vault.name}</Text>
                    <Text style={styles.vaultDescription}>
                      {vault.description}
                    </Text>
                  </View>
                </View>
                <View style={styles.vaultApy}>
                  <Text style={styles.vaultApyText}>{vault.apy}</Text>
                  <Text style={styles.vaultApyLabel}>APY</Text>
                </View>
              </View>

              <View style={styles.vaultFooter}>
                <View style={styles.vaultDetails}>
                  <View>
                    <Text style={styles.vaultTypeLabel}>Type</Text>
                    <Text style={styles.vaultTypeValue}>{vault.type}</Text>
                  </View>
                  <View>
                    <Text style={styles.vaultMinLabel}>Minimum</Text>
                    <Text style={styles.vaultMinValue}>{vault.minimum}</Text>
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
    background: 'linear-gradient(45deg, #10b981, #06b6d4, #8b5cf6)',
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
