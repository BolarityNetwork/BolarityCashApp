import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
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
import { useTranslation } from 'react-i18next';
import { TakoToast } from '@/components/common/TakoToast';
import { ShadowCard } from '@/components/common/ShadowCard';
import { CommonSafeAreaView } from '@/components/CommonSafeAreaView';

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
  const { t } = useTranslation();

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

  // Show error toast when there's an error
  React.useEffect(() => {
    const errorMessage = error || (privyError ? privyError.message : '');
    if (errorMessage) {
      TakoToast.show({
        type: 'normal',
        status: 'error',
        message: errorMessage,
      });
    }
  }, [error, privyError]);

  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <CommonSafeAreaView className="bg-[#F9FAFC]">
      <View className="flex-1 px-5">
        <Header className="mt-[30px]" />
        <ShadowCard borderRadius={20} className="mt-[50px]">
          <PrimaryActions
            isLoading={isLoading}
            onEmailLogin={handleEmailLogin}
          />
        </ShadowCard>

        <View className="flex-row items-center justify-between mt-[50px] px-[10px]">
          <View className="w-[100px] h-[1px] bg-[#EBEBEB] mr-[12px]" />
          <Text className="text-[10px] text-[#ACB3BE]">
            {t('auth.otherOptions')}
          </Text>
          <View className="w-[100px] h-[1px] bg-[#EBEBEB] ml-[12px]" />
        </View>
        <OAuthSection
          providers={OAUTH_PROVIDERS}
          isLoading={isLoading || oauthLoading}
          onProviderSelect={handleOAuthLogin}
          onPasskeyLogin={handlePasskeyLogin}
        />
      </View>
    </CommonSafeAreaView>
  );
}

function Header({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <View className={`items-center ${className}`}>
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
        {t('auth.pageTitle')}
      </Text>
    </View>
  );
}

function PrimaryActions({ isLoading, onEmailLogin }: any) {
  const { t } = useTranslation();
  return (
    <View className="pt-[3px] bg-white px-5 rounded-[20px]">
      <TouchableOpacity
        className="flex-row items-center justify-between pl-[3px] pr-[7px] py-[20px]"
        onPress={onEmailLogin}
        disabled={isLoading}
      >
        <View className="flex-row items-center flex-1">
          <EmailIcon />
          <Text className="ml-[14px] text-[12px] text-[#DADADA] font-[600] flex-1">
            your@emsil.com
          </Text>
        </View>
        <Text className="text-[12px] text-[#ACB3BF] font-[600]">
          {t('common.submit')}
        </Text>
      </TouchableOpacity>

      <View
        className="flex-row items-center overflow-hidden"
        style={{ height: 1 }}
      >
        {Array.from({ length: 100 }).map((_, i) => (
          <View key={i} className="bg-[#DADADA] w-[3px] h-[1px] mr-[2px]" />
        ))}
      </View>

      <TouchableOpacity
        className="flex-row items-center justify-between py-[20px] pl-[1px] pr-1"
        onPress={() => {
          TakoToast.show({
            type: 'normal',
            status: 'info',
            message: `SMS ${t('actions.comingSoon')}`,
          });
          // TODO: Implement SMS login
        }}
        disabled={isLoading}
        style={{ paddingVertical: 0 }}
      >
        <View className="flex-row items-center flex-1">
          <SmsIcon />
          <Text className="ml-3 text-[12px] text-[#DADADA] font-[600] flex-1">
            {t('auth.continueWithSMS')}
          </Text>
        </View>
        <Text
          style={{
            color: '#DADADA',
            fontSize: 16,
          }}
        >
          ›
        </Text>
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
  const { t } = useTranslation();

  const renderProviderIcon = (providerName: string) => {
    switch (providerName) {
      case 'google':
        return <GoogleIcon />;
      case 'apple':
        return <AppleIcon />;
      case 'discord':
        return <DiscordIcon />;
      default:
        return null;
    }
  };

  const getProviderLabel = (providerName: string) => {
    if (providerName === 'google') return t('auth.google');
    if (providerName === 'apple') return t('auth.apple');
    if (providerName === 'discord') return t('auth.discord');
    return providerName;
  };

  const oauthOptions = [
    ...providers.map((p: any) => ({
      type: 'oauth' as const,
      name: p.name,
      label: getProviderLabel(p.name),
      icon: renderProviderIcon(p.name),
      onPress: () => onProviderSelect(p.name),
    })),
    {
      type: 'passkey' as const,
      name: 'passkey',
      label: t('auth.continueWithPasskey'),
      icon: <PasskeyIcon />,
      onPress: onPasskeyLogin,
    },
    {
      type: 'wallet' as const,
      name: 'wallet',
      label: t('auth.continueWithWallet'),
      icon: <WalletIcon />,
      onPress: () => {
        TakoToast.show({
          type: 'normal',
          status: 'info',
          message: `Wallet ${t('actions.comingSoon')}`,
        });
      },
    },
  ];

  return (
    <View className="justify-start mt-6 flex-row flex-wrap px-[33px]">
      {oauthOptions.map((option, index) => (
        <TouchableOpacity
          key={option.name}
          className="items-center"
          style={{
            width: 83,
            marginRight: index % 3 === 2 ? 0 : 20,
            marginBottom: index < 3 ? 24 : 0,
            paddingVertical: 12,
          }}
          onPress={option.onPress}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          {option.icon}
          <Text className="text-[12px] text-[#ACB3BE] mt-[5px] leading-[17px]">
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
