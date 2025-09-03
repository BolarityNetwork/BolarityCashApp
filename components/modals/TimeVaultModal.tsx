// components/PerfectVaultSavingsPlatform/modals/TimeVaultModal.tsx
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
import ProtocolLogo from '@/components/home/ProtocolLogo';
import { getProtocolFromVaultName } from '@/utils/home';
import { TimeVaultOption } from '@/interfaces/home';

interface TimeVaultModalProps {
  visible: boolean;
  timeVaultOptions: TimeVaultOption[];
  onClose: () => void;
  onSelect: (vault: TimeVaultOption) => void;
}

const TimeVaultModal: React.FC<TimeVaultModalProps> = ({
  visible,
  timeVaultOptions,
  onClose,
  onSelect,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>TimeVault Pro Options</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalDescription}>
            Select a fixed-term vault with guaranteed returns
          </Text>

          <View style={styles.modalVaultList}>
            {timeVaultOptions.map((vault, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalVaultItem}
                onPress={() => onSelect(vault)}
              >
                <View style={styles.modalVaultLeft}>
                  <ProtocolLogo
                    protocol={getProtocolFromVaultName(vault.name as string)}
                    size={40}
                  />
                  <View style={styles.modalVaultInfo}>
                    <Text style={styles.modalVaultName}>{vault.name}</Text>
                    <Text style={styles.modalTimeVaultMaturity}>
                      {vault.maturity}
                    </Text>
                  </View>
                </View>
                <View style={styles.modalVaultRight}>
                  <Text style={styles.modalVaultApy}>{vault.apy}</Text>
                  <Text style={styles.modalVaultApyLabel}>APY</Text>
                </View>
                <View style={styles.modalVaultBottom}>
                  <Text style={styles.modalVaultTvl}>TVL: {vault.tvl}</Text>
                  <Text style={styles.modalVaultRisk}>Risk: {vault.risk}</Text>
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
  modalTimeVaultMaturity: {
    fontSize: 14,
    color: '#2563eb',
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
});

export default TimeVaultModal;
