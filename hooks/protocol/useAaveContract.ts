import { useState, useCallback } from 'react';
import { usePrivyWallet } from '../usePrivyWallet';
import { ethers } from 'ethers';
import { VaultOperationParams, VaultOperationResult } from '@/types/vault';

interface AaveContractOperations {
  deposit: (params: VaultOperationParams) => Promise<VaultOperationResult>;
  withdraw: (params: VaultOperationParams) => Promise<VaultOperationResult>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useAaveContract(): AaveContractOperations {
  const {
    isLoading: walletLoading,
    error: walletError,
    accounts,
    sendTransaction,
    getAccounts,
    clearError: clearWalletError,
  } = usePrivyWallet();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
    clearWalletError();
  }, [clearWalletError]);

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
          'supply(address,uint256,address,uint16)': '0x617ba037',
          'withdraw(address,uint256,address)': '0x69328dec',
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

  // Aave Deposit
  const deposit = useCallback(
    async (params: VaultOperationParams): Promise<VaultOperationResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const { vault, amount, userAddress } = params;

        // Ensure there are accounts
        let currentAccounts = accounts;
        if (currentAccounts.length === 0) {
          currentAccounts = await getAccounts();
        }

        if (currentAccounts.length === 0) {
          throw new Error('No accounts available');
        }

        const targetAddress = userAddress || currentAccounts[0];
        const amountWei = parseAmount(amount, vault.decimals);

        console.log('Aave Deposit:', {
          vault: vault.marketAddress,
          asset: vault.asset,
          amount,
          amountWei,
          targetAddress,
        });

        // 1. Approve asset to Pool contract
        const approveData = encodeFunctionCall('approve(address,uint256)', [
          vault.protocolSpecific?.poolAddress,
          '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        ]);

        const approveTxHash = await sendTransaction({
          from: targetAddress,
          to: vault.asset,
          data: approveData,
        });

        console.log('✅ Approval transaction:', approveTxHash);

        // Wait for approval confirmation
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 2. Supply to Pool
        const supplyData = encodeFunctionCall(
          'supply(address,uint256,address,uint16)',
          [
            vault.asset,
            amountWei,
            targetAddress,
            0, // referralCode
          ]
        );

        const supplyTxHash = await sendTransaction({
          from: targetAddress,
          to: vault.protocolSpecific?.poolAddress,
          data: supplyData,
        });

        console.log('✅ Supply transaction:', supplyTxHash);

        return {
          success: true,
          txHash: supplyTxHash,
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
    [accounts, getAccounts, sendTransaction, parseAmount, encodeFunctionCall]
  );

  // Aave Withdraw
  const withdraw = useCallback(
    async (params: VaultOperationParams): Promise<VaultOperationResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const { vault, amount, userAddress } = params;

        // Ensure there are accounts
        let currentAccounts = accounts;
        if (currentAccounts.length === 0) {
          currentAccounts = await getAccounts();
        }

        if (currentAccounts.length === 0) {
          throw new Error('No accounts available');
        }

        const targetAddress = userAddress || currentAccounts[0];

        // Handle 'all' amount
        const amountWei =
          amount === 'all'
            ? '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
            : parseAmount(amount, vault.decimals);

        console.log('Aave Withdraw:', {
          vault: vault.marketAddress,
          asset: vault.asset,
          amount,
          amountWei,
          targetAddress,
        });

        // Withdraw from Pool
        const withdrawData = encodeFunctionCall(
          'withdraw(address,uint256,address)',
          [vault.asset, amountWei, targetAddress]
        );

        const txHash = await sendTransaction({
          from: targetAddress,
          to: vault.protocolSpecific?.poolAddress,
          data: withdrawData,
        });

        console.log('✅ Withdraw transaction:', txHash);

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
    [accounts, getAccounts, sendTransaction, parseAmount, encodeFunctionCall]
  );

  return {
    deposit,
    withdraw,
    isLoading: isLoading || walletLoading,
    error: error || walletError,
    clearError,
  };
}
