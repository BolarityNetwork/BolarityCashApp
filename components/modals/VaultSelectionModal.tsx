// components/PerfectVaultSavingsPlatform/modals/VaultSelectionModal.tsx
import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import ProtocolLogo from '../home/ProtocolLogo';
import { VaultOption } from '@/interfaces/home';
import { useVaultSelection } from '@/hooks/useVaultSelection';

interface VaultSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (vault: VaultOption) => void;
}

const VaultSelectionModal: React.FC<VaultSelectionModalProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  // 使用专门的 VaultSelection hook
  const { vaultOptions, loadProtocolData } = useVaultSelection();
  // 当模态框打开时，加载数据
  useEffect(() => {
    if (visible) {
      loadProtocolData();
    }
  }, [visible, loadProtocolData]);
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Choose Your Vault</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalDescription}>
            Select a DeFi protocol to start earning with Bolarity FlexiVault
          </Text>

          <View style={styles.modalVaultList}>
            {vaultOptions.map((vault, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalVaultItem}
                onPress={() => onSelect(vault)}
              >
                <View style={styles.modalVaultLeft}>
                  <ProtocolLogo protocol={vault.name} size={40} />
                  <View style={styles.modalVaultInfo}>
                    <View style={styles.modalVaultNameRow}>
                      <Text style={styles.modalVaultName}>{vault.name}</Text>
                      <View style={styles.liveIndicator}>
                        <Text style={styles.liveIndicatorText}>LIVE</Text>
                      </View>
                    </View>
                    <Text style={styles.modalVaultDesc}>
                      {vault.protocolData.description}
                    </Text>
                  </View>
                </View>
                <View style={styles.modalVaultRight}>
                  <Text
                    style={[styles.modalVaultApy, styles.modalVaultApyLive]}
                  >
                    {vault.protocolData.apyDisplay}
                  </Text>
                  <Text style={styles.modalVaultApyLabel}>APY</Text>
                </View>
                <View style={styles.modalVaultBottom}>
                  <Text style={styles.modalVaultTvl}>
                    TVL: {vault.protocolData.tvl}
                  </Text>
                  <Text style={styles.modalVaultRisk}>
                    Risk: {vault.protocolData.risk}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
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
  modalDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  modalVaultList: {
    gap: 12,
  },
  modalVaultItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalVaultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalVaultInfo: {
    marginLeft: 12,
    flex: 1,
  },
  modalVaultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalVaultDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalVaultRight: {
    position: 'absolute',
    top: 16,
    right: 16,
    alignItems: 'flex-end',
  },
  modalVaultApy: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  modalVaultApyLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalVaultBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalVaultTvl: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalVaultRisk: {
    fontSize: 14,
    color: '#6b7280',
  },
  // APR Info Card Styles
  aprInfoCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  aprInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 12,
    textAlign: 'center',
  },
  aprInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aprInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  aprInfoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  aprInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  aprInfoTotal: {
    color: '#059669',
    fontSize: 18,
  },
  aprInfoFooter: {
    marginTop: 8,
    alignItems: 'center',
  },
  aprInfoLoading: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  aprInfoCacheStatus: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  // Live data indicators
  modalVaultNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveIndicator: {
    backgroundColor: '#10b981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  liveIndicatorText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalVaultApyLive: {
    color: '#10b981',
    fontWeight: 'bold',
  },
});

export default VaultSelectionModal;
