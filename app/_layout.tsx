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

export default function RootLayout() {
  useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

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
        </ThemeProvider>
      </MultiChainWalletProvider>
    </PrivyProvider>
  );
}
