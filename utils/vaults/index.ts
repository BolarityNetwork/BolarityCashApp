// vaults/index.ts - Clean exports for the vault system
// Linux principle: Simple interface, hide complexity

export * from './types';
export * from './VaultManager';
export * from './AaveVault';
export { createVaultManager, getVaultConfigs } from './registry';

// Usage example:
/*
import { createVaultManager } from './vaults';

const vaultManager = createVaultManager(userAddress);

// Deposit to AAVE
await vaultManager.deposit('aave-usdc', '100', 'USDC');

// Get total balance across all vaults
const totalBalance = await vaultManager.getTotalBalance(userAddress);

// Get all transactions
const allTx = await vaultManager.getAllTransactions(userAddress);
*/
