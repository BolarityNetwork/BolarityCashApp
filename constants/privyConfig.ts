// Privy config
export const PRIVY_CONFIG = {
  embedded: {
    ethereum: {
      createOnLogin: 'users-without-wallets' as const,
      requireUserPasswordOnCreate: false,
      noPromptOnSignature: false,
    },
  },
} as const;

// Supported chains
export const SUPPORTED_CHAINS = [
  {
    id: 8453, // Base mainnet
    name: 'Base',
    network: 'base',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://mainnet.base.org'],
      },
      public: {
        http: ['https://mainnet.base.org'],
      },
    },
    blockExplorers: {
      default: {
        name: 'BaseScan',
        url: 'https://basescan.org',
      },
    },
  },
  {
    id: 1, // Ethereum mainnet
    name: 'Ethereum',
    network: 'homestead',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://eth.llamarpc.com'],
      },
      public: {
        http: ['https://eth.llamarpc.com'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Etherscan',
        url: 'https://etherscan.io',
      },
    },
  },
];
