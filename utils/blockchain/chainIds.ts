// Chain ID Constants
export const CHAIN_IDS = {
  ETHEREUM: 1,
  POLYGON: 137,
  BASE: 8453,
  SEPOLIA: 11155111,
} as const;

// Chain ID Type
export type ChainId = (typeof CHAIN_IDS)[keyof typeof CHAIN_IDS];

// Chain Name Mapping
export const CHAIN_NAMES = {
  [CHAIN_IDS.ETHEREUM]: 'Ethereum',
  [CHAIN_IDS.POLYGON]: 'Polygon',
  [CHAIN_IDS.BASE]: 'Base',
  [CHAIN_IDS.SEPOLIA]: 'Sepolia',
} as const;

// Get Chain Name
export const getChainName = (chainId: ChainId): string => {
  return CHAIN_NAMES[chainId] || 'Unknown';
};

// Check If Chain ID Is Supported
export const isSupportedChain = (chainId: number): chainId is ChainId => {
  return Object.values(CHAIN_IDS).includes(chainId as ChainId);
};

// Default Chain ID (Base)
export const DEFAULT_CHAIN_ID = CHAIN_IDS.BASE;

export default CHAIN_IDS;
