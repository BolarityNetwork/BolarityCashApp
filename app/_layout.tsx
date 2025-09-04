// app/_layout.tsx
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { PrivyProvider } from '@privy-io/expo';
import { PrivyElements } from '@privy-io/expo/ui';
import { MultiChainWalletProvider } from '@/components/MultiChainWalletProvider';
import { ThemeProvider } from '@/components/theme/ThemeContext';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import '@/i18n';
import UpdateModal from '@/components/modals/UpdateModal';
import { useUpdateModal } from '@/hooks/useUpdateModal';
import { useEffect } from 'react';
import { checkForUpdate } from '@/utils/updates';
import { useUpdateStore } from '@/hooks/store/useUpdateStore';

export default function RootLayout() {
  useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  const { isVisible, updateInfo, hideUpdateModal, handleUpdate } =
    useUpdateModal();
  const { setExpoUpdateInfo } = useUpdateStore();

  useEffect(() => {
    const interval = setInterval(() => {
      checkForUpdate?.().then(res => {
        if (res?.isAvailable) {
          setExpoUpdateInfo(res);
        }
      });
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [checkForUpdate]);

  return (
    <PrivyProvider
      appId={Constants.expoConfig?.extra?.privyAppId}
      clientId={Constants.expoConfig?.extra?.privyClientId}
    >
      <MultiChainWalletProvider>
        <ThemeProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              statusBarStyle: 'light',
              statusBarTranslucent: true,
              statusBarBackgroundColor: 'transparent',
            }}
          ></Stack>
          <PrivyElements />
          <UpdateModal
            visible={isVisible}
            updateInfo={updateInfo}
            onUpdate={handleUpdate}
            onClose={hideUpdateModal}
          />
        </ThemeProvider>
      </MultiChainWalletProvider>
    </PrivyProvider>
  );
}
