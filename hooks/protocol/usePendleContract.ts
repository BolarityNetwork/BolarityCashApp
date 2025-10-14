import { useState, useCallback } from 'react';
import { usePrivyWallet } from '../usePrivyWallet';
import { ethers } from 'ethers';
import { VaultOperationParams, VaultOperationResult } from '@/types/vault';

interface PendleContractOperations {
  deposit: (params: VaultOperationParams) => Promise<VaultOperationResult>;
  withdraw: (params: VaultOperationParams) => Promise<VaultOperationResult>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

// Pendle constants
const PENDLE_ROUTER = '0x888888888889758F76e7103c6CbF23ABbF58F946';
const PENDLE_API_BASE = 'https://api-v2.pendle.finance';

export function usePendleContract(): PendleContractOperations {
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

  // Get swap quote from Pendle API
  const getSwapQuote = useCallback(
    async (
      tokenIn: string,
      tokenOut: string,
      amountIn: string,
      marketAddress: string,
      chainId: number,
      slippage: number = 0.01,
      receiver: string
    ) => {
      try {
        // 使用固定的 market address (USDe Dec 2025)
        const pendleMarket = '0x8991847176b1d187e403dd92a4e55fc8d7684538';

        // 构建完整的URL（不使用axios的params，手动构建query string）
        const queryParams = new URLSearchParams({
          receiver,
          slippage: slippage.toString(),
          tokenIn,
          tokenOut,
          amountIn,
          enableAggregator: 'true',
        });

        const url = `${PENDLE_API_BASE}/core/v2/sdk/${chainId}/markets/${pendleMarket}/swap?${queryParams.toString()}`;

        console.log('📡 Pendle API Request:', url);

        // 使用 fetch 而不是 axios，添加正确的 headers
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Pendle API error response:', errorText);
          throw new Error(
            `Pendle API error: ${response.status} ${response.statusText}`
          );
        }

        const result = await response.json();
        console.log('✅ Pendle swap quote:', result);

        return result;
      } catch (error) {
        console.error('❌ Pendle API error:', error);
        throw error;
      }
    },
    []
  );

  // Pendle Deposit (Buy PT tokens)
  const deposit = useCallback(
    async (params: VaultOperationParams): Promise<VaultOperationResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const { vault, amount, userAddress } = params;

        // Validate minimum amount for Pendle (at least $0.01)
        const numAmount = parseFloat(amount);
        if (numAmount < 0.01) {
          throw new Error('Pendle requires minimum deposit of $0.01 USD');
        }

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

        console.log('Pendle Deposit:', {
          vault: vault.marketAddress,
          asset: vault.asset,
          pt: vault.protocolSpecific?.ptAddress,
          amount,
          amountWei,
          targetAddress,
        });

        // Get swap quote from Pendle API
        const swapQuote = await getSwapQuote(
          vault.asset, // tokenIn (USDC)
          vault.protocolSpecific?.ptAddress || '', // tokenOut (PT)
          amountWei,
          vault.marketAddress,
          vault.chainId,
          0.01, // 1% slippage
          targetAddress
        );

        console.log('Pendle swap quote:', swapQuote);

        // 1. Handle token approvals
        if (swapQuote.tokenApprovals && swapQuote.tokenApprovals.length > 0) {
          for (const approval of swapQuote.tokenApprovals) {
            const approveData = encodeFunctionCall('approve(address,uint256)', [
              approval.spender || PENDLE_ROUTER,
              '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            ]);

            const approveTxHash = await sendTransaction({
              from: targetAddress,
              to: approval.token,
              data: approveData,
            });

            console.log('✅ Approval transaction:', approveTxHash);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }

        // 2. Execute swap via Pendle Router
        const swapTxHash = await sendTransaction({
          from: targetAddress,
          to: swapQuote.tx.to,
          data: swapQuote.tx.data,
          value: swapQuote.tx.value || 0,
        });

        console.log('✅ Pendle swap transaction:', swapTxHash);

        return {
          success: true,
          txHash: swapTxHash,
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
      accounts,
      getAccounts,
      sendTransaction,
      parseAmount,
      encodeFunctionCall,
      getSwapQuote,
    ]
  );

  // Pendle Withdraw (Redeem PT tokens)
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

        console.log('Pendle Withdraw:', {
          vault: vault.marketAddress,
          yt: vault.protocolSpecific?.ytAddress,
          amount,
          targetAddress,
        });

        // Get redeem quote from Pendle API
        const url = `${PENDLE_API_BASE}/core/v2/sdk/${vault.chainId}/redeem`;
        const amountWei = parseAmount(amount, vault.decimals);

        const params_query = new URLSearchParams({
          receiver: targetAddress,
          slippage: '0.01',
          enableAggregator: 'true',
          yt: vault.protocolSpecific?.ytAddress || '',
          amountIn: amountWei,
        });

        if (vault.asset) {
          params_query.append('tokenOut', vault.asset);
        }

        const response = await fetch(url + '?' + params_query.toString());
        if (!response.ok) {
          throw new Error(`Pendle redeem API error: ${response.statusText}`);
        }

        const redeemQuote = await response.json();
        console.log('Pendle redeem quote:', redeemQuote);

        // 1. Handle token approvals
        if (
          redeemQuote.tokenApprovals &&
          redeemQuote.tokenApprovals.length > 0
        ) {
          for (const approval of redeemQuote.tokenApprovals) {
            const approveData = encodeFunctionCall('approve(address,uint256)', [
              approval.spender || PENDLE_ROUTER,
              '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            ]);

            const approveTxHash = await sendTransaction({
              from: targetAddress,
              to: approval.token,
              data: approveData,
            });

            console.log('✅ Approval transaction:', approveTxHash);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }

        // 2. Execute redeem via Pendle Router
        const redeemTxHash = await sendTransaction({
          from: targetAddress,
          to: redeemQuote.tx.to,
          data: redeemQuote.tx.data,
          value: redeemQuote.tx.value || 0,
        });

        console.log('✅ Pendle redeem transaction:', redeemTxHash);

        return {
          success: true,
          txHash: redeemTxHash,
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
