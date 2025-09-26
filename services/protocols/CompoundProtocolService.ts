import { ProtocolService, ProtocolInfo } from './types';
import { DEFAULT_CHAIN_ID } from '@/utils/blockchain/chainIds';

export class CompoundProtocolService implements ProtocolService {
  name = 'Compound';
  chainId = DEFAULT_CHAIN_ID;

  constructor(private compoundService: any) {}

  async getAPRInfo(): Promise<ProtocolInfo> {
    try {
      const aprData = await this.compoundService.getAPRInfo();
      // TODO: get tvl from api
      return {
        name: this.name,
        apy: aprData.totalAPR,
        apyDisplay: `${aprData.totalAPR.toFixed(2)}%`,
        description: 'Ethereum money markets',
        tvl: '$32.76M',
        risk: 'Low-Medium',
        isLive: true,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error('Failed to get Compound APR:', error);
      return {
        name: this.name,
        apy: 0,
        apyDisplay: '0%',
        description: 'Ethereum money markets',
        tvl: '$0',
        risk: 'Low-Medium',
        isLive: false,
        lastUpdated: Date.now(),
      };
    }
  }

  getCacheKey(): string {
    return `compound_${this.chainId}`;
  }

  isSupported(): boolean {
    return !!this.compoundService;
  }
}

export default CompoundProtocolService;
