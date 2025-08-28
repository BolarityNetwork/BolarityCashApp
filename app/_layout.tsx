// app/_layout.tsx
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { PrivyProvider } from '@privy-io/expo';
import { PrivyElements } from '@privy-io/expo/ui';
import { MultiChainWalletProvider } from '@/components/MultiChainWalletProvider';
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
      config={{
        // 配置支持的登录方式
        loginMethods: [
          'email',
          'wallet',
          'google',
          'github',
          'discord',
          'apple',
        ],

        // 配置Solana集群
        solanaClusters: [
          {
            name: 'mainnet-beta',
            rpcUrl: 'https://api.mainnet-beta.solana.com',
          },
          {
            name: 'devnet',
            rpcUrl: 'https://api.devnet.solana.com',
          },
          {
            name: 'testnet',
            rpcUrl: 'https://api.testnet.solana.com',
          },
        ],

        // 外观配置
        appearance: {
          theme: 'light',
          accentColor: '#667eea',
          logo: 'https://your-domain.com/logo.png',
        },

        // 嵌入式钱包配置
        embeddedWallets: {
          createOnLogin: 'users-without-wallets', // 为没有钱包的用户创建
          requireUserPasswordOnCreate: false,
          priceDisplay: {
            primary: 'native-token',
            secondary: 'fiat-currency',
          },
        },

        // 外部钱包配置
        externalWallets: {
          coinbaseWallet: {
            connectionOptions: 'smartWalletOnly',
          },
          metamask: {
            connectionOptions: 'injectedOnly',
          },
        },

        // 多因素认证
        mfa: {
          noPromptOnMfaRequired: false,
        },
      }}
    >
      {/* 将 MultiChainWalletProvider 包装在 PrivyProvider 内部 */}
      <MultiChainWalletProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            statusBarStyle: 'light',
            statusBarTranslucent: true,
            statusBarBackgroundColor: 'transparent',
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
        <PrivyElements />
      </MultiChainWalletProvider>
    </PrivyProvider>
  );
}
