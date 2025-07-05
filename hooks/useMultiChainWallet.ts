// hooks/useMultiChainWallet.ts
import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  usePrivy, 
  useEmbeddedEthereumWallet,
  getUserEmbeddedEthereumWallet 
} from "@privy-io/expo";

// 临时类型定义，等待Privy正式发布Solana类型
interface SolanaWallet {
  address: string;
  cluster: 'mainnet-beta' | 'devnet' | 'testnet';
  publicKey: string;
}

type WalletType = 'ethereum' | 'solana';

interface MultiChainWalletState {
  activeWalletType: WalletType;
  ethereumWallet: any | null;
  solanaWallet: SolanaWallet | null;
  isCreatingSolanaWallet: boolean;
  hasSolanaWallet: boolean;
}

// 创建Context来全局管理钱包状态
interface MultiChainWalletContextType extends MultiChainWalletState {
  switchWalletType: (type: WalletType) => void;
  createSolanaWallet: () => Promise<boolean>;
  removeSolanaWallet: () => Promise<void>;
  getActiveWallet: () => any;
  canSwitchTo: (type: WalletType) => boolean;
  hasEthereumWallet: boolean;
  activeWallet: any;
}

const MultiChainWalletContext = createContext<MultiChainWalletContextType | null>(null);

// Storage keys
const STORAGE_KEYS = {
  SOLANA_WALLET: '@solana_wallet',
  ACTIVE_WALLET_TYPE: '@active_wallet_type',
  HAS_SOLANA_WALLET: '@has_solana_wallet'
};

// 创建一个 hook 来管理钱包状态
export function useMultiChainWalletState(): MultiChainWalletContextType {
  const { user } = usePrivy();
  const { wallets: ethWallets, create: createEthWallet } = useEmbeddedEthereumWallet();
  const ethAccount = getUserEmbeddedEthereumWallet(user);
  
  const [state, setState] = useState<MultiChainWalletState>({
    activeWalletType: 'ethereum',
    ethereumWallet: null,
    solanaWallet: null,
    isCreatingSolanaWallet: false,
    hasSolanaWallet: false
  });

  // 从AsyncStorage加载保存的状态
  const loadPersistedState = useCallback(async () => {
    try {
      const [solanaWalletData, activeWalletType, hasSolanaWallet] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SOLANA_WALLET),
        AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_WALLET_TYPE),
        AsyncStorage.getItem(STORAGE_KEYS.HAS_SOLANA_WALLET)
      ]);

      const persistedSolanaWallet = solanaWalletData ? JSON.parse(solanaWalletData) : null;
      const persistedActiveWalletType = activeWalletType as WalletType || 'ethereum';
      const persistedHasSolanaWallet = hasSolanaWallet === 'true';

      setState(prev => ({
        ...prev,
        solanaWallet: persistedSolanaWallet,
        activeWalletType: persistedActiveWalletType,
        hasSolanaWallet: persistedHasSolanaWallet
      }));
    } catch (error) {
      console.error('Failed to load persisted wallet state:', error);
    }
  }, []);

  // 保存状态到AsyncStorage
  const persistState = useCallback(async (newState: Partial<MultiChainWalletState>) => {
    try {
      const promises = [];
      
      if (newState.solanaWallet !== undefined) {
        promises.push(
          AsyncStorage.setItem(
            STORAGE_KEYS.SOLANA_WALLET, 
            JSON.stringify(newState.solanaWallet)
          )
        );
      }
      
      if (newState.activeWalletType !== undefined) {
        promises.push(
          AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_WALLET_TYPE, newState.activeWalletType)
        );
      }
      
      if (newState.hasSolanaWallet !== undefined) {
        promises.push(
          AsyncStorage.setItem(STORAGE_KEYS.HAS_SOLANA_WALLET, String(newState.hasSolanaWallet))
        );
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to persist wallet state:', error);
    }
  }, []);

  // 初始化时加载持久化状态
  useEffect(() => {
    if (user) {
      loadPersistedState();
    }
  }, [user, loadPersistedState]);

  // 检查用户的钱包状态
  useEffect(() => {
    if (user) {
      setState(prev => ({
        ...prev,
        ethereumWallet: ethAccount
      }));
    }
  }, [user, ethAccount]);

  // 切换活跃钱包类型
  const switchWalletType = useCallback((type: WalletType) => {
    setState(prev => ({ ...prev, activeWalletType: type }));
    persistState({ activeWalletType: type });
  }, [persistState]);

  // 创建Solana钱包
  const createSolanaWallet = useCallback(async () => {
    if (!user) {
      Alert.alert('错误', '请先登录');
      return false;
    }

    setState(prev => ({ ...prev, isCreatingSolanaWallet: true }));
    
    try {
      // TODO: 当Privy支持时，使用真实的创建函数
      // const solanaWallet = await createSolanaWallet();
      
      // 临时模拟创建
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 生成一个看起来像真实Solana地址的模拟地址
      const generateMockSolanaAddress = () => {
        const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < 44; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };
      
      const mockSolanaWallet: SolanaWallet = {
        address: generateMockSolanaAddress(),
        cluster: 'mainnet-beta',
        publicKey: 'mock-public-key-' + Date.now()
      };
      
      const newState = {
        solanaWallet: mockSolanaWallet,
        hasSolanaWallet: true,
        isCreatingSolanaWallet: false,
        activeWalletType: 'solana' as WalletType
      };

      setState(prev => ({
        ...prev,
        ...newState
      }));

      // 持久化新状态
      await persistState(newState);

      Alert.alert('成功', 'Solana钱包创建成功！');
      return true;
    } catch (error) {
      console.error('创建Solana钱包失败:', error);
      Alert.alert('错误', '创建Solana钱包失败');
      setState(prev => ({ ...prev, isCreatingSolanaWallet: false }));
      return false;
    }
  }, [user, persistState]);

  // 删除Solana钱包
  const removeSolanaWallet = useCallback(async () => {
    Alert.alert(
      '确认删除',
      '确定要删除Solana钱包吗？此操作不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive',
          onPress: async () => {
            try {
              const newState = {
                solanaWallet: null,
                hasSolanaWallet: false,
                activeWalletType: 'ethereum' as WalletType
              };

              setState(prev => ({
                ...prev,
                ...newState
              }));

              // 从AsyncStorage删除
              await Promise.all([
                AsyncStorage.removeItem(STORAGE_KEYS.SOLANA_WALLET),
                AsyncStorage.setItem(STORAGE_KEYS.HAS_SOLANA_WALLET, 'false'),
                AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_WALLET_TYPE, 'ethereum')
              ]);

              Alert.alert('成功', 'Solana钱包已删除');
            } catch (error) {
              Alert.alert('错误', '删除失败');
            }
          }
        }
      ]
    );
  }, []);

  // 获取当前活跃钱包信息 - 修改这里，返回iconType而不是icon emoji
  const getActiveWallet = useCallback(() => {
    if (state.activeWalletType === 'ethereum') {
      return {
        type: 'ethereum' as const,
        address: state.ethereumWallet?.address || null,
        network: 'Ethereum Mainnet',
        iconType: 'ethereum' as const, // 返回图标类型而不是emoji
        fallbackIcon: '🔷' // 保留fallback emoji以防万一
      };
    } else {
      return {
        type: 'solana' as const,
        address: state.solanaWallet?.address || null,
        network: state.solanaWallet?.cluster || 'mainnet-beta',
        iconType: 'solana' as const, // 返回图标类型而不是emoji
        fallbackIcon: '🌞' // 保留fallback emoji以防万一
      };
    }
  }, [state]);

  // 检查是否可以切换到指定钱包类型
  const canSwitchTo = useCallback((type: WalletType) => {
    if (type === 'ethereum') {
      return !!state.ethereumWallet?.address;
    } else {
      return state.hasSolanaWallet;
    }
  }, [state]);

  return {
    ...state,
    switchWalletType,
    createSolanaWallet,
    removeSolanaWallet,
    getActiveWallet,
    canSwitchTo,
    hasEthereumWallet: !!state.ethereumWallet?.address,
    activeWallet: getActiveWallet()
  };
}

