import { CoinData } from '@/api/account';
import { isTokenWhitelisted } from '@/constants/tokenWhitelist';

// Interface for processed balance data
export interface ProcessedBalanceData {
  totalBalance: number;
  whitelistedTokens: CoinData[];
  allTokens: CoinData[];
  todayEarnings: number; // Placeholder for future implementation
  monthlyEarnings: number; // Placeholder for future implementation
}

// Helper function to parse balance string to number
export const parseBalanceString = (balanceStr: string): number => {
  return parseFloat(balanceStr) || 0;
};

// Helper function to calculate total balance from whitelisted tokens
export const calculateTotalBalance = (tokens: CoinData[]): number => {
  return tokens.reduce((total, token) => {
    return total + parseBalanceString(token.balance);
  }, 0);
};

// Helper function to filter tokens based on whitelist
export const filterWhitelistedTokens = (
  tokens: CoinData[],
  network: string
): CoinData[] => {
  return tokens.filter(token =>
    isTokenWhitelisted(network, token.platform, token.address)
  );
};

// Main function to process balance data
export const processBalanceData = (
  tokens: CoinData[],
  network: string
): ProcessedBalanceData => {
  const whitelistedTokens = filterWhitelistedTokens(tokens, network);
  const totalBalance = calculateTotalBalance(whitelistedTokens);

  return {
    totalBalance,
    whitelistedTokens,
    allTokens: tokens,
    todayEarnings: 0, // TODO: Implement earnings calculation
    monthlyEarnings: 0, // TODO: Implement earnings calculation
  };
};

// Helper function to format currency
export const formatCurrency = (
  amount: number,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    prefix?: string;
  } = {}
): string => {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    prefix = '$',
  } = options;

  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return `${prefix}${formatted}`;
};

// Helper function to get token display name
export const getTokenDisplayName = (token: CoinData): string => {
  if (token.address === 'native') {
    // Map platform to native token symbol
    const platformSymbolMap: { [key: string]: string } = {
      'eth-mainnet': 'ETH',
      'optimism-mainnet': 'OP',
      'base-mainnet': 'ETH',
      'arbitrum-mainnet': 'ARB',
    };
    return platformSymbolMap[token.platform] || token.symbol;
  }
  return token.symbol;
};

// Interface for asset distribution
export interface AssetDistribution {
  USD: number;
  BTC: number;
  ETH: number;
  Other: number;
}

// Helper function to categorize tokens by type
export const categorizeTokenByType = (
  token: CoinData
): 'USD' | 'BTC' | 'ETH' | 'Other' => {
  const symbol = token.symbol.toUpperCase();
  const name = token.name.toUpperCase();

  // USD-pegged tokens
  if (
    symbol === 'USDC' ||
    symbol === 'USDT' ||
    symbol === 'DAI' ||
    symbol === 'BUSD' ||
    name.includes('USD') ||
    name.includes('DOLLAR')
  ) {
    return 'USD';
  }

  // Bitcoin-related tokens
  if (
    symbol === 'BTC' ||
    symbol === 'WBTC' ||
    symbol === 'BTCB' ||
    name.includes('BITCOIN') ||
    name.includes('BTC')
  ) {
    return 'BTC';
  }

  // Ethereum-related tokens
  if (
    symbol === 'ETH' ||
    symbol === 'WETH' ||
    name.includes('ETHEREUM') ||
    name.includes('ETHER')
  ) {
    return 'ETH';
  }

  // Everything else
  return 'Other';
};

// Function to calculate asset distribution from token data
export const calculateAssetDistribution = (
  tokens: CoinData[]
): AssetDistribution => {
  const distribution: AssetDistribution = {
    USD: 0,
    BTC: 0,
    ETH: 0,
    Other: 0,
  };

  // Calculate total balance first
  const totalBalance = calculateTotalBalance(tokens);

  if (totalBalance === 0) {
    return distribution;
  }

  // Group tokens by category and sum their balances
  tokens.forEach(token => {
    const balance = parseBalanceString(token.balance);
    const category = categorizeTokenByType(token);
    distribution[category] += balance;
  });

  // Convert to percentages
  return {
    USD: distribution.USD / totalBalance,
    BTC: distribution.BTC / totalBalance,
    ETH: distribution.ETH / totalBalance,
    Other: distribution.Other / totalBalance,
  };
};
