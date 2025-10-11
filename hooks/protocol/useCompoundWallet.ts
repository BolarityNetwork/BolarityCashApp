import { useState, useCallback } from 'react';
import { usePrivyWallet } from '../usePrivyWallet';
import { ethers } from 'ethers';
import { COMPOUND_MARKETS } from '@/constants/abis/compound';

interface CompoundTransactionParams {
  asset: string;
  amount: string;
  userAddress?: string;
}

interface CompoundHookReturn {
  // Status
  isLoading: boolean;
  error: string | null;

  // Compound operations
  supply: (params: CompoundTransactionParams) => Promise<string>;
  withdraw: (params: CompoundTransactionParams) => Promise<string>;
  claimRewards: (userAddress?: string) => Promise<string>;

  // Query methods
  getBalance: (asset: string, userAddress?: string) => Promise<number>;
  getAPR: (asset: string) => Promise<number>;
  getRewards: (userAddress?: string) => Promise<number>;

  // Utility methods
  clearError: () => void;
  formatAmount: (amount: string, decimals: number) => string;
  parseAmount: (amount: string, decimals: number) => string;
}

export function useCompoundWallet(chainId: number = 8453): CompoundHookReturn {
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

  // Get market config
  const getMarketConfig = useCallback(() => {
    if (chainId === 1) return COMPOUND_MARKETS.ethereum;
    if (chainId === 8453) return COMPOUND_MARKETS.base;
    throw new Error(`Unsupported chain: ${chainId}`);
  }, [chainId]);

  // Get asset info
  const getAssetInfo = useCallback(
    (asset: string) => {
      const _markets = getMarketConfig();
      const _assetInfo = _markets[asset.toUpperCase() as keyof typeof _markets];
      if (!_assetInfo || typeof _assetInfo === 'string') {
        throw new Error(`Unsupported asset: ${asset}`);
      }
      return _assetInfo;
    },
    [getMarketConfig]
  );

  const clearError = useCallback(() => {
    setError(null);
    clearWalletError();
  }, [clearWalletError]);

  // Format amount
  const formatAmount = useCallback(
    (amount: string, decimals: number): string => {
      const num = parseFloat(amount);
      const divisor = Math.pow(10, decimals);
      return (num / divisor).toString();
    },
    []
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

        // Encode function call
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
          'claim(address,address,bool)': '0x0e752702',
          'balanceOf(address)': '0x70a08231',
          'allowance(address,address)': '0xdd62ed3e',
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

  // Supply asset to Compound
  const supply = useCallback(
    async (params: CompoundTransactionParams): Promise<string> => {
      setIsLoading(true);
      setError(null);

      try {
        const { asset, amount, userAddress } = params;
        const _markets = getMarketConfig();
        const _assetInfo = getAssetInfo(asset);

        // Ensure there are accounts
        let currentAccounts = accounts;
        if (currentAccounts.length === 0) {
          currentAccounts = await getAccounts();
        }

        if (currentAccounts.length === 0) {
          throw new Error('No accounts available');
        }

        const _targetAddress = userAddress || currentAccounts[0];
        const amountWei = parseAmount(amount, _assetInfo.decimals);
        console.log(
          11177,
          '_markets',
          _markets,
          '_assetInfo',
          _assetInfo,
          'currentAccounts',
          currentAccounts,
          '_targetAddress',
          _targetAddress,
          'amountWei',
          amountWei
        );

        // 1. First we need to approve the asset to the Comet contract
        const approveData = encodeFunctionCall('approve(address,uint256)', [
          _markets.comet,
          '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', // MaxUint256
        ]);

        console.log('Approval transaction data:', approveData);
        console.log('Approval target:', _assetInfo.underlying);
        console.log('Approval spender:', _markets.comet);

        console.log('Sending approval transaction...');
        const approveTxHash = await sendTransaction({
          from: _targetAddress,
          to: _assetInfo.underlying,
          data: approveData,
        });

        console.log('Approval transaction:', approveTxHash);

        // Wait for approval transaction confirmation
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 2. Then call the supply method
        const supplyData = encodeFunctionCall('supply(address,uint256)', [
          _assetInfo.underlying,
          amountWei,
        ]);

        console.log('Sending supply transaction...');
        const supplyTxHash = await sendTransaction({
          from: _targetAddress,
          to: _markets.comet,
          data: supplyData,
        });

        console.log('Supply transaction:', supplyTxHash);
        return supplyTxHash;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to supply asset';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [
      accounts,
      getAccounts,
      sendTransaction,
      getMarketConfig,
      getAssetInfo,
      parseAmount,
      encodeFunctionCall,
    ]
  );

  // Withdraw asset from Compound
  const withdraw = useCallback(
    async (params: CompoundTransactionParams): Promise<string> => {
      setIsLoading(true);
      setError(null);

      try {
        const { asset, amount, userAddress } = params;
        const _markets = getMarketConfig();
        const _assetInfo = getAssetInfo(asset);

        // Ensure there are accounts
        let currentAccounts = accounts;
        if (currentAccounts.length === 0) {
          currentAccounts = await getAccounts();
        }

        if (currentAccounts.length === 0) {
          throw new Error('No accounts available');
        }

        const _targetAddress = userAddress || currentAccounts[0];
        const amountWei = parseAmount(amount, _assetInfo.decimals);

        // Build withdraw transaction data
        const withdrawData = encodeFunctionCall('withdraw(address,uint256)', [
          _assetInfo.underlying,
          amountWei,
        ]);

        console.log('Sending withdraw transaction...');
        const txHash = await sendTransaction({
          from: _targetAddress,
          to: _markets.comet,
          data: withdrawData,
        });

        console.log('Withdraw transaction:', txHash);
        return txHash;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to withdraw asset';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [
      accounts,
      getAccounts,
      sendTransaction,
      getMarketConfig,
      getAssetInfo,
      parseAmount,
      encodeFunctionCall,
    ]
  );

  // Claim COMP rewards
  const claimRewards = useCallback(
    async (userAddress?: string): Promise<string> => {
      setIsLoading(true);
      setError(null);

      try {
        const _markets = getMarketConfig();

        // Ensure there are accounts
        let currentAccounts = accounts;
        if (currentAccounts.length === 0) {
          currentAccounts = await getAccounts();
        }

        if (currentAccounts.length === 0) {
          throw new Error('No accounts available');
        }

        const _targetAddress = userAddress || currentAccounts[0];

        // Build claim transaction data
        const claimData = encodeFunctionCall('claim(address,address,bool)', [
          _markets.comet,
          _targetAddress,
          true, // shouldAccrue
        ]);

        console.log('Sending claim rewards transaction...');
        const txHash = await sendTransaction({
          from: _targetAddress,
          to: _markets.rewards,
          data: claimData,
        });

        console.log('Claim rewards transaction:', txHash);
        return txHash;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to claim rewards';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [
      accounts,
      getAccounts,
      sendTransaction,
      getMarketConfig,
      encodeFunctionCall,
    ]
  );

  // Get user balance
  const getBalance = useCallback(
    async (asset: string, userAddress?: string): Promise<number> => {
      try {
        const _markets = getMarketConfig();
        const _assetInfo = getAssetInfo(asset);

        // Ensure there are accounts
        let currentAccounts = accounts;
        if (currentAccounts.length === 0) {
          currentAccounts = await getAccounts();
        }

        if (currentAccounts.length === 0) {
          throw new Error('No accounts available');
        }

        const _targetAddress = userAddress || currentAccounts[0];

        // Build balanceOf call data
        const _balanceData = encodeFunctionCall('balanceOf(address)', [
          _targetAddress,
        ]);

        // Here we need to call the contract, simplified processing
        // In actual application, we need to implement contract calls
        console.log('Getting balance for', asset, 'at', _targetAddress);
        return 0; // Placeholder
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get balance';
        setError(errorMessage);
        throw err;
      }
    },
    [accounts, getAccounts, getMarketConfig, getAssetInfo, encodeFunctionCall]
  );

  // Get APR
  const getAPR = useCallback(
    async (asset: string): Promise<number> => {
      try {
        const _markets = getMarketConfig();

        // Build getSupplyRate call data
        const _supplyRateData = encodeFunctionCall('getSupplyRate(uint256)', [
          '0',
        ]);

        // Here we need to call the contract, simplified processing
        // In actual application, we need to implement contract calls
        console.log('Getting APR for', asset);
        return 0.05; // 5% placeholder
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get APR';
        setError(errorMessage);
        throw err;
      }
    },
    [getMarketConfig, encodeFunctionCall]
  );

  // Get rewards
  const getRewards = useCallback(
    async (userAddress?: string): Promise<number> => {
      try {
        const _markets = getMarketConfig();

        // Ensure there are accounts
        let currentAccounts = accounts;
        if (currentAccounts.length === 0) {
          currentAccounts = await getAccounts();
        }

        if (currentAccounts.length === 0) {
          throw new Error('No accounts available');
        }

        const _targetAddress = userAddress || currentAccounts[0];

        // Build getRewardOwed call data
        const _rewardsData = encodeFunctionCall(
          'getRewardOwed(address,address)',
          [_markets.comet, _targetAddress]
        );

        // Here we need to call the contract, simplified processing
        // In actual application, we need to implement contract calls
        console.log('Getting rewards for', _targetAddress);
        return 0; // Placeholder
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get rewards';
        setError(errorMessage);
        throw err;
      }
    },
    [accounts, getAccounts, getMarketConfig, encodeFunctionCall]
  );

  return {
    isLoading: isLoading || walletLoading,
    error: error || walletError,
    supply,
    withdraw,
    claimRewards,
    getBalance,
    getAPR,
    getRewards,
    clearError,
    formatAmount,
    parseAmount,
  };
}
