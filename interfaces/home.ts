export interface VaultOption {
  name: string;
  apy: string;
  description: string;
  tvl: string;
  risk: string;
}

export interface TimeVaultOption {
  name: string;
  apy: string;
  maturity: string;
  description: string;
  tvl: string;
  risk: string;
  lockPeriod: string;
  protocol: string;
}

export interface VaultProduct {
  name: string;
  type: string;
  apy: string;
  description: string;
  minimum: string;
  features: string[];
  gradientColors: string[];
  icon: string;
}

export interface Transaction {
  type: string;
  amount: string;
  date: string;
  vault: string;
  isPositive: boolean;
}
