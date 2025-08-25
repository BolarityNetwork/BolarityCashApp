// components/PerfectVaultSavingsPlatform/constants.ts

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

export const vaultOptions: VaultOption[] = [
  {
    name: 'AAVE',
    apy: '8.2%',
    description: 'Decentralized lending protocol',
    tvl: '$12.5B',
    risk: 'Medium',
  },
  {
    name: 'Drift',
    apy: '11.8%',
    description: 'Solana-based DeFi protocol',
    tvl: '$2.1B',
    risk: 'Medium-High',
  },
  {
    name: 'Compound',
    apy: '6.5%',
    description: 'Ethereum money markets',
    tvl: '$8.7B',
    risk: 'Low-Medium',
  },
  {
    name: 'Solend',
    apy: '9.3%',
    description: 'Solana lending protocol',
    tvl: '$1.8B',
    risk: 'Medium',
  },
  {
    name: 'Navi',
    apy: '12.4%',
    description: 'Sui ecosystem lending',
    tvl: '$890M',
    risk: 'High',
  },
  {
    name: 'Huma',
    apy: '7.9%',
    description: 'Real-world asset protocol',
    tvl: '$450M',
    risk: 'Medium',
  },
];

export const timeVaultOptions: TimeVaultOption[] = [
  {
    name: 'Ratex USD*-2508',
    apy: '14.5%',
    maturity: 'Mature in 54 days',
    description: 'Fixed-term USD yield farming',
    tvl: '$85M',
    risk: 'Medium',
    lockPeriod: '54 days',
    protocol: 'Ratex Protocol',
  },
  {
    name: 'Ratex USD*-2510',
    apy: '11.31%',
    maturity: 'Mature in 115 days',
    description: 'Extended term USD strategy',
    tvl: '$142M',
    risk: 'Medium',
    lockPeriod: '115 days',
    protocol: 'Ratex Protocol',
  },
  {
    name: 'Ratex USDe-2507',
    apy: '9.27%',
    maturity: 'Mature in 26 days',
    description: 'Short-term USDe strategy',
    tvl: '$67M',
    risk: 'Low-Medium',
    lockPeriod: '26 days',
    protocol: 'Ratex Protocol',
  },
  {
    name: 'Pendle sUSP',
    apy: '16.38%',
    maturity: 'Mature in 53 days',
    description: 'Pendle yield strategy',
    tvl: '$98M',
    risk: 'Medium-High',
    lockPeriod: '53 days',
    protocol: 'Pendle Finance',
  },
  {
    name: 'Pendle reUSDe',
    apy: '12.81%',
    maturity: 'Mature in 165 days',
    description: 'Long-term reUSDe yield',
    tvl: '$156M',
    risk: 'Medium',
    lockPeriod: '165 days',
    protocol: 'Pendle Finance',
  },
  {
    name: 'Pendle sYUSD',
    apy: '12.72%',
    maturity: 'Mature in 60 days',
    description: 'Synthetic YUSD strategy',
    tvl: '$89M',
    risk: 'Medium',
    lockPeriod: '60 days',
    protocol: 'Pendle Finance',
  },
];

export const vaultProducts: VaultProduct[] = [
  {
    name: 'FlexiVault',
    type: 'Current Savings',
    apy: '6.29%',
    description: 'Flexible access anytime',
    minimum: '$100',
    features: ['Instant withdrawals', 'No lock-up period', 'Daily compounding'],
    gradientColors: ['#667eea', '#5a67d8'],
    icon: 'Zap',
  },
  {
    name: 'TimeVault Pro',
    type: 'Fixed Term Savings',
    apy: '11.28%',
    description: 'Higher returns, fixed term',
    minimum: '$1,000',
    features: ['12-month term', 'Guaranteed returns', 'Monthly interest'],
    gradientColors: ['#764ba2', '#9f7aea'],
    icon: 'Clock',
  },
  {
    name: 'MaxVault Elite',
    type: 'Premium Savings',
    apy: '15.75%',
    description: 'Maximum yield for VIP',
    minimum: '$10,000',
    features: ['18-month term', 'Premium rates', 'Priority support'],
    gradientColors: ['#c084fc', '#f093fb'],
    icon: 'Star',
  },
];

export const savingsHistory: Transaction[] = [
  {
    type: 'Interest Earned',
    amount: '+$47.83',
    date: 'Today',
    vault: 'FlexiVault',
    isPositive: true,
  },
  {
    type: 'Interest Earned',
    amount: '+$156.24',
    date: 'Yesterday',
    vault: 'TimeVault Pro',
    isPositive: true,
  },
  {
    type: 'Deposit',
    amount: '+$5,000',
    date: 'Dec 15',
    vault: 'FlexiVault',
    isPositive: false,
  },
  {
    type: 'Interest Earned',
    amount: '+$89.45',
    date: 'Dec 14',
    vault: 'MaxVault Elite',
    isPositive: true,
  },
];

export const getBarHeight = (index: number): number => {
  const heights = [24, 40, 56, 160, 80];
  return heights[index] || 24;
};

// 从vault名称获取协议名称
export const getProtocolFromVaultName = (vaultName: string): string => {
  if (vaultName.includes('Ratex')) return 'Ratex';
  if (vaultName.includes('Pendle')) return 'Pendle';
  return vaultName;
};
