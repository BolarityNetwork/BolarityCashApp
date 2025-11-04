import { useState, useCallback } from 'react';
// import { LoginWithOAuthInput, useLoginWithOAuth } from '@privy-io/expo';
import { useLogin } from '@privy-io/expo/ui';
// import { useLoginWithPasskey } from '@privy-io/expo/passkey';
// import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { TakoToast } from '@/components/common/TakoToast';

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

  // const oauth = useLoginWithOAuth({
  //   onError: err => setError(err.message),
  // });

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

  const handleOAuthLogin = useCallback(
    async (provider: string) => {
      const providerName =
        provider.charAt(0).toUpperCase() + provider.slice(1).toLowerCase();
      TakoToast.show({
        type: 'normal',
        status: 'info',
        message: `${providerName} ${t('actions.comingSoon')}`,
      });
      // TODO: Implement OAuth login
      // setLoading(true);
      // await oauth.login({ provider } as LoginWithOAuthInput);
    },
    [t]
  );

  return {
    ...state,
    // oauthLoading: oauth.state.status === 'loading',
    oauthLoading: false, // TODO: Return actual oauth loading state when implemented
    handleEmailLogin,
    handlePasskeyLogin,
    handleOAuthLogin,
  };
}
