import { ProtocolService, ProtocolInfo } from './types';
import { DEFAULT_CHAIN_ID } from '@/utils/blockchain/chainIds';

export class AaveProtocolService implements ProtocolService {
  name = 'AAVE';
  chainId = DEFAULT_CHAIN_ID;

  constructor(private aaveService?: any) {}

  async getAPRInfo(): Promise<ProtocolInfo> {
    // TODO: Implement AAVE APR Get Logic
    return {
      name: this.name,
      apy: 8.2,
      apyDisplay: '8.2%',
      description: 'Decentralized lending protocol',
      tvl: '$12.5B',
      risk: 'Medium',
      isLive: false, // TODO: temporarily dead data
      lastUpdated: Date.now(),
      balance: 0,
    };
  }

  async getBalance(): Promise<number> {
    // TODO: Implement AAVE balance get logic
    return 0;
  }

  getCacheKey(): string {
    return `aave_${this.chainId}`;
  }

  isSupported(): boolean {
    return false; // TODO: temporarily not supported
  }
}

export default AaveProtocolService;
