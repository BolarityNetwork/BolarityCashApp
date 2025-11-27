import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { usePersistedPrivyUser } from '@/hooks/usePersistedPrivyUser';
import {
  isBiometricEnabled,
  authenticateWithBiometrics,
} from '@/utils/biometrics';
import i18n from '@/i18n';
import { CommonSafeAreaView } from './CommonSafeAreaView';

interface LockSplashProps {
  locked: boolean;
  onUnlock: () => void;
}

export default function LockSplash({ locked, onUnlock }: LockSplashProps) {
  const { t } = useTranslation();
  const { user, logout } = usePersistedPrivyUser();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const hasChecked = useRef(false);
  const isProcessing = useRef(false);
  const isColdStart = useRef(true); // Track if this is the first time showing (cold start)

  // Handle biometric authentication when component is shown (cold start or foreground)
  useEffect(() => {
    const performAuthentication = async () => {
      // Only check if component is visible (locked) and user is logged in
      if (!locked || !user || isProcessing.current) {
        return;
      }

      // Skip if already checked in this lock session
      if (hasChecked.current) {
        return;
      }

      hasChecked.current = true;
      isProcessing.current = true;

      try {
        const enabled = await isBiometricEnabled();
        if (!enabled) {
          // Biometric not enabled, unlock immediately
          onUnlock();
          return;
        }

        setIsAuthenticating(true);

        // Determine prompt message based on context
        // For cold start, use unlockApp; for foreground, use unlockAppForeground
        const promptMessage = isColdStart.current
          ? i18n.t('biometrics.unlockApp')
          : i18n.t('biometrics.unlockAppForeground');

        const result = await authenticateWithBiometrics({
          promptMessage,
          cancelLabel: i18n.t('common.cancel'),
        });

        if (result.success) {
          // Authentication successful - unlock the app
          isColdStart.current = false; // Mark as no longer cold start
        } else {
          // Authentication failed or cancelled - logout for security
          if (result.error === 'user_cancel') {
            console.log('Biometric authentication cancelled, logging out...');
          } else {
            console.log('Biometric authentication failed, logging out...');
          }
          logout();
        }
      } catch (error: any) {
        console.error('Biometric authentication error:', error);
        // On error, logout for security
        logout();
      } finally {
        onUnlock();
        setIsAuthenticating(false);
        isProcessing.current = false;
      }
    };

    if (locked && user) {
      performAuthentication();
    }
  }, [locked, user, onUnlock, logout]);

  // Reset check flag when component is hidden
  useEffect(() => {
    if (!locked) {
      hasChecked.current = false;
      // Mark as not cold start after first unlock
      isColdStart.current = false;
    }
  }, [locked]);

  if (!locked) {
    return null;
  }

  return (
    <CommonSafeAreaView className="bg-white absolute top-0 left-0 right-0 bottom-0 z-[9999] elevation-9999">
      <View className="flex-1 items-center justify-center">
        <Image
          source={require('@/assets/icon/splash-icon-dark.png')}
          className="w-[200px] h-[200px]"
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#000" />
        {isAuthenticating && (
          <Text className="text-black text-sm">
            {t('biometrics.authenticating')}
          </Text>
        )}
      </View>
    </CommonSafeAreaView>
  );
}
