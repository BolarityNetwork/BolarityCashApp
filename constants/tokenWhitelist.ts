// Token whitelist configuration for different networks and platforms
// This determines which tokens are displayed in the Cash App and included in total balance calculation

export interface TokenWhitelistConfig {
  [network: string]: {
    [platform: string]: string[]; // Array of token addresses (lowercase)
  };
}

// Token whitelist configuration
export const TOKEN_WHITELIST: TokenWhitelistConfig = {
  Mainnet: {
    'eth-mainnet': [
      'native', // ETH
      '0xae7ab96520de3a18e5e111b5eaab095312d7fe84', // stETH
      '0x5a98fcbea516cf06857215779fd812ca3bef1b32', // LDO
      '0xfa2b947eec368f42195f24f36d2af29f7c24cec2', // USDf
    ],
    'optimism-mainnet': [
      'native', // OP
    ],
    'base-mainnet': [
      'native', // Base ETH
      '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC
    ],
    'arbitrum-mainnet': [
      'native', // ARB
    ],
  },
  Testnet: {
    'eth-goerli': [
      'native', // ETH
    ],
    'optimism-goerli': [
      'native', // OP
    ],
    'base-goerli': [
      'native', // Base ETH
    ],
    'arbitrum-goerli': [
      'native', // ARB
    ],
  },
};

// Helper function to check if a token is whitelisted
export const isTokenWhitelisted = (
  network: string,
  platform: string,
  tokenAddress: string
): boolean => {
  const networkConfig = TOKEN_WHITELIST[network];
  if (!networkConfig) return false;

  const platformWhitelist = networkConfig[platform];
  if (!platformWhitelist) return false;

  return platformWhitelist.includes(tokenAddress.toLowerCase());
};

// Helper function to get all whitelisted tokens for a network
export const getWhitelistedTokensForNetwork = (network: string): string[] => {
  const networkConfig = TOKEN_WHITELIST[network];
  if (!networkConfig) return [];

  const allTokens: string[] = [];
  Object.values(networkConfig).forEach(platformTokens => {
    allTokens.push(...platformTokens);
  });

  return allTokens;
};

// Helper function to add a token to whitelist
export const addTokenToWhitelist = (
  network: string,
  platform: string,
  tokenAddress: string
): void => {
  if (!TOKEN_WHITELIST[network]) {
    TOKEN_WHITELIST[network] = {};
  }
  if (!TOKEN_WHITELIST[network][platform]) {
    TOKEN_WHITELIST[network][platform] = [];
  }

  const lowercasedAddress = tokenAddress.toLowerCase();
  if (!TOKEN_WHITELIST[network][platform].includes(lowercasedAddress)) {
    TOKEN_WHITELIST[network][platform].push(lowercasedAddress);
  }
};

// Helper function to remove a token from whitelist
export const removeTokenFromWhitelist = (
  network: string,
  platform: string,
  tokenAddress: string
): void => {
  const networkConfig = TOKEN_WHITELIST[network];
  if (!networkConfig) return;

  const platformWhitelist = networkConfig[platform];
  if (!platformWhitelist) return;

  const lowercasedAddress = tokenAddress.toLowerCase();
  const index = platformWhitelist.indexOf(lowercasedAddress);
  if (index > -1) {
    platformWhitelist.splice(index, 1);
  }
};
