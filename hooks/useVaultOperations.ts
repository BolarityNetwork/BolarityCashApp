import { useState, useCallback } from 'react';
import {
  VaultMarketInfo,
  VaultOperationParams,
  VaultOperationResult,
} from '@/types/vault';
import { useVaultService } from '@/services/VaultService';

interface VaultOperationsHook {
  // 操作状态
  isLoading: boolean;
  error: string | null;

  // 操作方法
  deposit: (
    vault: VaultMarketInfo,
    amount: string,
    userAddress?: string
  ) => Promise<VaultOperationResult>;
  withdraw: (
    vault: VaultMarketInfo,
    amount: string,
    userAddress?: string
  ) => Promise<VaultOperationResult>;

  // 工具方法
  clearError: () => void;
}

export function useVaultOperations(): VaultOperationsHook {
  const vaultService = useVaultService();
  const [operationError, setOperationError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setOperationError(null);
    vaultService.clearError();
  }, [vaultService]);

  const deposit = useCallback(
    async (
      vault: VaultMarketInfo,
      amount: string,
      userAddress?: string
    ): Promise<VaultOperationResult> => {
      setOperationError(null);

      const params: VaultOperationParams = {
        vault,
        amount,
        userAddress,
      };

      try {
        const result = await vaultService.deposit(params);

        if (!result.success) {
          setOperationError(result.error || 'Deposit failed');
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Deposit failed';
        setOperationError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [vaultService]
  );

  const withdraw = useCallback(
    async (
      vault: VaultMarketInfo,
      amount: string,
      userAddress?: string
    ): Promise<VaultOperationResult> => {
      setOperationError(null);

      const params: VaultOperationParams = {
        vault,
        amount,
        userAddress,
      };

      try {
        const result = await vaultService.withdraw(params);

        if (!result.success) {
          setOperationError(result.error || 'Withdraw failed');
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Withdraw failed';
        setOperationError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [vaultService]
  );

  return {
    isLoading: vaultService.isLoading,
    error: operationError || vaultService.error,
    deposit,
    withdraw,
    clearError,
  };
}

// 使用示例和工具函数
export const VaultOperationsUtils = {
  // 验证金额格式
  validateAmount: (amount: string): boolean => {
    if (amount === 'all') return true;
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  },

  // 格式化金额显示
  formatAmount: (amount: string, decimals: number): string => {
    if (amount === 'all') return 'All';
    const num = parseFloat(amount);
    return num.toFixed(decimals);
  },

  // 检查协议支持
  isProtocolSupported: (protocol: string): boolean => {
    return ['aave', 'compound', 'pendle'].includes(protocol);
  },
};
