import { useState, useCallback, useMemo } from 'react';
import { usePrivyWallet } from '../usePrivyWallet';
import { ethers } from 'ethers';
import { VaultOperationParams, VaultOperationResult } from '@/types/vault';
import { useAlchemy7702Gasless } from '@/hooks/transactions/useAlchemy7702Gasless';
import { base } from '@account-kit/infra';

interface CompoundContractOperations {
  deposit: (params: VaultOperationParams) => Promise<VaultOperationResult>;
  withdraw: (params: VaultOperationParams) => Promise<VaultOperationResult>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const ZERO_ADDRESS =
  '0x0000000000000000000000000000000000000000' as `0x${string}`;

export function useCompoundContract(): CompoundContractOperations {
  const {
    isLoading: walletLoading,
    error: walletError,
    accounts,
    getAccounts,
    clearError: clearWalletError,
  } = usePrivyWallet();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gaslessOptions = useMemo(
    () => ({
      chain: base,
      apiKey: process.env.EXPO_PUBLIC_ALCHEMY_API_KEY ?? '',
      policyId: process.env.EXPO_PUBLIC_ALCHEMY_POLICY_ID ?? '',
      implementationAddress: (process.env
        .EXPO_PUBLIC_ALCHEMY_IMPLEMENTATION_ADDRESS ??
        ZERO_ADDRESS) as `0x${string}`,
    }),
    []
  );

  const {
    isInitializing: isGaslessInitializing,
    isSending: isGaslessSending,
    error: gaslessError,
    smartAccountAddress,
    sendGaslessTransaction,
  } = useAlchemy7702Gasless(gaslessOptions);

  const clearError = useCallback(() => {
    setError(null);
    clearWalletError();
  }, [clearWalletError]);

  const validateGaslessConfig = useCallback(() => {
    if (
      !gaslessOptions.apiKey ||
      !gaslessOptions.policyId ||
      gaslessOptions.implementationAddress === ZERO_ADDRESS
    ) {
      throw new Error('Missing 7702 gasless configuration');
    }
  }, [gaslessOptions]);

  const resolveTargetAddress = useCallback(
    async (overrideAddress?: string): Promise<`0x${string}`> => {
      if (overrideAddress) return overrideAddress as `0x${string}`;
      if (smartAccountAddress) return smartAccountAddress;

      let currentAccounts = accounts;
      if (currentAccounts.length === 0) {
        currentAccounts = await getAccounts();
      }

      if (currentAccounts.length === 0) {
        throw new Error('No accounts available');
      }

      return currentAccounts[0] as `0x${string}`;
    },
    [accounts, getAccounts, smartAccountAddress]
  );

  // Parse amount to wei
  const parseAmount = useCallback(
    (amount: string, decimals: number): string => {
      const num = parseFloat(amount);
      const multiplier = Math.pow(10, decimals);
      return Math.floor(num * multiplier).toString();
    },
    []
  );

  // Use ethers.js ABI encoder
  const encodeFunctionCall = useCallback(
    (methodSignature: string, params: any[]): string => {
      try {
        const iface = new ethers.Interface([`function ${methodSignature}`]);
        const encodedData = iface.encodeFunctionData(
          methodSignature.split('(')[0],
          params
        );
        return encodedData;
      } catch (error) {
        console.error('ABI encoding error:', error);
        // Fallback to simplified encoding
        const methodIds: { [key: string]: string } = {
          'approve(address,uint256)': '0x095ea7b3',
          'supply(address,uint256)': '0x6b9f96ea',
          'withdraw(address,uint256)': '0x693ec85e',
        };

        const methodId = methodIds[methodSignature] || '0x00000000';
        let data = methodId.slice(2);

        params.forEach(param => {
          if (typeof param === 'string') {
            if (param.startsWith('0x') && param.length === 42) {
              data += param.slice(2).toLowerCase().padStart(64, '0');
            } else if (param.startsWith('0x')) {
              data += param.slice(2).padStart(64, '0');
            } else {
              const num = BigInt(param).toString(16);
              data += num.padStart(64, '0');
            }
          } else if (typeof param === 'number') {
            const num = BigInt(param).toString(16);
            data += num.padStart(64, '0');
          } else if (typeof param === 'boolean') {
            data += (param ? '1' : '0').padStart(64, '0');
          }
        });

        return '0x' + data;
      }
    },
    []
  );

  // Compound Deposit
  const deposit = useCallback(
    async (params: VaultOperationParams): Promise<VaultOperationResult> => {
      setIsLoading(true);
      setError(null);

      try {
        validateGaslessConfig();

        const { vault, amount, userAddress } = params;
        await resolveTargetAddress(userAddress);
        const amountWei = parseAmount(amount, vault.decimals);

        const approveData = encodeFunctionCall('approve(address,uint256)', [
          vault.protocolSpecific?.cometAddress,
          '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        ]);

        const supplyData = encodeFunctionCall('supply(address,uint256)', [
          vault.asset,
          amountWei,
        ]);

        // 将 approve 和 supply 合并为一个 batch 交易，只需一次人脸识别
        const txHash = await sendGaslessTransaction([
          {
            to: vault.asset as `0x${string}`,
            data: approveData as `0x${string}`,
            value: 0n,
          },
          {
            to: vault.protocolSpecific?.cometAddress as `0x${string}`,
            data: supplyData as `0x${string}`,
            value: 0n,
          },
        ]);

        return {
          success: true,
          txHash,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Deposit failed';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [
      parseAmount,
      encodeFunctionCall,
      resolveTargetAddress,
      sendGaslessTransaction,
      validateGaslessConfig,
    ]
  );

  // Compound Withdraw
  const withdraw = useCallback(
    async (params: VaultOperationParams): Promise<VaultOperationResult> => {
      setIsLoading(true);
      setError(null);

      try {
        validateGaslessConfig();

        const { vault, amount, userAddress } = params;

        await resolveTargetAddress(userAddress);
        const amountWei = parseAmount(amount, vault.decimals);

        const withdrawData = encodeFunctionCall('withdraw(address,uint256)', [
          vault.asset,
          amountWei,
        ]);

        const txHash = await sendGaslessTransaction([
          {
            to: vault.protocolSpecific?.cometAddress as `0x${string}`,
            data: withdrawData as `0x${string}`,
            value: 0n,
          },
        ]);

        return {
          success: true,
          txHash,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Withdraw failed';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [
      parseAmount,
      encodeFunctionCall,
      resolveTargetAddress,
      sendGaslessTransaction,
      validateGaslessConfig,
    ]
  );

  return {
    deposit,
    withdraw,
    isLoading:
      isLoading || walletLoading || isGaslessInitializing || isGaslessSending,
    error: error || walletError || gaslessError,
    clearError,
  };
}
