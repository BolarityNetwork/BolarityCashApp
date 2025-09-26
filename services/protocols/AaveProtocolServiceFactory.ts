import { ProtocolService, ProtocolServiceFactory } from './types';

export class AaveProtocolServiceFactory implements ProtocolServiceFactory {
  isSupported(): boolean {
    // TODO: Check If AAVE Service Is Available
    return false; // TODO: temporarily not supported
  }

  createService(config?: any): ProtocolService {
    if (!this.isSupported()) {
      throw new Error('AAVE service is not supported');
    }

    // TODO: Implement AAVE Service Creation Logic
    const { AaveProtocolService } = require('./AaveProtocolService');
    return new AaveProtocolService(config?.aaveService);
  }
}

export default AaveProtocolServiceFactory;
