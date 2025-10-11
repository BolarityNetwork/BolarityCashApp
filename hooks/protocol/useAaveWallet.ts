import { useState, useCallback } from 'react';
import { usePrivyWallet } from '../usePrivyWallet';
import { ethers } from 'ethers';
import { AAVE_NETWORKS } from '@/constants/networks';

interface AaveTransactionParams {
  asset: string;
  amount: string;
  userAddress?: string;
}

interface AaveHookReturn {
  // Status
  isLoading: boolean;
  error: string | null;

  // Aave operations
  supply: (params: AaveTransactionParams) => Promise<string>;
  withdraw: (params: AaveTransactionParams) => Promise<string>;

  // Query methods
  getBalance: (asset: string, userAddress?: string) => Promise<number>;
  getAPY: (asset: string) => Promise<number>;

  // Utility methods
  clearError: () => void;
  formatAmount: (amount: string, decimals: number) => string;
  parseAmount: (amount: string, decimals: number) => string;
}

export function useAaveWallet(network: string = 'base'): AaveHookReturn {
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

  // Get network config
  const getNetworkConfig = useCallback(() => {
    const config = AAVE_NETWORKS[network as keyof typeof AAVE_NETWORKS];
    if (!config) {
      throw new Error(`Unsupported network: ${network}`);
    }
    return config;
  }, [network]);

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
          'supply(address,uint256,address,uint16)': '0x617ba037',
          'withdraw(address,uint256,address)': '0x69328dec',
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

  // Supply asset to Aave
  const supply = useCallback(
    async (params: AaveTransactionParams): Promise<string> => {
      setIsLoading(true);
      setError(null);

      try {
        const { asset, amount, userAddress } = params;
        const config = getNetworkConfig();
        const decimals = 6; // USDC decimals

        // Ensure there are accounts
        let currentAccounts = accounts;
        if (currentAccounts.length === 0) {
          currentAccounts = await getAccounts();
        }

        if (currentAccounts.length === 0) {
          throw new Error('No accounts available');
        }

        const _targetAddress = userAddress || currentAccounts[0];
        const amountWei = parseAmount(amount, decimals);

        console.log('Aave Supply:', {
          asset,
          amount,
          amountWei,
          targetAddress: _targetAddress,
          poolAddress: config.POOL_ADDRESS,
          usdcAddress: config.USDC_ADDRESS,
        });

        // 1. First approve USDC to the Pool contract
        const approveData = encodeFunctionCall('approve(address,uint256)', [
          config.POOL_ADDRESS,
          '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', // MaxUint256
        ]);

        console.log('Sending approval transaction...');
        const approveTxHash = await sendTransaction({
          from: _targetAddress,
          to: config.USDC_ADDRESS,
          data: approveData,
        });

        console.log('✅ Approval transaction:', approveTxHash);

        // Wait for approval confirmation
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 2. Call supply method on Pool
        // function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)
        const supplyData = encodeFunctionCall(
          'supply(address,uint256,address,uint16)',
          [
            config.USDC_ADDRESS, // asset
            amountWei, // amount
            _targetAddress, // onBehalfOf
            0, // referralCode
          ]
        );

        console.log('Sending supply transaction...');
        const supplyTxHash = await sendTransaction({
          from: _targetAddress,
          to: config.POOL_ADDRESS,
          data: supplyData,
        });

        console.log('✅ Supply transaction:', supplyTxHash);
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
      getNetworkConfig,
      parseAmount,
      encodeFunctionCall,
    ]
  );

  // Withdraw asset from Aave
  const withdraw = useCallback(
    async (params: AaveTransactionParams): Promise<string> => {
      setIsLoading(true);
      setError(null);

      try {
        const { asset, amount, userAddress } = params;
        const config = getNetworkConfig();
        const decimals = 6; // USDC decimals

        // Ensure there are accounts
        let currentAccounts = accounts;
        if (currentAccounts.length === 0) {
          currentAccounts = await getAccounts();
        }

        if (currentAccounts.length === 0) {
          throw new Error('No accounts available');
        }

        const _targetAddress = userAddress || currentAccounts[0];

        // Handle 'all' amount
        const amountWei =
          amount === 'all'
            ? '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' // MaxUint256
            : parseAmount(amount, decimals);

        console.log('Aave Withdraw:', {
          asset,
          amount,
          amountWei,
          targetAddress: _targetAddress,
        });

        // Call withdraw method on Pool
        // function withdraw(address asset, uint256 amount, address to)
        const withdrawData = encodeFunctionCall(
          'withdraw(address,uint256,address)',
          [
            config.USDC_ADDRESS, // asset
            amountWei, // amount
            _targetAddress, // to
          ]
        );

        console.log('Sending withdraw transaction...');
        const txHash = await sendTransaction({
          from: _targetAddress,
          to: config.POOL_ADDRESS,
          data: withdrawData,
        });

        console.log('✅ Withdraw transaction:', txHash);
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
      getNetworkConfig,
      parseAmount,
      encodeFunctionCall,
    ]
  );

  // Get user balance (placeholder)
  const getBalance = useCallback(
    async (asset: string, userAddress?: string): Promise<number> => {
      console.log('Getting Aave balance for', asset, 'at', userAddress);
      try {
        // Ensure there are accounts
        let currentAccounts = accounts;
        if (currentAccounts.length === 0) {
          currentAccounts = await getAccounts();
        }

        if (currentAccounts.length === 0) {
          throw new Error('No accounts available');
        }

        const _targetAddress = userAddress || currentAccounts[0];

        console.log('Getting Aave balance for', asset, 'at', _targetAddress);
        // TODO: Implement actual balance query
        return 0; // Placeholder
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get balance';
        setError(errorMessage);
        throw err;
      }
    },
    [accounts, getAccounts]
  );

  // Get APY (placeholder)
  const getAPY = useCallback(async (asset: string): Promise<number> => {
    try {
      console.log('Getting Aave APY for', asset);
      // TODO: Implement actual APY query
      return 0.05; // 5% placeholder
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get APY';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    isLoading: isLoading || walletLoading,
    error: error || walletError,
    supply,
    withdraw,
    getBalance,
    getAPY,
    clearError,
    formatAmount,
    parseAmount,
  };
}