// Hook来使用Context
export function useMultiChainWallet() {
  const context = useContext(MultiChainWalletContext);
  if (!context) {
    throw new Error('useMultiChainWallet must be used within a MultiChainWalletProvider');
  }
  return context;
}

// 导出Context以供Provider使用
export { MultiChainWalletContext };
export type { MultiChainWalletContextType };

// Solana特定操作的Hook
export function useSolanaOperations() {
  const { user } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);

  // 签名Solana消息
  const signMessage = useCallback(async (message: string) => {
    if (!user) {
      throw new Error('用户未登录');
    }

    setIsLoading(true);
    try {
      // TODO: 使用真实的Privy Solana API
      // const signature = await solanaWallet.signMessage(message);
      
      // 临时模拟
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockSignature = `mock_signature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return mockSignature;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 签名Solana交易
  const signTransaction = useCallback(async (transaction: any) => {
    if (!user) {
      throw new Error('用户未登录');
    }

    setIsLoading(true);
    try {
      // TODO: 使用真实的Privy Solana API
      // return await solanaWallet.signTransaction(transaction);
      
      // 临时模拟
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { signature: 'mock_tx_signature' };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 发送交易
  const sendTransaction = useCallback(async (transaction: any, connection: any) => {
    if (!user) {
      throw new Error('用户未登录');
    }

    setIsLoading(true);
    try {
      // TODO: 使用真实的Privy Solana API
      // return await solanaWallet.sendTransaction(transaction, connection);
      
      // 临时模拟
      await new Promise(resolve => setTimeout(resolve, 2000));
      return 'mock_transaction_hash_' + Date.now();
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    isLoading,
    signMessage,
    signTransaction,
    sendTransaction
  };
}

export default useMultiChainWallet;