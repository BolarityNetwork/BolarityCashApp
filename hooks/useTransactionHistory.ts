// hooks/useTransactionHistory.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import useMultiChainWallet from './useMultiChainWallet';
import { useTokenTransfers, TokenTransferItem } from '@/api/account';
import { formatCurrency } from '@/utils/balance';
import { formatDate as formatDateUtil } from '@/utils/utils';

export interface RealTransaction {
  hash: string;
  txHash: string;
  type: string;
  amount: string;
  token: string;
  timestamp: Date;
  protocol: string;
  status: 'success' | 'pending' | 'failed';
  isPositive: boolean;
  vault: string;
}

interface TransactionHistoryState {
  transactions: RealTransaction[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  pageSize: number;
}

const PAGE_SIZE = 50; // 默认每页50条

export function useTransactionHistory() {
  const { activeChain, ethereumAddress, solanaAddress } = useMultiChainWallet();

  const [state, setState] = useState<TransactionHistoryState>({
    transactions: [],
    isLoading: false,
    error: null,
    hasMore: true,
    currentPage: 1,
    pageSize: PAGE_SIZE,
  });

  // 获取当前活跃地址
  const getCurrentAddress = useCallback(() => {
    return activeChain === 'ethereum' ? ethereumAddress : solanaAddress;
  }, [activeChain, ethereumAddress, solanaAddress]);

  // 获取当前 chainId（基于 activeChain 和网络配置）
  const getCurrentChainId = useCallback(() => {
    // TODO: 根据 activeChain 和网络配置返回正确的 chainId
    // 目前默认为 8453 (Base Mainnet)
    return '8453';
  }, [activeChain]);

  // 使用新的 API hook
  const {
    data: apiData,
    isLoading: apiLoading,
    error: apiError,
  } = useTokenTransfers(
    getCurrentAddress() || '',
    state.currentPage.toString(),
    state.pageSize.toString(),
    getCurrentChainId(),
    !!getCurrentAddress()
  );

  // 将 API 数据转换为 RealTransaction 格式
  const mapApiTransaction = useCallback(
    (item: TokenTransferItem): RealTransaction => {
      // 判断是转入还是转出
      const currentAddress = getCurrentAddress();
      const isPositive = Boolean(
        item.type === 'deposit' ||
          item.type === 'receive' ||
          (currentAddress &&
            item.to.toLowerCase() === currentAddress.toLowerCase())
      );

      // 格式化金额
      const amountValue =
        parseFloat(item.amount) / Math.pow(10, item.tokenDecimals);

      return {
        hash: item.timestamp.toString(), // 使用时间戳作为 key
        txHash: item.txHash,
        type: item.type, // 直接使用后端返回的类型
        amount: amountValue.toString(),
        token: item.tokenSymbol,
        timestamp: new Date(item.timestamp * 1000),
        protocol: 'DeFi',
        status: item.status,
        isPositive,
        vault: item.tokenSymbol,
      };
    },
    [getCurrentAddress]
  );

  // 当 API 数据变化时更新状态
  useEffect(() => {
    if (apiLoading) {
      setState(prev => ({ ...prev, isLoading: true }));
      return;
    }

    if (apiError) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error:
          apiError instanceof Error
            ? apiError.message
            : 'Failed to fetch transactions',
      }));
      return;
    }

    if (apiData && apiData.data) {
      const transactions = apiData.data.map(mapApiTransaction);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        hasMore: transactions.length >= prev.pageSize, // 如果返回的数量等于pageSize，可能还有更多
      }));
    }
  }, [apiData, apiLoading, apiError, mapApiTransaction, state.pageSize]);

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

      // 重置分页
      if (refresh) {
        setState(prev => ({ ...prev, currentPage: 1 }));
      }
    },
    [getCurrentAddress]
  );

  // 刷新交易记录
  const refreshTransactions = useCallback(() => {
    loadTransactions(true);
  }, [loadTransactions]);

  // 加载更多交易记录
  const loadMoreTransactions = useCallback(() => {
    if (!state.isLoading && state.hasMore) {
      setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  }, [state.isLoading, state.hasMore]);

  // 监听地址变化，自动刷新交易记录
  useEffect(() => {
    const address = getCurrentAddress();
    if (address) {
      refreshTransactions();
    }
  }, [getCurrentAddress, refreshTransactions]);

  // 获取当前页的交易记录（用于显示）
  const currentTransactions = useMemo(() => {
    if (!apiData || !apiData.data) return [];
    return apiData.data.map(mapApiTransaction);
  }, [apiData, mapApiTransaction]);

  // 格式化交易记录为旧格式（保持兼容性）
  const getFormattedTransactions = useCallback(() => {
    return currentTransactions.map(tx => {
      const txAmount = parseFloat(tx.amount);
      const formattedAmount = formatCurrency(txAmount, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
        prefix: '',
      });
      const formattedDate = formatDateUtil(
        tx.timestamp.getTime() / 1000,
        false,
        true
      );
      return {
        type: tx.type,
        amount: `${tx.isPositive ? '+' : ''}$${formattedAmount}`,
        date: formattedDate || formatDate(tx.timestamp), // fallback to local format if null
        vault: tx.vault,
        isPositive: tx.isPositive,
        hash: tx.txHash || tx.hash,
        token: tx.token,
        status: tx.status,
      };
    });
  }, [currentTransactions]);

  return {
    // 状态
    transactions: currentTransactions,
    formattedTransactions: getFormattedTransactions(),
    isLoading: state.isLoading,
    error: state.error,
    hasMore: state.hasMore,

    // 方法
    refreshTransactions,
    loadMoreTransactions,

    // 统计
    totalTransactions: currentTransactions.length,
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
