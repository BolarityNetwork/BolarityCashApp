import { useState, useCallback, useMemo } from 'react';
import { usePrivyWallet } from '../usePrivyWallet';
import { ethers } from 'ethers';
import { VaultOperationParams, VaultOperationResult } from '@/types/vault';
import { useAlchemy7702Gasless } from '@/hooks/transactions/useAlchemy7702Gasless';
import { base } from '@account-kit/infra';

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

const ZERO_ADDRESS =
  '0x0000000000000000000000000000000000000000' as `0x${string}`;

export function usePendleContract(): PendleContractOperations {
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
        validateGaslessConfig();

        const { vault, amount, userAddress } = params;

        // Validate minimum amount for Pendle (at least $0.01)
        const numAmount = parseFloat(amount);
        if (numAmount < 0.01) {
          throw new Error('Pendle requires minimum deposit of $0.01 USD');
        }

        const targetAddress = await resolveTargetAddress(userAddress);
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

        // 构建批量交易：包含所有 approvals 和 swap
        const batchCalls: Array<{
          to: `0x${string}`;
          data: `0x${string}`;
          value: bigint;
        }> = [];

        // 1. 添加所有 token approvals
        if (swapQuote.tokenApprovals && swapQuote.tokenApprovals.length > 0) {
          for (const approval of swapQuote.tokenApprovals) {
            const approveData = encodeFunctionCall('approve(address,uint256)', [
              approval.spender || PENDLE_ROUTER,
              '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            ]);

            batchCalls.push({
              to: approval.token as `0x${string}`,
              data: approveData as `0x${string}`,
              value: 0n,
            });
          }
        }

        // 2. 添加 swap 交易
        batchCalls.push({
          to: (swapQuote.tx.to || PENDLE_ROUTER) as `0x${string}`,
          data: (swapQuote.tx.data || '0x') as `0x${string}`,
          value: BigInt(swapQuote.tx.value ?? 0),
        });

        // 将所有操作合并为一个 batch 交易，只需一次人脸识别
        const txHash = await sendGaslessTransaction(batchCalls);

        console.log('✅ Pendle batch transaction:', txHash);

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
      getSwapQuote,
      resolveTargetAddress,
      sendGaslessTransaction,
      validateGaslessConfig,
    ]
  );

  // Pendle Withdraw (Redeem PT tokens)
  const withdraw = useCallback(
    async (params: VaultOperationParams): Promise<VaultOperationResult> => {
      setIsLoading(true);
      setError(null);

      try {
        validateGaslessConfig();

        const { vault, amount, userAddress } = params;

        const targetAddress = await resolveTargetAddress(userAddress);

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

        // 构建批量交易：包含所有 approvals 和 redeem
        const batchCalls: Array<{
          to: `0x${string}`;
          data: `0x${string}`;
          value: bigint;
        }> = [];

        // 1. 添加所有 token approvals
        if (
          redeemQuote.tokenApprovals &&
          redeemQuote.tokenApprovals.length > 0
        ) {
          for (const approval of redeemQuote.tokenApprovals) {
            const approveData = encodeFunctionCall('approve(address,uint256)', [
              approval.spender || PENDLE_ROUTER,
              '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            ]);

            batchCalls.push({
              to: approval.token as `0x${string}`,
              data: approveData as `0x${string}`,
              value: 0n,
            });
          }
        }

        // 2. 添加 redeem 交易
        batchCalls.push({
          to: (redeemQuote.tx.to || PENDLE_ROUTER) as `0x${string}`,
          data: (redeemQuote.tx.data || '0x') as `0x${string}`,
          value: BigInt(redeemQuote.tx.value ?? 0),
        });

        // 将所有操作合并为一个 batch 交易，只需一次人脸识别
        const txHash = await sendGaslessTransaction(batchCalls);

        console.log('✅ Pendle batch transaction:', txHash);

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
