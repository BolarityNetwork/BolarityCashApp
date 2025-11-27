import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import {
  checkBiometricSupport,
  enableBiometric,
  authenticateWithBiometrics,
  getBiometricTypeName,
} from '@/utils/biometrics';
import { TakoToast } from '@/components/common/TakoToast';

interface EnableBiometricModalProps {
  onEnabled?: () => void;
  onCancelled?: () => void;
}

export const EnableBiometricModal = NiceModal.create<EnableBiometricModalProps>(
  props => {
    const modal = useModal(EnableBiometricModal, { ...props });
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [biometricType, setBiometricType] = useState<string>('Biometric');

    React.useEffect(() => {
      // Check biometric support when modal opens
      const checkSupport = async () => {
        const { supported, types } = await checkBiometricSupport();
        if (supported && types.length > 0) {
          setBiometricType(getBiometricTypeName(types));
        }
      };
      checkSupport();
    }, []);

    const handleClose = useCallback(() => {
      modal.remove();
      props.onCancelled?.();
    }, [modal, props]);

    const handleEnable = useCallback(async () => {
      setIsLoading(true);
      try {
        // First, verify biometric support
        const { supported } = await checkBiometricSupport();
        if (!supported) {
          TakoToast.show({
            type: 'normal',
            status: 'error',
            message: t('biometrics.notSupported'),
          });
          setIsLoading(false);
          return;
        }

        // Immediately trigger biometric authentication to ensure user can use it
        const authResult = await authenticateWithBiometrics({
          promptMessage: t('biometrics.enablePrompt'),
          cancelLabel: t('common.cancel'),
        });

        if (!authResult.success) {
          if (authResult.error === 'user_cancel') {
            // User cancelled, just close the modal
            setIsLoading(false);
            return;
          }
          TakoToast.show({
            type: 'normal',
            status: 'error',
            message: t('biometrics.authenticationFailed'),
          });
          setIsLoading(false);
          return;
        }

        // If authentication succeeded, enable biometric
        await enableBiometric();

        TakoToast.show({
          type: 'normal',
          status: 'success',
          message: t('biometrics.enabled'),
        });

        modal.remove();
        props.onEnabled?.();
      } catch (error: any) {
        console.error('Error enabling biometric:', error);
        TakoToast.show({
          type: 'normal',
          status: 'error',
          message: error.message || t('biometrics.enableFailed'),
        });
      } finally {
        setIsLoading(false);
      }
    }, [modal, props, t]);

    return (
      <Modal
        visible={modal.visible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔐</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>{t('biometrics.enableTitle')}</Text>

            {/* Description */}
            <Text style={styles.description}>
              {t('biometrics.enableDescription', { type: biometricType })}
            </Text>

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>
                  {t('biometrics.benefit1')}
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>
                  {t('biometrics.benefit2')}
                </Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.enableButton]}
                onPress={handleEnable}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.enableButtonText}>
                    {t('biometrics.enable')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 12,
    fontWeight: 'bold',
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  enableButton: {
    backgroundColor: '#667eea',
  },
  enableButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default EnableBiometricModal;
