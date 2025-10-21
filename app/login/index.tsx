import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { ErrorDisplay } from '@/components/login/ErrorDisplay';
import { usePersistedPrivyUser } from '@/hooks/usePersistedPrivyUser';
import { Redirect } from 'expo-router';
import AppleIcon from '@/assets/icon/login/apple.svg';
import GoogleIcon from '@/assets/icon/login/google.svg';
import WalletIcon from '@/assets/icon/login/wallet.svg';
import DiscordIcon from '@/assets/icon/login/discord.svg';
import PasskeyIcon from '@/assets/icon/login/passkey.svg';
import EmailIcon from '@/assets/icon/login/email.svg';
import SmsIcon from '@/assets/icon/login/sms.svg';
import { usePrivy } from '@privy-io/expo';
import { useFullScreenLoading } from '@/hooks/useFullScreenLoading';

export const OAUTH_PROVIDERS = [
  {
    name: 'google',
    label: 'Google',
    colors: ['#4285F4', '#34A853'] as const,
    icon: <GoogleIcon />,
  },
  {
    name: 'apple',
    label: 'Continue with Apple',
    colors: ['#000', '#333'] as const,
    icon: <AppleIcon />,
  },
  {
    name: 'discord',
    label: 'Continue with Discord',
    colors: ['#5865F2', '#7289DA'] as const,
    icon: <DiscordIcon />,
  },
] as const;

export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number]['name'];

export default function LoginScreen() {
  const { isReady, error: privyError } = usePrivy();
  const { startLoading, endLoading } = useFullScreenLoading({});

  React.useEffect(() => {
    if (!isReady) {
      startLoading({ cancelable: false });
    } else {
      endLoading();
    }
  }, [isReady, startLoading, endLoading]);

  const {
    isLoading,
    error,
    oauthLoading,
    handleEmailLogin,
    handlePasskeyLogin,
    handleOAuthLogin,
  } = useAuth();
  const { user } = usePersistedPrivyUser();

  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 bg-gray-50">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 80,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Header />

          <View className="bg-white rounded-2xl mx-1 shadow-sm overflow-hidden">
            <PrimaryActions
              isLoading={isLoading}
              onEmailLogin={handleEmailLogin}
            />
          </View>

          <View className="py-6 px-6 bg-gray-50">
            <Text className="text-sm text-gray-500 font-medium text-center">
              Other options
            </Text>
          </View>

          <View className="bg-white rounded-2xl mx-1 shadow-sm overflow-hidden">
            <OAuthSection
              providers={OAUTH_PROVIDERS}
              isLoading={isLoading || oauthLoading}
              onProviderSelect={handleOAuthLogin}
              onPasskeyLogin={handlePasskeyLogin}
            />
          </View>

          <ErrorDisplay
            error={error || (privyError ? privyError.message : '')}
          />
        </ScrollView>
      </View>
    </>
  );
}

function Header() {
  return (
    <View className="items-center mb-16">
      <View className="flex-row items-center mb-6">
        <Image
          source={require('@/assets/images/adaptive-icon.png')}
          style={{ width: 40, height: 40, borderRadius: 10 }}
          resizeMode="contain"
        />
        <Text className="ml-3 text-4xl font-bold text-black tracking-tight">
          Bolarity
        </Text>
      </View>
      <Text className="text-xl font-medium text-gray-600 text-center tracking-wide">
        Log in or sign up
      </Text>
    </View>
  );
}

function PrimaryActions({ isLoading, onEmailLogin }: any) {
  return (
    <View className="p-0">
      <TouchableOpacity
        className="flex-row items-center justify-between py-5 px-6 border-b border-gray-100 bg-white"
        onPress={onEmailLogin}
        disabled={isLoading}
      >
        <View className="flex-row items-center flex-1">
          <EmailIcon />
          <Text className="ml-3 text-base font-medium text-gray-900 flex-1">
            your@email.com
          </Text>
        </View>
        <Text className="text-lg text-gray-400">Submit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-row items-center justify-between py-5 px-6 border-b-0 bg-white"
        onPress={() => {
          /* SMS function */
        }}
        disabled={isLoading}
      >
        <View className="flex-row items-center flex-1">
          <SmsIcon />
          <Text className="ml-3 text-base font-medium text-gray-900 flex-1">
            Continue with SMS
          </Text>
        </View>
        <Text className="text-lg text-gray-400">›</Text>
      </TouchableOpacity>
    </View>
  );
}

function OAuthSection({
  providers,
  isLoading,
  onProviderSelect,
  onPasskeyLogin,
}: any) {
  const renderProviderIcon = (providerName: string) => {
    switch (providerName) {
      case 'google':
        return <GoogleIcon />;
      case 'apple':
        return <AppleIcon />;
      case 'discord':
        return <DiscordIcon />;
      default:
        return (
          <Text className="text-xl mr-4">
            {providers.find((p: any) => p.name === providerName)?.icon}
          </Text>
        );
    }
  };

  return (
    <View className="bg-white">
      {providers.map((provider: any) => (
        <TouchableOpacity
          key={provider.name}
          className="flex-row items-center justify-between py-5 px-6 border-b border-gray-100 bg-white"
          onPress={() => onProviderSelect(provider.name)}
          disabled={isLoading}
        >
          <View className="flex-row items-center">
            {renderProviderIcon(provider.name)}
            <Text className="ml-3 text-base font-medium text-gray-900">
              {provider.label}
            </Text>
          </View>
          <Text className="text-lg text-gray-400">›</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        className="flex-row items-center justify-between py-5 px-6 border-b border-gray-100 bg-white"
        onPress={onPasskeyLogin}
        disabled={isLoading}
      >
        <View className="flex-row items-center flex-1">
          <PasskeyIcon />
          <Text className="ml-3 text-base font-medium text-gray-900 flex-1">
            Continue with Passkey
          </Text>
        </View>
        <Text className="text-lg text-gray-400">›</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex-row items-center justify-between py-5 px-6 border-b-0 bg-white">
        <View className="flex-row items-center flex-1">
          <WalletIcon />
          <Text className="ml-3 text-base font-medium text-gray-900 flex-1">
            Continue with a wallet
          </Text>
        </View>
        <Text className="text-lg text-gray-400">›</Text>
      </TouchableOpacity>
    </View>
  );
}
