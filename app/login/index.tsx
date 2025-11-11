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
import { usePersistedPrivyUser } from '@/hooks/usePersistedPrivyUser';
import { Redirect } from 'expo-router';
import WalletIcon from '@/assets/icon/login/wallet.svg';
import PasskeyIcon from '@/assets/icon/login/passkey.svg';
import EmailIcon from '@/assets/icon/login/email.svg';
import SmsIcon from '@/assets/icon/login/sms.svg';
import { usePrivy } from '@privy-io/expo';
import {
  useAccount,
  useAppKit,
  useAppKitState,
} from '@reown/appkit-react-native';
import { useFullScreenLoading } from '@/hooks/useFullScreenLoading';
import { useTranslation } from 'react-i18next';
import { TakoToast } from '@/components/common/TakoToast';
import Constants from 'expo-constants';

const SIWE_DOMAIN =
  Constants.expoConfig?.extra?.siweDomain ||
  Constants.expoConfig?.extra?.privyAppDomain ||
  'app.bolarity.xyz';
const SIWE_URI =
  Constants.expoConfig?.extra?.siweUri ||
  Constants.expoConfig?.extra?.privyAppUri ||
  `https://app.bolarity.xyz`;

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
    handleEmailLogin,
    handlePasskeyLogin,
    loginWithWallet,
    siweState,
  } = useAuth();
  const { user } = usePersistedPrivyUser();
  const { address, isConnected, chainId, namespace } = useAccount();
  const { open, close } = useAppKit();
  const { isLoading: isAppKitLoading } = useAppKitState();
  const walletLoginAttemptRef = React.useRef(false);

  const siweInProgress =
    siweState.status === 'generating-message' ||
    siweState.status === 'awaiting-signature' ||
    siweState.status === 'submitting-signature';

  const handleWalletPress = React.useCallback(() => {
    try {
      open();
    } catch (_err: any) {
      TakoToast.show({
        type: 'normal',
        status: 'error',
        message: _err?.message || t('errors.walletConnectionFailed'),
      });
    }
  }, [open, t]);

  React.useEffect(() => {
    if (user) {
      walletLoginAttemptRef.current = false;
      return;
    }

    if (!isConnected || !address || namespace !== 'eip155') {
      if (!isConnected) {
        walletLoginAttemptRef.current = false;
      }
      return;
    }

    if (walletLoginAttemptRef.current) {
      return;
    }

    let cancelled = false;
    walletLoginAttemptRef.current = true;

    (async () => {
      try {
        await loginWithWallet({
          address,
          domain: SIWE_DOMAIN,
          uri: SIWE_URI,
          chainId,
        });
        if (!cancelled) {
          close();
        }
      } catch (_err) {
        if (!cancelled) {
          walletLoginAttemptRef.current = false;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, isConnected, address, loginWithWallet, close, chainId, namespace]);

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
              {t('auth.otherOptions')}
            </Text>
          </View>

          <View className="bg-white rounded-2xl mx-1 shadow-sm overflow-hidden">
            <WalletOptions
              isLoading={isLoading}
              isAppKitLoading={isAppKitLoading}
              isSiweInProgress={siweInProgress}
              onPasskeyLogin={handlePasskeyLogin}
              onWalletPress={handleWalletPress}
            />
          </View>
        </ScrollView>
      </View>
    </>
  );
}

function Header() {
  const { t } = useTranslation();
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
        {t('auth.pageTitle')}
      </Text>
    </View>
  );
}

function PrimaryActions({ isLoading, onEmailLogin }: any) {
  const { t } = useTranslation();
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
            {t('auth.continueWithEmail')}
          </Text>
        </View>
        <Text className="text-lg text-gray-400">{t('common.submit')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-row items-center justify-between py-5 px-6 border-b-0 bg-white"
        onPress={() => {
          TakoToast.show({
            type: 'normal',
            status: 'info',
            message: `SMS ${t('actions.comingSoon')}`,
          });
          // TODO: Implement SMS login
        }}
        disabled={isLoading}
      >
        <View className="flex-row items-center flex-1">
          <SmsIcon />
          <Text className="ml-3 text-base font-medium text-gray-900 flex-1">
            {t('auth.continueWithSMS')}
          </Text>
        </View>
        <Text className="text-lg text-gray-400">›</Text>
      </TouchableOpacity>
    </View>
  );
}

function WalletOptions({
  isLoading,
  isAppKitLoading,
  isSiweInProgress,
  onPasskeyLogin,
  onWalletPress,
}: {
  isLoading: boolean;
  isAppKitLoading: boolean;
  isSiweInProgress: boolean;
  onPasskeyLogin: () => void;
  onWalletPress: () => void;
}) {
  const { t } = useTranslation();
  const walletDisabled = isLoading || isAppKitLoading || isSiweInProgress;

  return (
    <View className="bg-white">
      <TouchableOpacity
        className="flex-row items-center justify-between py-5 px-6 border-b border-gray-100 bg-white"
        onPress={onPasskeyLogin}
        disabled={isLoading}
      >
        <View className="flex-row items-center flex-1">
          <PasskeyIcon />
          <Text className="ml-3 text-base font-medium text-gray-900 flex-1">
            {t('auth.continueWithPasskey')}
          </Text>
        </View>
        <Text className="text-lg text-gray-400">›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-row items-center justify-between py-5 px-6 border-b-0 bg-white"
        onPress={onWalletPress}
        disabled={walletDisabled}
      >
        <View className="flex-row items-center flex-1">
          <WalletIcon />
          <Text className="ml-3 text-base font-medium text-gray-900 flex-1">
            {t('auth.continueWithWallet')}
          </Text>
        </View>
        <Text className="text-lg text-gray-400">›</Text>
      </TouchableOpacity>
    </View>
  );
}
