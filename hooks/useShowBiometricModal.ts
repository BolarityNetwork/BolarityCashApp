import { useEffect, useRef } from 'react';
import { checkBiometricSupport, isBiometricEnabled } from '@/utils/biometrics';
import EnableBiometricModal from '@/components/modals/EnableBiometricModal';
import NiceModal from '@ebay/nice-modal-react';

export function useShowBiometricModal(user: any) {
  const hasCheckedBiometricModal = useRef(false);

  useEffect(() => {
    const checkAndShowBiometricModal = async () => {
      if (!user || hasCheckedBiometricModal.current) {
        return;
      }

      hasCheckedBiometricModal.current = true;

      // Check if biometric is already enabled
      const enabled = await isBiometricEnabled();
      if (enabled) {
        return;
      }

      // Check if device supports biometrics
      const { supported } = await checkBiometricSupport();
      if (!supported) {
        return;
      }

      // Show modal after a short delay to ensure UI is ready
      setTimeout(() => {
        NiceModal.show(EnableBiometricModal, {
          onEnabled: () => {
            console.log('Biometric authentication enabled');
          },
          onCancelled: () => {
            console.log('Biometric authentication setup cancelled');
          },
        });
      }, 500);
    };

    // Only show modal after user is logged in and has passed LockSplash
    if (user) {
      checkAndShowBiometricModal();
    }
  }, [user]);
}
