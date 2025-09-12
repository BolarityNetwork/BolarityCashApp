// app/_layout.tsx
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { PrivyProvider } from '@privy-io/expo';
import { PrivyElements } from '@privy-io/expo/ui';
import { MultiChainWalletProvider } from '@/components/MultiChainWalletProvider';
import { ThemeProvider } from '@/components/theme/ThemeContext';
import { QueryProvider } from '@/components/QueryProvider';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import '@/i18n';
import { useUpdateModal } from '@/hooks/useUpdateModal';
import UpdateModal from '@/components/modals/UpdateModal';
import { useCheckForUpdates } from '@/hooks/useCheckForUpdates';

export default function RootLayout() {
  useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const {
    isVisible,
    updateInfo,
    hideUpdateModal,
    handleUpdate,
    checkForUpdates,
  } = useUpdateModal();

  useCheckForUpdates(checkForUpdates);

  return (
    <QueryProvider>
      <PrivyProvider
        appId={Constants.expoConfig?.extra?.privyAppId}
        clientId={Constants.expoConfig?.extra?.privyClientId}
      >
        <MultiChainWalletProvider>
          <ThemeProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <UpdateModal
              visible={isVisible}
              updateInfo={updateInfo}
              onClose={hideUpdateModal}
              onUpdate={handleUpdate}
            />
            <PrivyElements />
          </ThemeProvider>
        </MultiChainWalletProvider>
      </PrivyProvider>
    </QueryProvider>
  );
}
