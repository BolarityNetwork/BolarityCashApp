// vaults/VaultManager.ts - Central vault registry and operations
// Linux principle: Single point of control, simple interface

import { BaseVault, VaultManager, VaultOperationResult, VaultTransaction } from './types';

export class VaultManagerImpl implements VaultManager {
  private vaults = new Map<string, BaseVault>();
  private userAddress: string = '';

  constructor(userAddress: string) {
    this.userAddress = userAddress;
  }

  // Registry operations
  registerVault(vault: BaseVault): void {
    this.vaults.set(vault.config.id, vault);
  }

  getVault(vaultId: string): BaseVault | null {
    return this.vaults.get(vaultId) || null;
  }

  getAllVaults(): BaseVault[] {
    return Array.from(this.vaults.values());
  }

  // Vault operations - delegate to specific vault
  async deposit(vaultId: string, amount: string, token: string): Promise<VaultOperationResult> {
    const vault = this.getVault(vaultId);
    if (!vault) {
      return { success: false, error: `Vault ${vaultId} not found` };
    }

    const canDeposit = await vault.canDeposit(amount, token);
    if (!canDeposit) {
      return { success: false, error: `Cannot deposit ${amount} ${token}` };
    }

    return vault.deposit(amount, token);
  }

  async withdraw(vaultId: string, amount: string): Promise<VaultOperationResult> {
    const vault = this.getVault(vaultId);
    if (!vault) {
      return { success: false, error: `Vault ${vaultId} not found` };
    }

    const canWithdraw = await vault.canWithdraw(amount);
    if (!canWithdraw) {
      return { success: false, error: `Cannot withdraw ${amount}` };
    }

    return vault.withdraw(amount);
  }

  // Aggregation operations
  async getTotalBalance(userAddress: string): Promise<string> {
    const balances = await Promise.all(
      this.getAllVaults().map(vault => vault.getBalance(userAddress))
    );

    const total = balances.reduce((sum, balance) => {
      return sum + parseFloat(balance.totalValue);
    }, 0);

    return total.toFixed(2);
  }

  async getAllTransactions(userAddress: string): Promise<VaultTransaction[]> {
    const transactionArrays = await Promise.all(
      this.getAllVaults().map(vault => vault.getTransactions(userAddress))
    );

    // Flatten and sort by timestamp (newest first)
    return transactionArrays
      .flat()
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Utility methods
  getVaultsByType(type: string): BaseVault[] {
    return this.getAllVaults().filter(vault => vault.config.type === type);
  }

  getVaultsByProtocol(protocol: string): BaseVault[] {
    return this.getAllVaults().filter(vault => vault.config.protocol === protocol);
  }

  async initializeAllVaults(): Promise<void> {
    await Promise.all(
      this.getAllVaults().map(vault => vault.initialize(this.userAddress))
    );
  }

  async cleanupAllVaults(): Promise<void> {
    await Promise.all(
      this.getAllVaults().map(vault => vault.cleanup())
    );
  }
}