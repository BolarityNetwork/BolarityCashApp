// Vault 相关类型定义

export interface VaultMarketInfo {
  // 基础信息
  protocol: 'aave' | 'compound' | 'pendle' | 'morpho';
  asset: string; // 资产地址
  marketAddress: string; // 市场合约地址

  // 网络信息
  chainId: number;
  network: string;

  // 资产信息
  decimals: number;
  symbol: string;

  // 协议特定信息
  protocolSpecific?: {
    // Aave 特定
    poolAddress?: string;
    aTokenAddress?: string;

    // Compound 特定
    cometAddress?: string;
    cTokenAddress?: string;

    // Pendle 特定
    ptAddress?: string;
    ytAddress?: string;
  };
}

export interface VaultOperationParams {
  vault: VaultMarketInfo;
  amount: string;
  userAddress?: string;
}

export interface VaultOperationResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export interface VaultOperations {
  deposit: (params: VaultOperationParams) => Promise<VaultOperationResult>;
  withdraw: (params: VaultOperationParams) => Promise<VaultOperationResult>;
}

export interface VaultServiceConfig {
  protocol: 'aave' | 'compound' | 'pendle' | 'morpho';
  network: string;
  chainId: number;
}
