// vaults/registry.ts - Vault registration and factory
// Linux principle: Central configuration, easy extension

import { VaultManagerImpl } from './VaultManager';
import { AaveVault } from './AaveVault';
import { BaseVault } from './types';

// Factory function to create vault manager with all vaults
export function createVaultManager(userAddress: string): VaultManagerImpl {
  const manager = new VaultManagerImpl(userAddress);
  
  // Register all available vaults
  manager.registerVault(new AaveVault());
  
  // Future vaults would be added here:
  // manager.registerVault(new CompoundVault());
  // manager.registerVault(new LidoVault());
  // manager.registerVault(new UniswapV3Vault());
  
  return manager;
}

// Helper to get vault configurations for UI
export function getVaultConfigs(): any[] {
  const tempManager = createVaultManager('0x');
  return tempManager.getAllVaults().map(vault => vault.config);
}

// Example of how to add a new vault:
/*
class CompoundVault implements BaseVault {
  config = {
    id: 'compound-usdc',
    name: 'Compound USDC',
    protocol: 'Compound',
    type: 'lending' as const,
    apy: '6.5%',
    description: 'Ethereum money markets',
    minimumDeposit: '0.01',
    risk: 'Low' as const,
    tvl: '$8.7B',
    features: ['Stable APY', 'Proven protocol'],
    ui: {
      icon: 'Building',
      gradientColors: ['#10b981', '#059669'],
      supportedTokens: ['USDC']
    }
  };

  async initialize(userAddress: string) { ... }
  async deposit(amount: string, token: string) { ... }
  // ... implement all BaseVault methods
}

// Then just add to registry:
// manager.registerVault(new CompoundVault());
*/