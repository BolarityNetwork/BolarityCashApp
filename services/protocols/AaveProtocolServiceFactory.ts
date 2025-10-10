import { ProtocolService, ProtocolServiceFactory } from './types';
import { DEFAULT_CHAIN_ID } from '@/utils/blockchain/chainIds';

export class AaveProtocolServiceFactory implements ProtocolServiceFactory {
  isSupported(): boolean {
    try {
      // Check If AaveService Is Available
      require('@/api/AaveService');
      return true;
    } catch {
      return false;
    }
  }

  createService(config?: any): ProtocolService {
    if (!this.isSupported()) {
      throw new Error('Aave service is not supported');
    }

    const AaveService = require('@/api/AaveService').default;
    const chainId = config?.chainId || DEFAULT_CHAIN_ID;
    const token = config?.token || 'USDC';
    const aaveService = new AaveService(chainId, token);

    const { AaveProtocolService } = require('./AaveProtocolService');
    return new AaveProtocolService(aaveService);
  }
}

export default AaveProtocolServiceFactory;
