import { useState, useCallback } from "react";
import { LoginWithOAuthInput, useLoginWithOAuth } from "@privy-io/expo";
import { useLogin } from "@privy-io/expo/ui";
import { useLoginWithPasskey } from "@privy-io/expo/passkey";
import Constants from "expo-constants";

interface AuthState {
  isLoading: boolean;
  error: string;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isLoading: false,
    error: "",
  });

  const setError = useCallback((message: string) => {
    setState({ isLoading: false, error: message });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading, error: loading ? "" : prev.error }));
  }, []);

  const { loginWithPasskey } = useLoginWithPasskey({
    onError: (err) => setError(err.message),
  });

  const { login } = useLogin();
  
  const oauth = useLoginWithOAuth({
    onError: (err) => setError(err.message),
  });

  const handleEmailLogin = useCallback(async () => {
    setLoading(true);
    try {
      await login({ loginMethods: ["email"] });
    } catch (err: any) {
      setError(err.error || "Login failed");
    }
  }, [login, setLoading, setError]);

  const handlePasskeyLogin = useCallback(async () => {
    setLoading(true);
    await loginWithPasskey({
      relyingParty: Constants.expoConfig?.extra?.passkeyAssociatedDomain,
    });
  }, [loginWithPasskey, setLoading]);

  const handleOAuthLogin = useCallback(async (provider: string) => {
    setLoading(true);
    await oauth.login({ provider } as LoginWithOAuthInput);
  }, [oauth, setLoading]);

  return {
    ...state,
    oauthLoading: oauth.state.status === "loading",
    handleEmailLogin,
    handlePasskeyLogin,
    handleOAuthLogin,
  };
}