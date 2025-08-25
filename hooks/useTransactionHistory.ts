// hooks/useTransactionHistory.ts
import { useState, useEffect, useCallback } from 'react';
import useMultiChainWallet from './useMultiChainWallet';

export interface RealTransaction {
  hash: string;
  type: string;
  amount: string;
  token: string;
  timestamp: Date;
  protocol: string;
  status: 'success' | 'pending' | 'failed';
  gasUsed?: string;
  isPositive: boolean;
}

interface TransactionHistoryState {
  transactions: RealTransaction[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
}

// DeFi 协议合约地址映射
const PROTOCOL_CONTRACTS = {
  ethereum: {
    aave: [
      '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9',
      '0x87870bace4f8b4a9c2a8c86aa6b1c9b0f1b52b75',
      '0xa238dd80c259a72e81d7e4664a9801593f98d1c5',
    ],
    compound: [
      '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b',
      '0xc3d688b66703497daa19211eedff47f25384cdc3',
    ],
    uniswap: [
      '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
      '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
    ],
  },
  solana: {
    drift: ['DRiPbdKYaGfDXRiQeqKPjqNXVGH7LN8EtixZtHF5KYoC'],
    solend: ['LendZqTs7gn5CTSJU1jWKhKuVpjJ6km9x6m3hbNq5Sg'],
    raydium: ['675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'],
  },
};

// Whitelist of legitimate tokens - Unix way: explicit is better than implicit
const LEGITIMATE_TOKENS = new Set([
  'ETH',
  'WETH',
  'USDC',
  'USDT',
  'DAI',
  'WBTC',
  'LINK',
  'UNI',
  'AAVE',
  'COMP',
]);

// Scam token detection patterns
const SCAM_PATTERNS = [
  /^[A-Z]+\d+$/, // Random letters + numbers (e.g., ABC123)
  /[\u4e00-\u9fff]/, // Chinese characters
  /[\u0600-\u06ff]/, // Arabic characters
  /[\u0400-\u04ff]/, // Cyrillic characters
  /(.)\1{3,}/, // Repeated characters (e.g., AAAA)
  /^.{1,2}$/, // Too short (1-2 chars)
  /^.{15,}$/, // Too long (15+ chars)
];

// Clean token filter - reject garbage
function isLegitimateToken(tokenSymbol: string): boolean {
  if (!tokenSymbol) return false;

  // Whitelist check first
  if (LEGITIMATE_TOKENS.has(tokenSymbol.toUpperCase())) {
    return true;
  }

  // Reject obvious scam patterns
  for (const pattern of SCAM_PATTERNS) {
    if (pattern.test(tokenSymbol)) {
      return false;
    }
  }

  // Reject tokens with weird characters
  if (!/^[A-Za-z0-9]+$/.test(tokenSymbol)) {
    return false;
  }

  return true;
}

// Simple protocol detection - Unix way: direct lookup
function getProtocolFromAddress(address: string): string {
  const addr = address.toLowerCase();

  for (const [protocol, addresses] of Object.entries(
    PROTOCOL_CONTRACTS.ethereum
  )) {
    if (addresses.some(contractAddr => contractAddr.toLowerCase() === addr)) {
      return protocol.toUpperCase();
    }
  }

  return 'Ethereum';
}

// Real blockchain transaction fetching - no fake data

export function useTransactionHistory() {
  const { activeChain, ethereumAddress, solanaAddress } = useMultiChainWallet();

  const [state, setState] = useState<TransactionHistoryState>({
    transactions: [],
    isLoading: false,
    error: null,
    hasMore: true,
  });

  // 获取当前活跃地址
  const getCurrentAddress = useCallback(() => {
    return activeChain === 'ethereum' ? ethereumAddress : solanaAddress;
  }, [activeChain, ethereumAddress, solanaAddress]);

  // 从区块链获取真实交易记录
  const fetchTransactions = useCallback(
    async (address: string, offset = 0) => {
      if (!address) return [];

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // 在实际应用中，这里应该调用区块链 RPC
        if (activeChain === 'ethereum') {
          return await fetchEthereumTransactions(address, offset);
        } else {
          return await fetchSolanaTransactions(address, offset);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to fetch transactions',
        }));
        return [];
      }
    },
    [activeChain]
  );

  // Direct Alchemy Base RPC - efficient asset transfer API
  const fetchEthereumTransactions = async (
    address: string,
    offset: number
  ): Promise<RealTransaction[]> => {
    try {
      const rpcUrl =
        'https://base-mainnet.g.alchemy.com/v2/sxUAcWibwUCvJpaatUFXbX_khrwgsAT6';

      // Get transfers FROM the address (outgoing)
      const outgoingResponse = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'alchemy_getAssetTransfers',
          params: [
            {
              fromAddress: address,
              category: ['external', 'erc20', 'erc721', 'erc1155'],
              order: 'desc',
              maxCount: '0x14', // 20 results
            },
          ],
          id: 1,
        }),
      });

      // Get transfers TO the address (incoming)
      const incomingResponse = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'alchemy_getAssetTransfers',
          params: [
            {
              toAddress: address,
              category: ['external', 'erc20', 'erc721', 'erc1155'],
              order: 'desc',
              maxCount: '0x14', // 20 results
            },
          ],
          id: 2,
        }),
      });

      const [outgoingData, incomingData] = await Promise.all([
        outgoingResponse.json(),
        incomingResponse.json(),
      ]);

      const allTransfers = [
        ...(outgoingData.result?.transfers || []),
        ...(incomingData.result?.transfers || []),
      ];

      // Remove duplicates and sort by block number
      const uniqueTransfers = allTransfers
        .filter(
          (transfer, index, self) =>
            index === self.findIndex(t => t.hash === transfer.hash)
        )
        .sort((a, b) => parseInt(b.blockNum, 16) - parseInt(a.blockNum, 16));

      const transactions: RealTransaction[] = uniqueTransfers
        .filter(transfer => {
          // Filter out scam tokens - Unix principle: fail early
          const tokenSymbol = transfer.asset || 'ETH';
          const isLegit = isLegitimateToken(tokenSymbol);

          if (!isLegit) {
            return false;
          }

          return true;
        })
        .map(transfer => {
          const protocol = getProtocolFromAddress(transfer.to);
          const isIncoming =
            transfer.to.toLowerCase() === address.toLowerCase();
          const isDefi = protocol !== 'Ethereum';

          // Determine transaction type
          let type = 'Transfer';
          if (isDefi) {
            if (protocol === 'AAVE') {
              type = transfer.asset === 'ETH' ? 'AAVE Deposit' : 'AAVE Token';
            } else {
              type = `${protocol} Transaction`;
            }
          } else {
            type = isIncoming ? 'Received' : 'Sent';
          }

          return {
            hash: transfer.hash,
            type,
            amount: transfer.value?.toString() || '0',
            token: transfer.asset || 'ETH',
            timestamp: new Date(parseInt(transfer.blockNum, 16) * 12 * 1000), // Approximate timestamp
            protocol,
            status: 'success' as const,
            isPositive: isIncoming || isDefi,
          };
        });

      return transactions.slice(offset, offset + 20);
    } catch (_) {
      return [];
    }
  };

  // 获取 Solana 交易记录
  const fetchSolanaTransactions = async (
    address: string
  ): Promise<RealTransaction[]> => {
    try {
      // 直接调用 Solana RPC 获取真实交易签名
      const sigResponse = await fetch('https://api.mainnet-beta.solana.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignaturesForAddress',
          params: [address, { limit: 10 }],
        }),
      });

      if (!sigResponse.ok) {
        throw new Error(`HTTP ${sigResponse.status}`);
      }

      const sigData = await sigResponse.json();

      if (sigData.error || !sigData.result) {
        return [];
      }

      // 获取每个交易的详细信息
      const transactions: RealTransaction[] = [];

      for (const sig of sigData.result.slice(0, 10)) {
        try {
          const txResponse = await fetch(
            'https://api.mainnet-beta.solana.com',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getTransaction',
                params: [
                  sig.signature,
                  { encoding: 'json', maxSupportedTransactionVersion: 0 },
                ],
              }),
            }
          );

          const txData = await txResponse.json();

          if (txData.result) {
            const tx = txData.result;
            const preBalance = tx.meta?.preBalances?.[0] || 0;
            const postBalance = tx.meta?.postBalances?.[0] || 0;
            const balanceChange = (postBalance - preBalance) / 1000000000; // lamports to SOL

            transactions.push({
              hash: sig.signature,
              type: balanceChange > 0 ? 'Deposit' : 'Withdraw',
              amount: Math.abs(balanceChange).toFixed(6),
              token: 'SOL',
              timestamp: new Date((sig.blockTime || 0) * 1000),
              protocol: 'Solana',
              status: sig.err ? 'failed' : 'success',
              isPositive: balanceChange > 0,
            });
          }
        } catch (txError) {
          console.error(
            `Failed to fetch transaction ${sig.signature}:`,
            txError
          );
        }
      }

      return transactions;
    } catch (error) {
      console.error('Solana API failed:', error);
      return [];
    }
  };

  // 加载交易记录
  const loadTransactions = useCallback(
    async (refresh = false) => {
      const address = getCurrentAddress();
      if (!address) {
        setState(prev => ({
          ...prev,
          transactions: [],
          isLoading: false,
          error: 'No wallet connected',
        }));
        return;
      }

      const offset = refresh ? 0 : state.transactions.length;
      const newTransactions = await fetchTransactions(address, offset);

      setState(prev => ({
        ...prev,
        isLoading: false,
        transactions: refresh
          ? newTransactions
          : [...prev.transactions, ...newTransactions],
        hasMore: newTransactions.length > 0,
        error: null,
      }));
    },
    [getCurrentAddress, fetchTransactions, state.transactions.length]
  );

  // 刷新交易记录
  const refreshTransactions = useCallback(() => {
    loadTransactions(true);
  }, [loadTransactions]);

  // 加载更多交易记录
  const loadMoreTransactions = useCallback(() => {
    if (!state.isLoading && state.hasMore) {
      loadTransactions(false);
    }
  }, [loadTransactions, state.isLoading, state.hasMore]);

  // 监听钱包变化，自动刷新交易记录
  useEffect(() => {
    const address = getCurrentAddress();
    if (address) {
      refreshTransactions();
    }
  }, [getCurrentAddress, refreshTransactions]);

  // 格式化交易记录为旧格式（保持兼容性）
  const getFormattedTransactions = useCallback(() => {
    return state.transactions.map(tx => ({
      type: tx.type,
      amount: `${tx.isPositive ? '+' : ''}$${tx.amount}`,
      date: formatDate(tx.timestamp),
      vault: tx.protocol,
      isPositive: tx.isPositive,
      hash: tx.hash,
      token: tx.token,
      status: tx.status,
    }));
  }, [state.transactions]);

  return {
    // 状态
    transactions: state.transactions,
    formattedTransactions: getFormattedTransactions(),
    isLoading: state.isLoading,
    error: state.error,
    hasMore: state.hasMore,

    // 方法
    refreshTransactions,
    loadMoreTransactions,

    // 统计
    totalTransactions: state.transactions.length,
    currentAddress: getCurrentAddress(),
    currentChain: activeChain,
  };
}

// 工具函数：格式化日期
function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
