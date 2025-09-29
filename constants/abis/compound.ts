// Compound V3 ABI definitions
export const COMPOUND_ABI = {
  comet: [
    'function supply(address asset, uint amount)',
    'function withdraw(address asset, uint amount)',
    'function balanceOf(address account) view returns (uint256)',
    'function collateralBalanceOf(address account, address asset) view returns (uint128)',
    'function getSupplyRate(uint utilization) view returns (uint64)',
    'function getBorrowRate(uint utilization) view returns (uint64)',
    'function getUtilization() view returns (uint256)',
    'function baseToken() view returns (address)',
    'function numAssets() view returns (uint8)',
    'function getAssetInfo(uint8 i) view returns (uint8 offset, address asset, address priceFeed, uint128 scale, uint128 borrowCollateralFactor, uint128 liquidateCollateralFactor, uint128 liquidationFactor, uint128 supplyCap)',
    'function totalSupply() view returns (uint256)',
    'function totalBorrow() view returns (uint256)',
    'function totalsCollateral(address asset) view returns (uint128 totalSupplyAsset, uint128 totalBorrowAsset)',
    'function getPrice(address priceFeed) view returns (uint256)',
    'function baseTokenPriceFeed() view returns (address)',
  ],
  rewards: [
    'function claim(address comet, address src, bool shouldAccrue)',
    'function getRewardOwed(address comet, address account) view returns (uint256, uint256)',
    'function rewardConfig(address comet) view returns (address token, uint64 rescaleFactor, bool shouldUpscale)',
  ],
  erc20: [
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function name() view returns (string)',
  ],
} as const;

// Compound V3 Market Configuration
export const COMPOUND_MARKETS = {
  ethereum: {
    comet: '0xc3d688B66703497DAA19211EEdff47f25384cdc3', // cUSDCv3 Comet
    rewards: '0x1B0e765F6224C21223AeA2af16c1C46E38885a40', // CometRewards
    USDC: {
      underlying: '0xA0b86a33E6441E1A1E5c87A3dC9E1e18e8f0b456',
      decimals: 6,
    },
    WETH: {
      underlying: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18,
    },
  },
  base: {
    comet: '0xb125E6687d4313864e53df431d5425969c15Eb2F', // Base cUSDCv3
    rewards: '0x123964802e6ABabBE1Bc9547D72Ef1B69B00A6b1', // Base CometRewards
    USDC: {
      underlying: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6,
    },
    WETH: {
      underlying: '0x4200000000000000000000000000000000000006', // Base WETH
      decimals: 18,
    },
    cbETH: {
      underlying: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', // Base cbETH
      decimals: 18,
    },
  },
} as const;
