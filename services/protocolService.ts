import { useCallback } from 'react';
import { useAPRStore } from '@/stores/aprStore';
import { ProtocolService, ProtocolInfo } from './protocols/types';
import { protocolServiceRegistry } from './protocols/ProtocolServiceRegistry';

// Protocol Service Manager
export class ProtocolServiceManager {
  private services: Map<string, ProtocolService> = new Map();
  private aprStore = useAPRStore.getState();

  constructor() {
    this.initializeServices();
  }

  // Initialize Services
  private initializeServices() {
    // Use Registry To Create Supported Services
    const supportedProtocols = protocolServiceRegistry.getSupportedProtocols();
    supportedProtocols.forEach(protocolName => {
      const service = protocolServiceRegistry.createService(protocolName);
      if (service) {
        this.services.set(protocolName.toLowerCase(), service);
      }
    });
  }

  // Register Protocol Service
  registerService(service: ProtocolService) {
    this.services.set(service.name.toLowerCase(), service);
  }

  // Get Protocol Service
  getService(protocolName: string): ProtocolService | undefined {
    return this.services.get(protocolName.toLowerCase());
  }

  // Get All Supported Protocols
  getSupportedProtocols(): string[] {
    return Array.from(this.services.keys()).filter(name =>
      this.services.get(name)?.isSupported()
    );
  }

  // Get Protocol Info (With Cache)
  async getProtocolInfo(
    protocolName: string,
    forceRefresh = false
  ): Promise<ProtocolInfo | null> {
    const service = this.getService(protocolName);
    if (!service || !service.isSupported()) {
      return null;
    }

    const cacheKey = service.getCacheKey();

    // Check Cache
    if (!forceRefresh && this.aprStore.hasValidCache(cacheKey)) {
      const cachedData = this.aprStore.getAPRData(cacheKey);
      if (cachedData) {
        return {
          name: service.name,
          apy: cachedData.totalAPR,
          apyDisplay: `${cachedData.totalAPR.toFixed(2)}%`,
          description: this.getDefaultDescription(service.name),
          tvl: cachedData.totalTVL,
          risk: this.getDefaultRisk(service.name),
          isLive: true,
          lastUpdated: Date.now(),
        };
      }
    }

    // Get New Data
    try {
      this.aprStore.setLoading(cacheKey, true);
      const protocolInfo = await service.getAPRInfo();
      // Cache APR Data
      if (protocolInfo.isLive) {
        this.aprStore.setAPRData(cacheKey, {
          baseAPR: protocolInfo.apy * 0.8, // Assume 80% is base APR
          compAPR: protocolInfo.apy * 0.2, // Assume 20% is reward APR
          totalAPR: protocolInfo.apy,
          totalTVL: protocolInfo.tvl,
        });
      }

      return protocolInfo;
    } catch (error) {
      console.error(`Failed to get ${protocolName} info:`, error);
      this.aprStore.setError(cacheKey, `Failed to get ${protocolName} info`);
      return null;
    } finally {
      this.aprStore.setLoading(cacheKey, false);
    }
  }

  // Get Multiple Protocol Info
  async getMultipleProtocolsInfo(
    protocolNames: string[],
    forceRefresh = false
  ): Promise<ProtocolInfo[]> {
    const promises = protocolNames.map(name =>
      this.getProtocolInfo(name, forceRefresh)
    );
    const results = await Promise.allSettled(promises);
    return results
      .filter(
        (result): result is PromiseFulfilledResult<ProtocolInfo> =>
          result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  }

  // Get Default Description
  private getDefaultDescription(protocolName: string): string {
    const descriptions: Record<string, string> = {
      compound: 'Ethereum money markets',
      aave: 'Decentralized lending protocol',
      drift: 'Solana-based DeFi protocol',
      solend: 'Solana lending protocol',
      navi: 'Sui ecosystem lending',
      huma: 'Real-world asset protocol',
    };
    return descriptions[protocolName.toLowerCase()] || 'DeFi protocol';
  }

  // Get Default TVL (Fallback when live data is unavailable)
  private getDefaultTVL(protocolName: string): string {
    const tvls: Record<string, string> = {
      compound: '$0', // Base chain TVL (will be replaced by live data)
      aave: '$0',
      drift: '$0',
      solend: '$0',
      navi: '$0',
      huma: '$0',
    };
    return tvls[protocolName.toLowerCase()] || '$0';
  }

  // Get Default Risk Level
  private getDefaultRisk(protocolName: string): string {
    const risks: Record<string, string> = {
      compound: 'Low-Medium',
      aave: 'Medium',
      drift: 'Medium-High',
      solend: 'Medium',
      navi: 'High',
      huma: 'Medium',
    };
    return risks[protocolName.toLowerCase()] || 'Medium';
  }
}

// Create Global Protocol Service Manager Instance
export const protocolServiceManager = new ProtocolServiceManager();

// Hook for using protocol services
export const useProtocolService = () => {
  const aprStore = useAPRStore();

  // Get Protocol Info
  const getProtocolInfo = useCallback(
    async (protocolName: string, forceRefresh = false) => {
      return protocolServiceManager.getProtocolInfo(protocolName, forceRefresh);
    },
    []
  );

  // Get Multiple Protocol Info
  const getMultipleProtocolsInfo = useCallback(
    async (protocolNames: string[], forceRefresh = false) => {
      return protocolServiceManager.getMultipleProtocolsInfo(
        protocolNames,
        forceRefresh
      );
    },
    []
  );

  // Get Supported Protocols List
  const getSupportedProtocols = useCallback(() => {
    return protocolServiceManager.getSupportedProtocols();
  }, []);

  return {
    getProtocolInfo,
    getMultipleProtocolsInfo,
    getSupportedProtocols,
    aprStore,
  };
};

export default useProtocolService;
