import {
  VaultOption,
  TimeVaultOption,
  VaultProduct,
  Transaction,
} from '@/interfaces/home';

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
  // {
  //   name: 'MaxVault Elite',
  //   type: 'Premium Savings',
  //   apy: '15.75%',
  //   description: 'Maximum yield for VIP',
  //   minimum: '$10,000',
  //   features: ['18-month term', 'Premium rates', 'Priority support'],
  //   gradientColors: ['#c084fc', '#f093fb'],
  //   icon: 'Star',
  // },
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

// components/PerfectVaultSavingsPlatform/assets/logos.ts

// 🖼️ 安全导入本地logo图片 - 带try-catch处理
let aaveLogo,
  compoundLogo,
  driftLogo,
  solendLogo,
  naviLogo,
  humaLogo,
  ratexLogo,
  pendleLogo,
  bolarityLogo;
let flexiVaultLogo, timeVaultLogo, maxVaultLogo;

try {
  aaveLogo = require('@/assets/logos/aave.png');
} catch (_) {
  console.warn('AAVE logo not found');
}

try {
  compoundLogo = require('@/assets/logos/compound.png');
} catch (_) {
  console.warn('Compound logo not found');
}

try {
  driftLogo = require('@/assets/logos/drift.png');
} catch (_) {
  console.warn('Drift logo not found');
}

try {
  solendLogo = require('@/assets/logos/solend.png');
} catch (_) {
  console.warn('Solend logo not found');
}

try {
  naviLogo = require('@/assets/logos/navi.png');
} catch (_) {
  console.warn('Navi logo not found');
}

try {
  humaLogo = require('@/assets/logos/huma.png');
} catch (_) {
  console.warn('Huma logo not found');
}

try {
  ratexLogo = require('@/assets/logos/ratex.png');
} catch (_) {
  console.warn('Ratex logo not found');
}

try {
  pendleLogo = require('@/assets/logos/pendle.png');
} catch (_) {
  console.warn('Pendle logo not found');
}

try {
  bolarityLogo = require('@/assets/logos/bolarity.png');
} catch (_) {
  console.warn('Bolarity logo not found');
}

// 🎯 Vault 产品专用 Logo
try {
  flexiVaultLogo = require('@/assets/logos/flexivault.png');
} catch (_) {
  console.warn('FlexiVault logo not found');
}

try {
  timeVaultLogo = require('@/assets/logos/timevault.png');
} catch (_) {
  console.warn('TimeVault logo not found');
}

try {
  maxVaultLogo = require('@/assets/logos/maxvault.png');
} catch (_) {
  console.warn('MaxVault logo not found');
}

// Protocol Logo映射
export const PROTOCOL_LOGOS = {
  AAVE: aaveLogo,
  Drift: driftLogo,
  Compound: compoundLogo,
  Solend: solendLogo,
  Navi: naviLogo,
  Huma: humaLogo,
  Ratex: ratexLogo,
  Pendle: pendleLogo,
};

// Vault Logo映射
export const VAULT_LOGOS = {
  FlexiVault: flexiVaultLogo,
  'TimeVault Pro': timeVaultLogo,
  'MaxVault Elite': maxVaultLogo,
};

// Vault图标映射
export const VAULT_FALLBACK_ICONS = {
  FlexiVault: '⚡',
  'TimeVault Pro': '⏰',
  'MaxVault Elite': '⭐',
};

// Protocol备用图标
export const PROTOCOL_FALLBACK_ICONS = {
  AAVE: '🏛️',
  Drift: '🌊',
  Compound: '🔷',
  Solend: '☀️',
  Navi: '🧭',
  Huma: '🌍',
  Ratex: '💎',
  Pendle: '🔮',
};

// 其他logo
export { bolarityLogo };
