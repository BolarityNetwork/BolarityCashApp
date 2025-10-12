// app/_layout.tsx
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { PrivyProvider } from '@privy-io/expo';
import { PrivyElements } from '@privy-io/expo/ui';
import { MultiChainWalletProvider } from '@/components/MultiChainWalletProvider';
import { ThemeProvider } from '@/components/theme/ThemeContext';
import { QueryProvider } from '@/components/QueryProvider';
import * as SplashScreen from 'expo-splash-screen';
import '@/i18n';
import { useUpdateModal } from '@/hooks/useUpdateModal';
import UpdateModal from '@/components/modals/UpdateModal';
import { useCheckForUpdates } from '@/hooks/useCheckForUpdates';
import { useAppReady } from '@/hooks/useAppReady';
import { usePrivyReady } from '@/hooks/usePrivyReady';
import { PRIVY_CONFIG, SUPPORTED_CHAINS } from '@/constants/privyConfig';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useAppReady();

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
        config={PRIVY_CONFIG}
        supportedChains={SUPPORTED_CHAINS as any}
      >
        <AppContent
          isVisible={isVisible}
          updateInfo={updateInfo}
          hideUpdateModal={hideUpdateModal}
          handleUpdate={handleUpdate}
        />
      </PrivyProvider>
    </QueryProvider>
  );
}

function AppContent({
  isVisible,
  updateInfo,
  hideUpdateModal,
  handleUpdate,
}: {
  isVisible: boolean;
  updateInfo: any;
  hideUpdateModal: () => void;
  handleUpdate: () => void;
}) {
  usePrivyReady();

  return (
    <MultiChainWalletProvider>
      <ThemeProvider>
        <ProtocolWalletInitializer />
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
  );
}

function ProtocolWalletInitializer() {
  const { useProtocolWallet } = require('@/hooks/protocol/useProtocolWallet');
  useProtocolWallet();
  return null;
}
