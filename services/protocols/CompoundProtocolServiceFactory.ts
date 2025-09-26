import { ProtocolService, ProtocolServiceFactory } from './types';

export class CompoundProtocolServiceFactory implements ProtocolServiceFactory {
  isSupported(): boolean {
    try {
      // Check If CompoundService Is Available
      require('@/api/CompoundService');
      return true;
    } catch {
      return false;
    }
  }

  createService(config?: any): ProtocolService {
    if (!this.isSupported()) {
      throw new Error('Compound service is not supported');
    }

    const CompoundService = require('@/api/CompoundService').default;
    const compoundService = new CompoundService(config?.privateKey || '');

    const { CompoundProtocolService } = require('./CompoundProtocolService');
    return new CompoundProtocolService(compoundService);
  }
}

export default CompoundProtocolServiceFactory;
