import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

/**
 * Check if biometric authentication is supported on the device
 */
export async function checkBiometricSupport(): Promise<{
  supported: boolean;
  types: LocalAuthentication.AuthenticationType[];
}> {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      return { supported: false, types: [] };
    }

    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return {
      supported: types.length > 0,
      types,
    };
  } catch (error) {
    console.error('Error checking biometric support:', error);
    return { supported: false, types: [] };
  }
}

/**
 * Check if biometric authentication is enabled for the user
 */
export async function isBiometricEnabled(): Promise<boolean> {
  try {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Error checking biometric enabled status:', error);
    return false;
  }
}

/**
 * Enable biometric authentication
 */
export async function enableBiometric(): Promise<void> {
  try {
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
  } catch (error) {
    console.error('Error enabling biometric:', error);
    throw error;
  }
}

/**
 * Disable biometric authentication
 */
export async function disableBiometric(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
  } catch (error) {
    console.error('Error disabling biometric:', error);
    throw error;
  }
}

/**
 * Authenticate using biometrics
 * @param options - Authentication options
 * @returns Authentication result
 */
export async function authenticateWithBiometrics(options?: {
  promptMessage?: string;
  cancelLabel?: string;
  disableDeviceFallback?: boolean;
}): Promise<LocalAuthentication.LocalAuthenticationResult> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: options?.promptMessage || 'Authenticate to continue',
      cancelLabel: options?.cancelLabel || 'Cancel',
      disableDeviceFallback: options?.disableDeviceFallback ?? false,
      fallbackLabel: 'Use passcode',
    });

    return result;
  } catch (error) {
    console.error('Error authenticating with biometrics:', error);
    throw error;
  }
}

/**
 * Get the biometric type name for display
 */
export function getBiometricTypeName(
  types: LocalAuthentication.AuthenticationType[]
): string {
  if (
    types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
  ) {
    return 'Face ID';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'Touch ID';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'Iris';
  }
  return 'Biometric';
}
