import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkBiometricSupport, isBiometricEnabled } from '@/utils/biometrics';
import EnableBiometricModal from '@/components/modals/EnableBiometricModal';
import NiceModal from '@ebay/nice-modal-react';

const BIOMETRIC_MODAL_SHOWN_KEY_PREFIX = 'biometric_modal_shown_';

function getStorageKey(address: string): string {
  return `${BIOMETRIC_MODAL_SHOWN_KEY_PREFIX}${address.toLowerCase()}`;
}

/**
 * Extract Ethereum wallet address from Privy user's linked_accounts
 */
function getEthereumAddressFromUser(user: any): string | null {
  if (!user?.linked_accounts || !Array.isArray(user.linked_accounts)) {
    return null;
  }

  // Find the first ethereum wallet in linked_accounts
  const ethereumWallet = user.linked_accounts.find(
    (account: any) =>
      account.type === 'wallet' &&
      account.chain_type === 'ethereum' &&
      account.address &&
      account.address.startsWith('0x')
  );

  return ethereumWallet?.address || null;
}

export function useShowBiometricModal(user: any) {
  const hasCheckedBiometricModal = useRef(false);
  const lastCheckedAddress = useRef<string | null>(null);

  useEffect(() => {
    const checkAndShowBiometricModal = async () => {
      if (!user) {
        return;
      }

      try {
        // Get current user address from user.linked_accounts
        const currentAddress = getEthereumAddressFromUser(user);

        if (!currentAddress) {
          // No ethereum wallet found, skip
          return;
        }

        // Reset check flag if address has changed
        if (lastCheckedAddress.current !== currentAddress) {
          hasCheckedBiometricModal.current = false;
          lastCheckedAddress.current = currentAddress;
        }

        // If already checked for this address, skip
        if (hasCheckedBiometricModal.current) {
          return;
        }

        hasCheckedBiometricModal.current = true;

        const storageKey = getStorageKey(currentAddress);

        // Check if modal has been shown before for this address
        const hasShown = await AsyncStorage.getItem(storageKey);
        if (hasShown === 'true') {
          return;
        }

        // Check if biometric is already enabled
        const enabled = await isBiometricEnabled();
        if (enabled) {
          // Mark as shown even if already enabled, so we don't show it again for this address
          await AsyncStorage.setItem(storageKey, 'true');
          return;
        }

        // Check if device supports biometrics
        const { supported } = await checkBiometricSupport();
        if (!supported) {
          // Mark as shown even if not supported, so we don't show it again for this address
          await AsyncStorage.setItem(storageKey, 'true');
          return;
        }

        // Show modal after a short delay to ensure UI is ready
        setTimeout(() => {
          NiceModal.show(EnableBiometricModal, {
            onEnabled: async () => {
              console.log('Biometric authentication enabled');
              // Mark as shown after user enables biometric for this address
              if (currentAddress) {
                await AsyncStorage.setItem(
                  getStorageKey(currentAddress),
                  'true'
                );
              }
            },
            onCancelled: async () => {
              console.log('Biometric authentication setup cancelled');
              // Mark as shown even if user cancels, so we don't show it again for this address
              if (currentAddress) {
                await AsyncStorage.setItem(
                  getStorageKey(currentAddress),
                  'true'
                );
              }
            },
          });
        }, 500);
      } catch (error) {
        console.error('Error checking biometric modal status:', error);
      }
    };

    // Only show modal after user is logged in and has passed LockSplash
    if (user) {
      checkAndShowBiometricModal();
    }
  }, [user]);
}
