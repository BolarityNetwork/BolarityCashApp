import {
  VaultMarketInfo,
  VaultOperationParams,
  VaultOperationResult,
} from '@/types/vault';
import { useAaveContract } from '@/hooks/protocol/useAaveContract';
import { useCompoundContract } from '@/hooks/protocol/useCompoundContract';
import { usePendleContract } from '@/hooks/protocol/usePendleContract';

interface VaultServiceOperations {
  deposit: (params: VaultOperationParams) => Promise<VaultOperationResult>;
  withdraw: (params: VaultOperationParams) => Promise<VaultOperationResult>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useVaultService(): VaultServiceOperations {
  const aaveContract = useAaveContract();
  const compoundContract = useCompoundContract();
  const pendleContract = usePendleContract();

  // 根据协议类型选择对应的合约操作
  const getContractOperations = (protocol: string) => {
    switch (protocol) {
      case 'aave':
        return aaveContract;
      case 'compound':
        return compoundContract;
      case 'pendle':
        return pendleContract;
      default:
        throw new Error(`Unsupported protocol: ${protocol}`);
    }
  };

  const deposit = async (
    params: VaultOperationParams
  ): Promise<VaultOperationResult> => {
    const { vault } = params;
    const operations = getContractOperations(vault.protocol);
    return operations.deposit(params);
  };

  const withdraw = async (
    params: VaultOperationParams
  ): Promise<VaultOperationResult> => {
    const { vault } = params;
    const operations = getContractOperations(vault.protocol);
    return operations.withdraw(params);
  };

  // 获取当前加载状态（任一协议正在加载）
  const isLoading =
    aaveContract.isLoading ||
    compoundContract.isLoading ||
    pendleContract.isLoading;

  // 获取当前错误（任一协议有错误）
  const error =
    aaveContract.error || compoundContract.error || pendleContract.error;

  const clearError = () => {
    aaveContract.clearError();
    compoundContract.clearError();
    pendleContract.clearError();
  };

  return {
    deposit,
    withdraw,
    isLoading,
    error,
    clearError,
  };
}

// 工具函数：创建 VaultMarketInfo
export function createVaultMarketInfo(
  protocol: 'aave' | 'compound' | 'pendle',
  marketData: any
): VaultMarketInfo {
  const baseInfo: VaultMarketInfo = {
    protocol,
    asset: marketData.assetAddress,
    marketAddress: marketData.marketAddress,
    chainId: marketData.chainId,
    network: marketData.network,
    decimals: marketData.decimals,
    symbol: marketData.symbol,
  };

  // 根据协议添加特定信息
  switch (protocol) {
    case 'aave':
      baseInfo.protocolSpecific = {
        poolAddress: marketData.poolAddress,
        aTokenAddress: marketData.aTokenAddress,
      };
      break;
    case 'compound':
      baseInfo.protocolSpecific = {
        cometAddress: marketData.cometAddress,
        cTokenAddress: marketData.cTokenAddress,
      };
      break;
    case 'pendle':
      baseInfo.protocolSpecific = {
        ptAddress: marketData.ptAddress,
        ytAddress: marketData.ytAddress,
      };
      break;
  }

  return baseInfo;
}
