export interface ProtocolInfo {
  name: string;
  apy: number;
  apyDisplay: string;
  description: string;
  tvl: string;
  risk: string;
  isLive: boolean;
  lastUpdated?: number;
  balance: number;
}

export interface DepositParams {
  asset: string;
  amount: string;
  userAddress?: string;
}

export interface WithdrawParams {
  asset: string;
  amount: string;
  userAddress?: string;
}

export interface ProtocolService {
  name: string;
  chainId: number;
  getAPRInfo: (userAddress: string) => Promise<ProtocolInfo>;
  getCacheKey: () => string;
  isSupported: () => boolean;
  // Transaction methods (optional, not all services need to implement)
  deposit?: (params: DepositParams) => Promise<string>;
  withdraw?: (params: WithdrawParams) => Promise<string>;
  getBalance?: (asset: string, userAddress?: string) => Promise<number>;
}

export interface ProtocolServiceFactory {
  createService(config?: any): ProtocolService;
  isSupported(): boolean;
}

export default ProtocolService;
