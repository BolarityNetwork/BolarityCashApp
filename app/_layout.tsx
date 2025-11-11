// app/_layout.tsx
import '@walletconnect/react-native-compat'; // add this import before using appkit

import { createAppKit } from '@reown/appkit-react-native';
import { WagmiAdapter } from '@reown/appkit-wagmi-react-native';
import { mainnet, sepolia } from 'wagmi/chains';

import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { PrivyProvider } from '@privy-io/expo';
import { PrivyElements } from '@privy-io/expo/ui';
import { MultiChainWalletProvider } from '@/components/MultiChainWalletProvider';
import { ThemeProvider } from '@/components/theme/ThemeContext';
import { QueryProvider } from '@/components/QueryProvider';
import NiceModal from '@ebay/nice-modal-react';
import * as SplashScreen from 'expo-splash-screen';
import '@/i18n';
import { useUpdateModal } from '@/hooks/useUpdateModal';
import UpdateModal from '@/components/modals/UpdateModal';
import { useCheckForUpdates } from '@/hooks/useCheckForUpdates';
import { useAppReady } from '@/hooks/useAppReady';
import { usePrivyReady } from '@/hooks/usePrivyReady';
import { PRIVY_CONFIG, SUPPORTED_CHAINS } from '@/constants/privyConfig';
import Toast from 'react-native-toast-message';
import { TakoToast } from '@/components/common/TakoToast';
import { toastConfig } from '@/components/common/ToastConfig';
import { storage } from '@/utils/blockchain/StorageUtil';
import { WagmiProvider } from 'wagmi';
import { AppKitProvider, AppKit } from '@reown/appkit-react-native';
import * as Clipboard from 'expo-clipboard';

SplashScreen.preventAutoHideAsync();

const projectId = 'a680f3343f7758233e5f09906566a913';

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [mainnet, sepolia],
});
const metadata = {
  name: 'BolarityCash',
  description: 'BolarityCash',
  url: 'https://app.bolaritycash.com',
  icons: ['https://app.bolaritycash.com/icon.png'],
  redirect: {
    native: 'bolaritycash://',
    universal: 'app.bolaritycash.com',
  },
};

const networks = [mainnet];

const clipboardClient = {
  setString: async (value: string) => {
    Clipboard.setStringAsync(value);
  },
};

export const appKit = createAppKit({
  projectId,
  networks: [...networks],
  adapters: [wagmiAdapter],
  extraConnectors: [],
  metadata,
  clipboardClient,
  storage,
  defaultNetwork: mainnet, // Optional
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  features: {
    socials: [],
  },
});

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
    <AppKitProvider instance={appKit}>
      <AppKit />
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
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
      </WagmiProvider>
    </AppKitProvider>
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
        <NiceModal.Provider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <UpdateModal
            visible={isVisible}
            updateInfo={updateInfo}
            onClose={hideUpdateModal}
            onUpdate={handleUpdate}
          />
          <Toast config={toastConfig} />
          <TakoToast.Component />
          <PrivyElements />
        </NiceModal.Provider>
      </ThemeProvider>
    </MultiChainWalletProvider>
  );
}
