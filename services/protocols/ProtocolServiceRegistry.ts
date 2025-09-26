import { ProtocolService, ProtocolServiceFactory } from './types';
import CompoundProtocolServiceFactory from './CompoundProtocolServiceFactory';
import AaveProtocolServiceFactory from './AaveProtocolServiceFactory';

// Protocol Service Registry
export class ProtocolServiceRegistry {
  private factories: Map<string, ProtocolServiceFactory> = new Map();
  private services: Map<string, ProtocolService> = new Map();

  constructor() {
    this.registerDefaultFactories();
  }

  // Register Default Factories
  private registerDefaultFactories() {
    this.registerFactory('compound', new CompoundProtocolServiceFactory());
    this.registerFactory('aave', new AaveProtocolServiceFactory());
  }

  // Register Protocol Service Factory
  registerFactory(protocolName: string, factory: ProtocolServiceFactory) {
    this.factories.set(protocolName.toLowerCase(), factory);
  }

  // Create Protocol Service
  createService(protocolName: string, config?: any): ProtocolService | null {
    const factory = this.factories.get(protocolName.toLowerCase());
    if (!factory || !factory.isSupported()) {
      return null;
    }

    try {
      const service = factory.createService(config);
      this.services.set(protocolName.toLowerCase(), service);
      return service;
    } catch (error) {
      console.error(`Failed to create ${protocolName} service:`, error);
      return null;
    }
  }

  // Get Protocol Service
  getService(protocolName: string): ProtocolService | undefined {
    return this.services.get(protocolName.toLowerCase());
  }

  // Get All Supported Protocols
  getSupportedProtocols(): string[] {
    return Array.from(this.factories.keys()).filter(name => {
      const factory = this.factories.get(name);
      return factory?.isSupported() || false;
    });
  }

  // Check If Protocol Is Supported
  isProtocolSupported(protocolName: string): boolean {
    const factory = this.factories.get(protocolName.toLowerCase());
    return factory?.isSupported() || false;
  }
}

// Create Global Registry Instance
export const protocolServiceRegistry = new ProtocolServiceRegistry();

export default ProtocolServiceRegistry;
