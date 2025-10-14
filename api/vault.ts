// Mock vault data API
export interface VaultItem {
  id: string;
  protocol: string;
  risk: string;
  apy: string;
  tvl: string;
  note: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface VaultData {
  [category: string]: VaultItem[];
}

// Mock category data
export const mockCategoryData: CategoryInfo[] = [
  {
    id: 'flexi',
    name: 'FlexiVault',
    description: 'Flexible access anytime',
    icon: 'https://assets.coingecko.com/coins/images/22540/small/USDC.png?1644979850',
  },
  {
    id: 'time',
    name: 'TimeVault Pro',
    description: 'Higher returns, fixed term',
    icon: 'https://assets.coingecko.com/coins/images/22540/small/USDC.png?1644979850',
  },
];

// Mock vault data based on the image content
export const mockVaultData: VaultData = {
  flexi: [
    {
      id: 'cashapp-compound-usdc-base',
      protocol: 'compound',
      risk: 'low',
      apy: '3.98%',
      tvl: '$16,795,348.63',
      note: 'Flexi vault pointing to Base USDC Compound market.',
    },
    {
      id: 'cashapp-aave-usdc-base',
      protocol: 'aave',
      risk: 'low',
      apy: '5.78%',
      tvl: '$378,078,876.42',
      note: 'Flexi vault pointing to Aave Base USDC reserve.',
    },
  ],
  time: [
    {
      id: 'cashapp-pendle-usde-20251211',
      protocol: 'pendle',
      risk: 'medium',
      apy: '9.56%',
      tvl: '$76,555.9',
      note: 'Time vault referencing Pendle PT USDe Dec 2025 market.',
    },
  ],
};

// Mock API functions
export const getCategories = async (): Promise<CategoryInfo[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockCategoryData;
};

export const getVaultsByCategoryId = async (
  categoryId: string
): Promise<VaultItem[] | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockVaultData[categoryId] || null;
};
