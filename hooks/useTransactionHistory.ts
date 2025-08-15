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
    aave: ['0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9', '0x87870bace4f8b4a9c2a8c86aa6b1c9b0f1b52b75'],
    compound: ['0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b', '0xc3d688b66703497daa19211eedff47f25384cdc3'],
    uniswap: ['0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45']
  },
  solana: {
    drift: ['DRiPbdKYaGfDXRiQeqKPjqNXVGH7LN8EtixZtHF5KYoC'],
    solend: ['LendZqTs7gn5CTSJU1jWKhKuVpjJ6km9x6m3hbNq5Sg'],
    raydium: ['675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8']
  }
};

// 模拟真实交易数据（实际应该从区块链获取）
const mockRealTransactions: RealTransaction[] = [
  {
    hash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
    type: 'Deposit',
    amount: '1000.00',
    token: 'USDC',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
    protocol: 'AAVE',
    status: 'success',
    gasUsed: '0.0023',
    isPositive: false
  },
  {
    hash: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234',
    type: 'Interest Earned',
    amount: '12.45',
    token: 'USDC',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
    protocol: 'AAVE',
    status: 'success',
    isPositive: true
  },
  {
    hash: '0x3c4d5e6f7890abcdef1234567890abcdef123456',
    type: 'Withdraw',
    amount: '500.00',
    token: 'USDC',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1天前
    protocol: 'Compound',
    status: 'success',
    gasUsed: '0.0034',
    isPositive: true
  },
  {
    hash: 'Abc123def456ghi789jkl012mno345pqr678stu9vw',
    type: 'Deposit',
    amount: '2000.00',
    token: 'SOL',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2天前
    protocol: 'Drift',
    status: 'success',
    isPositive: false
  }
];

export function useTransactionHistory() {
  const { activeChain, ethereumAddress, solanaAddress } = useMultiChainWallet();
  
  const [state, setState] = useState<TransactionHistoryState>({
    transactions: [],
    isLoading: false,
    error: null,
    hasMore: true
  });

  // 获取当前活跃地址
  const getCurrentAddress = useCallback(() => {
    return activeChain === 'ethereum' ? ethereumAddress : solanaAddress;
  }, [activeChain, ethereumAddress, solanaAddress]);

  // 从区块链获取真实交易记录
  const fetchTransactions = useCallback(async (address: string, offset = 0) => {
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
        error: error instanceof Error ? error.message : 'Failed to fetch transactions'
      }));
      return [];
    }
  }, [activeChain]);

  // 获取 Ethereum 交易记录
  const fetchEthereumTransactions = async (address: string, offset: number): Promise<RealTransaction[]> => {
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 实际实现应该调用 Etherscan 或 Alchemy API
    // const response = await fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${API_KEY}`);
    
    return mockRealTransactions.filter(tx => 
      ['AAVE', 'Compound', 'Uniswap'].includes(tx.protocol)
    ).slice(offset, offset + 10);
  };

  // 获取 Solana 交易记录
  const fetchSolanaTransactions = async (address: string, offset: number): Promise<RealTransaction[]> => {
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 实际实现应该调用 Solana RPC API
    // const response = await fetch('https://api.mainnet-beta.solana.com', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     jsonrpc: '2.0',
    //     id: 1,
    //     method: 'getSignaturesForAddress',
    //     params: [address, { limit: 10, before: offset }]
    //   })
    // });
    
    return mockRealTransactions.filter(tx => 
      ['Drift', 'Solend', 'Raydium'].includes(tx.protocol)
    ).slice(offset, offset + 10);
  };

  // 加载交易记录
  const loadTransactions = useCallback(async (refresh = false) => {
    const address = getCurrentAddress();
    if (!address) {
      setState(prev => ({ 
        ...prev, 
        transactions: [], 
        isLoading: false,
        error: 'No wallet connected'
      }));
      return;
    }

    const offset = refresh ? 0 : state.transactions.length;
    const newTransactions = await fetchTransactions(address, offset);
    
    setState(prev => ({
      ...prev,
      isLoading: false,
      transactions: refresh ? newTransactions : [...prev.transactions, ...newTransactions],
      hasMore: newTransactions.length > 0,
      error: null
    }));
  }, [getCurrentAddress, fetchTransactions, state.transactions.length]);

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
      status: tx.status
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
    currentChain: activeChain
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
    day: 'numeric'
  });
}