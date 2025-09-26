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

export interface ProtocolService {
  name: string;
  chainId: number;
  getAPRInfo: (userAddress: string) => Promise<ProtocolInfo>;
  getCacheKey: () => string;
  isSupported: () => boolean;
}

export interface ProtocolServiceFactory {
  createService(config?: any): ProtocolService;
  isSupported(): boolean;
}

export default ProtocolService;
