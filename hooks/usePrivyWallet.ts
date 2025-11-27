import { useState, useCallback } from 'react';
import { useEmbeddedEthereumWallet } from '@privy-io/expo';
import { ensureBiometricsBeforeTx } from '@/utils/ensureBiometricsBeforeTx';

interface TransactionParams {
  from: string;
  to: string;
  value?: string;
  gas?: string;
  gasPrice?: string;
  data?: string;
}

interface WalletHookReturn {
  isLoading: boolean;
  error: string | null;
  accounts: string[];

  getAccounts: () => Promise<string[]>;
  signMessage: (message: string) => Promise<string>;
  sendTransaction: (params: TransactionParams) => Promise<string>;
  clearError: () => void;
}

export function usePrivyWallet(): WalletHookReturn {
  const { wallets } = useEmbeddedEthereumWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getAccounts = useCallback(async (): Promise<string[]> => {
    if (!wallets || wallets.length === 0) {
      throw new Error('No embedded wallets available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const provider = await wallets[0].getProvider();
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      setAccounts(accounts);
      return accounts;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get accounts';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallets]);

  const signMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!wallets || wallets.length === 0) {
        throw new Error('No embedded wallets available');
      }

      setIsLoading(true);
      setError(null);

      try {
        const provider = await wallets[0].getProvider();

        // Ensure there are accounts
        let currentAccounts = accounts;
        if (currentAccounts.length === 0) {
          currentAccounts = await getAccounts();
        }

        if (currentAccounts.length === 0) {
          throw new Error('No accounts available for signing');
        }

        const signature = await provider.request({
          method: 'personal_sign',
          params: [message, currentAccounts[0]],
        });

        return signature;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to sign message';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [wallets, accounts, getAccounts]
  );

  const sendTransaction = useCallback(
    async (params: TransactionParams): Promise<string> => {
      if (!wallets || wallets.length === 0) {
        throw new Error('No embedded wallets available');
      }

      setIsLoading(true);
      setError(null);

      try {
        // Require biometric authentication before transaction
        await ensureBiometricsBeforeTx();

        const provider = await wallets[0].getProvider();

        // Ensure there are accounts
        let currentAccounts = accounts;
        if (currentAccounts.length === 0) {
          currentAccounts = await getAccounts();
        }

        if (currentAccounts.length === 0) {
          throw new Error('No accounts available for transaction');
        }

        // Build transaction parameters
        const transactionParams = {
          from: params.from || currentAccounts[0],
          to: params.to,
          value: params.value || '0x0',
          gas: params.gas,
          gasPrice: params.gasPrice,
          data: params.data,
        };

        // Remove undefined values
        Object.keys(transactionParams).forEach(key => {
          if (
            transactionParams[key as keyof typeof transactionParams] ===
            undefined
          ) {
            delete transactionParams[key as keyof typeof transactionParams];
          }
        });

        const response = await provider.request({
          method: 'eth_sendTransaction',
          params: [transactionParams],
        });

        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to send transaction';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [wallets, accounts, getAccounts]
  );

  return {
    isLoading,
    error,
    accounts,
    getAccounts,
    signMessage,
    sendTransaction,
    clearError,
  };
}
