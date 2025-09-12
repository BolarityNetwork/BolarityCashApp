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

export const OAUTH_PROVIDERS = [
  {
    name: 'google',
    label: 'Google',
    colors: ['#4285F4', '#34A853'] as const,
    icon: '🔍',
  },
  {
    name: 'apple',
    label: 'Continue with Apple',
    colors: ['#000', '#333'] as const,
    icon: '🍎',
  },
  {
    name: 'discord',
    label: 'Continue with Discord',
    colors: ['#5865F2', '#7289DA'] as const,
    icon: '🎮',
  },
] as const;

export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number]['name'];

export default function LoginScreen() {
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

          <ErrorDisplay error={error} />
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
          <View className="w-5 h-5 mr-4 items-center justify-center">
            <View className="w-4.5 h-3.5 border-2 border-gray-500 rounded bg-transparent relative items-center justify-center">
              <View className="absolute top-0.5 w-0 h-0 border-l-1.5 border-r-1.5 border-t-1 border-l-transparent border-r-transparent border-t-gray-500" />
            </View>
          </View>
          <Text className="text-base font-medium text-gray-900 flex-1">
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
          <View className="w-5 h-5 mr-4 items-center justify-center">
            <View className="w-3 h-4.5 border-2 border-gray-500 rounded-sm bg-transparent items-center justify-between py-0.5">
              <View className="w-1.75 h-2.5 bg-gray-100 rounded-sm" />
              <View className="w-0.75 h-0.75 rounded-full border border-gray-500 bg-transparent" />
            </View>
          </View>
          <Text className="text-base font-medium text-gray-900 flex-1">
            Continue with SMS
          </Text>
        </View>
        <Text className="text-lg text-gray-400">›</Text>
      </TouchableOpacity>
    </View>
  );
}

// Logo Components
function GoogleLogo() {
  return (
    <View className="w-5 h-5 mr-4 items-center justify-center">
      <Image
        source={require('@/assets/logos/google.png')}
        style={{ width: 18, height: 18 }}
        resizeMode="contain"
      />
    </View>
  );
}

function AppleLogo() {
  return (
    <View className="w-5 h-5 mr-4 items-center justify-center">
      <Image
        source={require('@/assets/logos/apple.png')}
        style={{ width: 18, height: 18 }}
        resizeMode="contain"
      />
    </View>
  );
}

function DiscordLogo() {
  return (
    <View className="w-5 h-5 mr-4 items-center justify-center">
      <Image
        source={require('@/assets/logos/discord.png')}
        style={{ width: 18, height: 18 }}
        resizeMode="contain"
      />
    </View>
  );
}

function FingerprintIcon() {
  return (
    <View className="w-5 h-5 mr-4 items-center justify-center">
      <View className="absolute w-4 h-4 rounded-full border-2 border-gray-500 border-dashed" />
      <View className="absolute w-3 h-3 rounded-full border-2 border-gray-500" />
      <View className="absolute w-2 h-2 rounded-full border-2 border-gray-500" />
      <View className="absolute w-1 h-1 rounded-full bg-gray-500" />
    </View>
  );
}

function WalletIcon() {
  return (
    <View className="w-5 h-5 mr-4 items-center justify-center">
      <View className="w-4 h-3 border-2 border-gray-500 rounded-sm bg-transparent relative">
        <View className="absolute -top-0.5 left-0.5 right-0.5 h-0.75 bg-gray-50 border-t-2 border-l-2 border-r-2 border-gray-500 rounded-t-sm" />
        <View className="absolute bottom-0.5 left-0.5 w-2 h-0.5 bg-gray-500 rounded-sm" />
      </View>
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
        return <GoogleLogo />;
      case 'apple':
        return <AppleLogo />;
      case 'discord':
        return <DiscordLogo />;
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
            <Text className="text-base font-medium text-gray-900">
              {provider.label}
            </Text>
          </View>
          {provider.name === 'google' && (
            <View className="bg-gray-100 rounded-xl px-3 py-1 mr-2">
              <Text className="text-xs text-gray-500 font-medium">Recent</Text>
            </View>
          )}
          <Text className="text-lg text-gray-400">›</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        className="flex-row items-center justify-between py-5 px-6 border-b border-gray-100 bg-white"
        onPress={onPasskeyLogin}
        disabled={isLoading}
      >
        <View className="flex-row items-center flex-1">
          <FingerprintIcon />
          <Text className="text-base font-medium text-gray-900 flex-1">
            Continue with Passkey
          </Text>
        </View>
        <Text className="text-lg text-gray-400">›</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex-row items-center justify-between py-5 px-6 border-b-0 bg-white">
        <View className="flex-row items-center flex-1">
          <WalletIcon />
          <Text className="text-base font-medium text-gray-900 flex-1">
            Continue with a wallet
          </Text>
        </View>
        <Text className="text-lg text-gray-400">›</Text>
      </TouchableOpacity>
    </View>
  );
}
