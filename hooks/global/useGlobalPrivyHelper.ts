// hooks/global/useGlobalPrivyHelper.ts
import { usePrivy } from '@privy-io/expo';
import { useCallback, useState, useEffect } from 'react';

export const useGlobalPrivyHelper = () => {
  const { user, ready, getAccessToken } = usePrivy();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const getPrivyAccessToken = useCallback(async () => {
    try {
      if (ready && user) {
        const token = await getAccessToken();
        setAccessToken(token);
        return token;
      }
      return null;
    } catch (error) {
      console.error('Failed to get Privy access token:', error);
      return null;
    }
  }, [ready, user, getAccessToken]);

  useEffect(() => {
    if (ready && user) {
      getPrivyAccessToken();
    }
  }, [ready, user, getPrivyAccessToken]);

  return {
    ready,
    user,
    accessToken,
    getPrivyAccessToken,
  };
};
