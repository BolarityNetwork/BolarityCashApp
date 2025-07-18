// components/PerfectVaultSavingsPlatform/modals/DepositModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ProtocolLogo from '../components/ProtocolLogo';
import VaultLogo from '../components/VaultLogo';
import { getProtocolFromVaultName, VaultProduct, VaultOption, TimeVaultOption } from '../constants';

interface DepositModalProps {
  visible: boolean;
  selectedVault: VaultProduct | null;
  selectedSpecificVault: VaultOption | TimeVaultOption | null;
  onClose: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({
  visible,
  selectedVault,
  selectedSpecificVault,
  onClose,
}) => {
  if (!visible || (!selectedVault && !selectedSpecificVault)) {
    return null;
  }

  const displayVault = selectedSpecificVault || selectedVault;
  const isSpecificVault = !!selectedSpecificVault;
  const isTimeVault = displayVault && 'lockPeriod' in displayVault;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {isTimeVault ? `Open ${displayVault.name}` : 
             isSpecificVault ? `Open ${displayVault.name} Vault` : 
             `Open ${displayVault.name}`}
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {isTimeVault ? (
            <>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.depositVaultHeader}
              >
                <View style={styles.depositVaultInfo}>
                  <ProtocolLogo protocol={getProtocolFromVaultName(displayVault.name)} size={48} />
                  <View style={styles.depositVaultText}>
                    <Text style={styles.depositVaultName}>{displayVault.name}</Text>
                    <Text style={styles.depositVaultDesc}>{displayVault.description}</Text>
                  </View>
                </View>
                <View style={styles.depositVaultStats}>
                  <View style={styles.depositStatItem}>
                    <Text style={styles.depositStatLabel}>APY Rate</Text>
                    <Text style={styles.depositStatValue}>{displayVault.apy}</Text>
                  </View>
                  <View style={styles.depositStatItem}>
                    <Text style={styles.depositStatLabel}>Lock Period</Text>
                    <Text style={styles.depositStatValue}>{(displayVault as TimeVaultOption).lockPeriod}</Text>
                  </View>
                </View>
                <View style={styles.depositProtocol}>
                  <Text style={styles.depositStatLabel}>Protocol</Text>
                  <Text style={styles.depositStatValue}>{(displayVault as TimeVaultOption).protocol}</Text>
                </View>
              </LinearGradient>

              <View style={styles.depositFeatures}>
                <Text style={styles.depositFeaturesTitle}>Vault Features:</Text>
                {['Fixed-term guaranteed returns', 'No early withdrawal penalty', 'Automated yield optimization', 'Institutional-grade security'].map((feature, index) => (
                  <View key={index} style={styles.depositFeatureItem}>
                    <View style={[styles.depositFeatureDot, { backgroundColor: '#667eea' }]} />
                    <Text style={styles.depositFeatureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.depositSummary}>
                <View style={styles.depositSummaryRow}>
                  <Text style={styles.depositSummaryLabel}>Deposit Amount</Text>
                  <Text style={styles.depositSummaryAmount}>$5,000</Text>
                </View>
                <View style={styles.depositSummaryRow}>
                  <Text style={styles.depositSummaryLabel}>Maturity Date</Text>
                  <Text style={styles.depositSummaryMaturity}>{(displayVault as TimeVaultOption).maturity}</Text>
                </View>
                <View style={styles.depositSummaryRow}>
                  <Text style={styles.depositSummaryLabel}>Total Return at Maturity</Text>
                  <Text style={styles.depositSummaryReturn}>
                    ${(5000 * (1 + parseFloat(displayVault.apy) / 100 * (parseInt((displayVault as TimeVaultOption).lockPeriod) / 365))).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>
            </>
          ) : isSpecificVault ? (
            <>
              <LinearGradient
                colors={['#764ba2', '#c084fc']}
                style={styles.depositVaultHeader}
              >
                <View style={styles.depositVaultInfo}>
                  <ProtocolLogo protocol={displayVault.name} size={48} />
                  <View style={styles.depositVaultText}>
                    <Text style={styles.depositVaultName}>{displayVault.name}</Text>
                    <Text style={styles.depositVaultDesc}>{displayVault.description}</Text>
                  </View>
                </View>
                <View style={styles.depositVaultStats}>
                  <View style={styles.depositStatItem}>
                    <Text style={styles.depositStatLabel}>APY Rate</Text>
                    <Text style={styles.depositStatValue}>{displayVault.apy}</Text>
                  </View>
                  <View style={styles.depositStatItem}>
                    <Text style={styles.depositStatLabel}>TVL</Text>
                    <Text style={styles.depositStatValue}>{(displayVault as VaultOption).tvl}</Text>
                  </View>
                </View>
                <View style={styles.depositProtocol}>
                  <Text style={styles.depositStatLabel}>Risk Level</Text>
                  <Text style={styles.depositStatValue}>{(displayVault as VaultOption).risk}</Text>
                </View>
              </LinearGradient>

              <View style={styles.depositFeatures}>
                <Text style={styles.depositFeaturesTitle}>Protocol Features:</Text>
                {['Flexible access anytime', 'Auto-compounding rewards', 'Audited smart contracts', '24/7 yield optimization'].map((feature, index) => (
                  <View key={index} style={styles.depositFeatureItem}>
                    <View style={[styles.depositFeatureDot, { backgroundColor: '#764ba2' }]} />
                    <Text style={styles.depositFeatureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.depositSummary}>
                <View style={styles.depositSummaryRow}>
                  <Text style={styles.depositSummaryLabel}>Deposit Amount</Text>
                  <Text style={styles.depositSummaryAmount}>$5,000</Text>
                </View>
                <View style={styles.depositSummaryRow}>
                  <Text style={styles.depositSummaryLabel}>Estimated Monthly Earnings</Text>
                  <Text style={styles.depositSummaryReturn}>
                    ${((5000 * parseFloat(displayVault.apy)) / 1200).toFixed(2)}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <LinearGradient
                colors={(displayVault as VaultProduct).gradientColors}
                style={styles.depositVaultHeader}
              >
                <View style={styles.depositVaultHeaderContent}>
                  <Text style={styles.depositVaultName}>{displayVault.name}</Text>
                  <VaultLogo vaultName={displayVault.name} size={24} />
                </View>
                <View style={styles.depositVaultStats}>
                  <View style={styles.depositStatItem}>
                    <Text style={styles.depositStatLabel}>APY Rate</Text>
                    <Text style={styles.depositStatValue}>{displayVault.apy}</Text>
                  </View>
                  <View style={styles.depositStatItem}>
                    <Text style={styles.depositStatLabel}>Minimum</Text>
                    <Text style={styles.depositStatValue}>{(displayVault as VaultProduct).minimum}</Text>
                  </View>
                </View>
              </LinearGradient>

              <View style={styles.depositFeatures}>
                <Text style={styles.depositFeaturesTitle}>Key Features:</Text>
                {(displayVault as VaultProduct).features.map((feature, index) => (
                  <View key={index} style={styles.depositFeatureItem}>
                    <View style={[styles.depositFeatureDot, { backgroundColor: '#c084fc' }]} />
                    <Text style={styles.depositFeatureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.depositSummary}>
                <View style={styles.depositSummaryRow}>
                  <Text style={styles.depositSummaryLabel}>Deposit Amount</Text>
                  <Text style={styles.depositSummaryAmount}>$5,000</Text>
                </View>
                <View style={styles.depositSummaryRow}>
                  <Text style={styles.depositSummaryLabel}>Estimated Monthly Earnings</Text>
                  <Text style={styles.depositSummaryReturn}>
                    ${((5000 * parseFloat(displayVault.apy)) / 1200).toFixed(2)}
                  </Text>
                </View>
              </View>
            </>
          )}

          <View style={styles.depositActions}>
            <TouchableOpacity
              style={styles.learnMoreButton}
              onPress={onClose}
            >
              <Text style={styles.learnMoreText}>Learn More</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.startSavingButton}
              onPress={onClose}
            >
              <Text style={styles.startSavingText}>Start Saving</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6b7280',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  depositVaultHeader: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  depositVaultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  depositVaultText: {
    marginLeft: 12,
    flex: 1,
  },
  depositVaultName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  depositVaultDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  depositVaultHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  depositVaultStats: {
    flexDirection: 'row',
    gap: 16,
  },
  depositStatItem: {
    flex: 1,
  },
  depositStatLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  depositStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  depositProtocol: {
    marginTop: 12,
  },
  depositFeatures: {
    marginBottom: 24,
  },
  depositFeaturesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  depositFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  depositFeatureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
    marginRight: 12,
  },
  depositFeatureText: {
    fontSize: 14,
    color: '#374151',
  },
  depositSummary: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  depositSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  depositSummaryLabel: {
    fontSize: 14,
    color: '#374151',
  },
  depositSummaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  depositSummaryMaturity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  depositSummaryReturn: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  depositActions: {
    flexDirection: 'row',
    gap: 12,
  },
  learnMoreButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  learnMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  startSavingButton: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startSavingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default DepositModal;