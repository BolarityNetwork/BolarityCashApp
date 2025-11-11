import { useState, useCallback } from 'react';
import { useLoginWithSiwe } from '@privy-io/expo';
import { useLogin } from '@privy-io/expo/ui';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { useSignMessage } from 'wagmi';
import { TakoToast } from '@/components/common/TakoToast';

const DEFAULT_CAIP_CHAIN_ID = 'eip155:1';

function toCaipChainId(value?: string | number | null): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `eip155:${value}`;
  }

  if (typeof value === 'string' && value.length > 0) {
    if (value.startsWith('eip155:')) {
      return value;
    }

    const parsed = value.startsWith('0x')
      ? parseInt(value, 16)
      : parseInt(value, 10);

    if (!Number.isNaN(parsed)) {
      return `eip155:${parsed}`;
    }
  }

  return DEFAULT_CAIP_CHAIN_ID;
}

interface AuthState {
  isLoading: boolean;
  error: string;
}

export function useAuth() {
  const { t } = useTranslation();
  const [state, setState] = useState<AuthState>({
    isLoading: false,
    error: '',
  });

  const setError = useCallback((message: string) => {
    setState({ isLoading: false, error: message });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
      error: loading ? '' : prev.error,
    }));
  }, []);

  // const { loginWithPasskey } = useLoginWithPasskey({
  //   onError: err => setError(err.message),
  // });

  const { login } = useLogin();
  const {
    generateSiweMessage,
    loginWithSiwe,
    state: siweState,
  } = useLoginWithSiwe();
  const { signMessageAsync } = useSignMessage();

  const siweDomain =
    Constants.expoConfig?.extra?.siweDomain ||
    Constants.expoConfig?.extra?.privyAppDomain ||
    'app.bolarity.xyz';
  const siweUri =
    Constants.expoConfig?.extra?.siweUri ||
    Constants.expoConfig?.extra?.privyAppUri ||
    `https://app.bolarity.xyz`;

  const handleEmailLogin = useCallback(async () => {
    setLoading(true);
    try {
      await login({ loginMethods: ['email'] });
    } catch (err: any) {
      setError(err.error || 'Login failed');
    }
  }, [login, setLoading, setError]);

  const handlePasskeyLogin = useCallback(async () => {
    TakoToast.show({
      type: 'normal',
      status: 'info',
      message: `Passkey ${t('actions.comingSoon')}`,
    });
    // TODO: Implement Passkey login
    // setLoading(true);
    // await loginWithPasskey({
    //   relyingParty: Constants.expoConfig?.extra?.passkeyAssociatedDomain,
    // });
  }, [t]);

  const loginWithWallet = useCallback(
    async ({
      address,
      domain,
      uri,
      chainId,
    }: {
      address?: string | null;
      domain?: string;
      uri?: string;
      chainId?: string | number | null;
    }) => {
      if (!address) {
        const message = t('auth.walletLoginFailed');
        setError(message);
        throw new Error('Wallet address is missing.');
      }

      setLoading(true);
      try {
        const normalizedChainId = toCaipChainId(chainId);
        console.log(12244, {
          wallet: {
            address,
            chainId: normalizedChainId,
          },
          from: {
            domain: domain || siweDomain,
            uri: uri || siweUri,
          },
        });

        const message = await generateSiweMessage({
          wallet: {
            address,
            chainId: normalizedChainId,
          },
          from: {
            domain: domain || siweDomain,
            uri: uri || siweUri,
          },
        });

        // const signature = await signMessageAsync({ message });
        const walletSignature = await signMessageAsync({
          message,
        });
        console.log(6666, { walletSignature });
        const user = await loginWithSiwe({
          signature: walletSignature,
        });
        console.log(5555, { user });

        TakoToast.show({
          type: 'normal',
          status: 'success',
          message: t('auth.walletLoginSuccess'),
        });
      } catch (err) {
        console.error(3333, err);
        if (!(err instanceof Error)) {
          throw err;
        }
        const message = err.message || t('auth.walletLoginFailed');
        setError(message);
        TakoToast.show({
          type: 'normal',
          status: 'error',
          message,
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      generateSiweMessage,
      loginWithSiwe,
      setLoading,
      siweDomain,
      siweUri,
      signMessageAsync,
      t,
    ]
  );

  return {
    ...state,
    handleEmailLogin,
    handlePasskeyLogin,
    loginWithWallet,
    siweState,
  };
}
