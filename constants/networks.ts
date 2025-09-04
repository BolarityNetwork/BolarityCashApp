// 网络配置常量

// AAVE 网络配置
export const AAVE_NETWORKS = {
  mainnet: {
    POOL_ADDRESS: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    USDC_ADDRESS: '0xA0b86a33E6417c8Aba82fd3B5f1Dc4823442FA1B',
    ADDRESSES_PROVIDER: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e',
    CHAIN_ID: '0x1',
    NAME: 'Ethereum Mainnet',
  },
  polygon: {
    POOL_ADDRESS: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    USDC_ADDRESS: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    ADDRESSES_PROVIDER: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
    CHAIN_ID: '0x89',
    NAME: 'Polygon',
  },
  sepolia: {
    POOL_ADDRESS: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951',
    USDC_ADDRESS: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
    ADDRESSES_PROVIDER: '0x0496275d34753A48320CA58103d5220d394FF77F',
    CHAIN_ID: '0xaa36a7',
    NAME: 'Sepolia Testnet',
  },
  base: {
    POOL_ADDRESS: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
    USDC_ADDRESS: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    ADDRESSES_PROVIDER: '0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D',
    CHAIN_ID: '0x2105',
    NAME: 'Base',
  },
} as const;

// 通用网络配置
export const NETWORKS = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    chainId: '0x1',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    chainId: '0x89',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  base: {
    id: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    chainId: '0x2105',
    explorerUrl: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  sepolia: {
    id: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    chainId: '0xaa36a7',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
} as const;

// RPC 节点配置
export const RPC_ENDPOINTS = {
  ethereum: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
  polygon: 'https://polygon-rpc.com',
  base: 'https://mainnet.base.org',
  sepolia: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  solana: 'https://api.mainnet-beta.solana.com',
} as const;

// 链 ID 常量
export const CHAIN_IDS = {
  ETHEREUM: '0x1',
  POLYGON: '0x89',
  BASE: '0x2105',
  SEPOLIA: '0xaa36a7',
} as const;
