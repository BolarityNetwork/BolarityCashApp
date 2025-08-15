// vaults/types.ts - Base vault system types
// Linux principle: Define clear interfaces, let implementations handle details

export interface VaultConfig {
  id: string;
  name: string;
  protocol: string;
  type: 'lending' | 'staking' | 'liquidity' | 'yield';
  apy: string;
  description: string;
  minimumDeposit: string;
  risk: 'Low' | 'Medium' | 'High';
  tvl: string;
  features: string[];
  ui: {
    icon: string;
    gradientColors: string[];
    supportedTokens: string[];
  };
}

export interface VaultBalance {
  deposited: string;
  earned: string;
  totalValue: string;
  apy: string;
}

export interface VaultTransaction {
  hash: string;
  type: 'deposit' | 'withdraw' | 'claim';
  amount: string;
  token: string;
  timestamp: Date;
  status: 'pending' | 'success' | 'failed';
}

export interface VaultOperationResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

// Base vault interface - every vault must implement this
export interface BaseVault {
  config: VaultConfig;
  
  // Core operations
  deposit(amount: string, token: string): Promise<VaultOperationResult>;
  withdraw(amount: string): Promise<VaultOperationResult>;
  claim(): Promise<VaultOperationResult>;
  
  // Data fetching
  getBalance(userAddress: string): Promise<VaultBalance>;
  getTransactions(userAddress: string): Promise<VaultTransaction[]>;
  
  // Validation
  canDeposit(amount: string, token: string): Promise<boolean>;
  canWithdraw(amount: string): Promise<boolean>;
  
  // Lifecycle
  initialize(userAddress: string): Promise<void>;
  cleanup(): Promise<void>;
}

export interface VaultManager {
  // Vault registry
  registerVault(vault: BaseVault): void;
  getVault(vaultId: string): BaseVault | null;
  getAllVaults(): BaseVault[];
  
  // Operations
  deposit(vaultId: string, amount: string, token: string): Promise<VaultOperationResult>;
  withdraw(vaultId: string, amount: string): Promise<VaultOperationResult>;
  
  // Data aggregation
  getTotalBalance(userAddress: string): Promise<string>;
  getAllTransactions(userAddress: string): Promise<VaultTransaction[]>;
}