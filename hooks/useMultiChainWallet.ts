// hooks/useMultiChainWallet.ts
import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  usePrivy, 
  useEmbeddedEthereumWallet,
  getUserEmbeddedEthereumWallet,
  useEmbeddedSolanaWallet,
  getUserEmbeddedSolanaWallet,
} from "@privy-io/expo";

type WalletType = 'ethereum' | 'solana';

interface MultiChainWalletState {
  activeWalletType: WalletType;
  ethereumWallet: any | null;
  solanaWallet: any | null;
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
  ACTIVE_WALLET_TYPE: '@active_wallet_type',
};

// 创建一个 hook 来管理钱包状态
export function useMultiChainWalletState(): MultiChainWalletContextType {
  const { user } = usePrivy();
  
  // Ethereum wallet hooks
  const { wallets: ethWallets, create: createEthWallet } = useEmbeddedEthereumWallet();
  const ethAccount = getUserEmbeddedEthereumWallet(user);
  
  // Solana wallet hooks - 使用官方 Privy Solana 支持
  const { wallets: solWallets, create: createSolWallet } = useEmbeddedSolanaWallet();
  const solAccount = getUserEmbeddedSolanaWallet(user);
  
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
      const activeWalletType = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_WALLET_TYPE);
      const persistedActiveWalletType = activeWalletType as WalletType || 'ethereum';

      setState(prev => ({
        ...prev,
        activeWalletType: persistedActiveWalletType,
      }));
    } catch (error) {
      console.error('Failed to load persisted wallet state:', error);
    }
  }, []);

  // 保存状态到AsyncStorage
  const persistState = useCallback(async (newState: Partial<MultiChainWalletState>) => {
    try {
      if (newState.activeWalletType !== undefined) {
        await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_WALLET_TYPE, newState.activeWalletType);
      }
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

  // 更新钱包状态 - 使用真实的 Privy 钱包数据
  useEffect(() => {
    if (user) {
      setState(prev => ({
        ...prev,
        ethereumWallet: ethAccount,
        solanaWallet: solAccount,
        hasSolanaWallet: !!solAccount
      }));
    }
  }, [user, ethAccount, solAccount]);

  // 切换活跃钱包类型
  const switchWalletType = useCallback((type: WalletType) => {
    setState(prev => ({ ...prev, activeWalletType: type }));
    persistState({ activeWalletType: type });
  }, [persistState]);

  // 创建Solana钱包 - 使用官方 Privy API
  const createSolanaWallet = useCallback(async () => {
    if (!user) {
      Alert.alert('错误', '请先登录');
      return false;
    }

    setState(prev => ({ ...prev, isCreatingSolanaWallet: true }));
    
    try {
      // 使用官方 Privy API 创建 Solana 钱包
      const wallet = await createSolWallet();
      
      if (wallet) {
        const newState = {
          hasSolanaWallet: true,
          isCreatingSolanaWallet: false,
          activeWalletType: 'solana' as WalletType
        };

        setState(prev => ({
          ...prev,
          ...newState
        }));

        // 持久化新状态
        await persistState({ activeWalletType: 'solana' });

        Alert.alert('成功', 'Solana钱包创建成功！');
        return true;
      } else {
        throw new Error('Failed to create Solana wallet');
      }
    } catch (error) {
      console.error('创建Solana钱包失败:', error);
      Alert.alert('错误', '创建Solana钱包失败');
      setState(prev => ({ ...prev, isCreatingSolanaWallet: false }));
      return false;
    }
  }, [user, createSolWallet, persistState]);

  // 删除Solana钱包
  const removeSolanaWallet = useCallback(async () => {
    Alert.alert(
      '确认删除',
      '删除Solana钱包功能暂不支持。钱包将保持与您的账户关联。',
      [
        { text: '确定', style: 'default' }
      ]
    );
  }, []);

  // 获取当前活跃钱包信息
  const getActiveWallet = useCallback(() => {
    if (state.activeWalletType === 'ethereum') {
      return {
        type: 'ethereum' as const,
        address: state.ethereumWallet?.address || null,
        network: 'Ethereum Mainnet',
        iconType: 'ethereum' as const,
        fallbackIcon: '🔷'
      };
    } else {
      return {
        type: 'solana' as const,
        address: state.solanaWallet?.address || null,
        network: 'mainnet-beta',
        iconType: 'solana' as const,
        fallbackIcon: '🌞'
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

// Solana特定操作的Hook - 使用官方 Privy Solana APIs
// Solana特定操作的Hook - 调试版本
export function useSolanaOperations() {
  const { user } = usePrivy();
  const { wallets: solWallets } = useEmbeddedSolanaWallet();
  const [isLoading, setIsLoading] = useState(false);

  // 获取当前的 Solana 钱包
  const getSolanaWallet = useCallback(() => {
    if (!user || !solWallets || solWallets.length === 0) {
      return null;
    }
    
    const wallet = solWallets[0];
    
    // 调试：打印钱包对象结构
    console.log('🔍 Solana Wallet Object:', wallet);
    console.log('🔍 Wallet methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(wallet)));
    console.log('🔍 Wallet keys:', Object.keys(wallet));
    
    return wallet;
  }, [user, solWallets]);

  // 签名Solana消息
  const signMessage = useCallback(async (message: string) => {
    const wallet = getSolanaWallet();
    if (!wallet) {
      throw new Error('没有可用的Solana钱包');
    }

    setIsLoading(true);
    try {
      const encoder = new TextEncoder();
      const messageBytes = encoder.encode(message);
      
      console.log('🔍 Attempting to sign message with wallet:', wallet);
      
      // 方法1: 直接调用 signMessage
      if ('signMessage' in wallet && typeof wallet.signMessage === 'function') {
        console.log('✅ Using wallet.signMessage method');
        const signature = await wallet.signMessage(messageBytes);
        return signature;
      }
      
      // 方法2: 使用 sign 方法
      if ('sign' in wallet && typeof wallet.sign === 'function') {
        console.log('✅ Using wallet.sign method');
        const signature = await wallet.sign(messageBytes);
        return signature;
      }
      
      // 方法3: 获取 provider 并尝试
      if ('getProvider' in wallet && typeof wallet.getProvider === 'function') {
        console.log('🔍 Trying to get provider...');
        const provider = await wallet.getProvider();
        console.log('🔍 Provider object:', provider);
        console.log('🔍 Provider methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(provider)));
        
        if (provider && 'signMessage' in provider) {
          console.log('✅ Using provider.signMessage method');
          const signature = await provider.signMessage(messageBytes);
          return signature;
        }
      }
      
      // 方法4: 使用 request 方法
      if ('request' in wallet && typeof wallet.request === 'function') {
        console.log('✅ Using wallet.request method');
        const signature = await wallet.request({
          method: 'signMessage',
          params: {
            message: Buffer.from(messageBytes).toString('base64'),
            display: 'utf8'
          }
        });
        return signature;
      }
      
      // 方法5: 检查是否有其他签名相关的方法
      const walletMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(wallet));
      const signMethods = walletMethods.filter(method => 
        method.toLowerCase().includes('sign') || 
        method.toLowerCase().includes('message')
      );
      
      console.log('🔍 Available sign-related methods:', signMethods);
      
      // 如果找到了其他签名方法，尝试使用它们
      for (const method of signMethods) {
        if (typeof wallet[method] === 'function') {
          console.log(`🔍 Trying method: ${method}`);
          try {
            const result = await wallet[method](messageBytes);
            console.log(`✅ Success with method: ${method}`);
            return result;
          } catch (err) {
            console.log(`❌ Failed with method ${method}:`, err);
          }
        }
      }
      
      throw new Error('Solana wallet does not support message signing - no compatible method found');
    } catch (error) {
      console.error('❌ Solana sign failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        wallet: wallet
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getSolanaWallet]);

  // 签名Solana交易
  const signTransaction = useCallback(async (transaction: any) => {
    const wallet = getSolanaWallet();
    if (!wallet) {
      throw new Error('没有可用的Solana钱包');
    }

    setIsLoading(true);
    try {
      console.log('🔍 Attempting to sign transaction with wallet:', wallet);
      
      if ('signTransaction' in wallet && typeof wallet.signTransaction === 'function') {
        console.log('✅ Using wallet.signTransaction method');
        return await wallet.signTransaction(transaction);
      }
      
      if ('getProvider' in wallet && typeof wallet.getProvider === 'function') {
        const provider = await wallet.getProvider();
        if (provider && 'signTransaction' in provider) {
          console.log('✅ Using provider.signTransaction method');
          return await provider.signTransaction(transaction);
        }
      }
      
      throw new Error('Solana wallet does not support transaction signing');
    } catch (error) {
      console.error('❌ Transaction sign failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getSolanaWallet]);

  // 发送交易
  const sendTransaction = useCallback(async (transaction: any, connection: any, options?: any) => {
    const wallet = getSolanaWallet();
    if (!wallet) {
      throw new Error('没有可用的Solana钱包');
    }

    setIsLoading(true);
    try {
      console.log('🔍 Attempting to send transaction with wallet:', wallet);
      
      if ('sendTransaction' in wallet && typeof wallet.sendTransaction === 'function') {
        console.log('✅ Using wallet.sendTransaction method');
        return await wallet.sendTransaction(transaction, connection, options);
      }
      
      if ('getProvider' in wallet && typeof wallet.getProvider === 'function') {
        const provider = await wallet.getProvider();
        if (provider && 'sendTransaction' in provider) {
          console.log('✅ Using provider.sendTransaction method');
          return await provider.sendTransaction(transaction, connection, options);
        }
      }
      
      throw new Error('Solana wallet does not support sending transactions');
    } catch (error) {
      console.error('❌ Send transaction failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getSolanaWallet]);

  return {
    isLoading,
    signMessage,
    signTransaction,
    sendTransaction,
    solanaWallet: getSolanaWallet()
  };
}
export default useMultiChainWallet;