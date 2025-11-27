import { isBiometricEnabled, authenticateWithBiometrics } from './biometrics';

/**
 * Ensure biometric authentication before transaction
 * This function should be called before any transaction is sent
 * @throws Error if biometric authentication fails or is cancelled
 */
export async function ensureBiometricsBeforeTx(): Promise<void> {
  console.log('ensureBiometricsBeforeTx');
  const enabled = await isBiometricEnabled();

  // If biometric is not enabled, allow transaction to proceed
  if (!enabled) {
    return;
  }

  // If biometric is enabled, require authentication
  const result = await authenticateWithBiometrics({
    promptMessage: 'Authenticate to confirm transaction',
    cancelLabel: 'Cancel',
  });

  if (!result.success) {
    if (result.error === 'user_cancel') {
      throw new Error('Transaction cancelled by user');
    }
    throw new Error('Biometric authentication failed');
  }
}
