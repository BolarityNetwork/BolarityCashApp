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

import { Connection, Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

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
  // 签名和交易方法
  signMessage: (message: string) => Promise<string>;
  sendTestTransaction: () => Promise<string>;
  signTestTransaction: () => Promise<any>;
}

const MultiChainWalletContext = createContext<MultiChainWalletContextType | null>(null);

// Storage keys
const STORAGE_KEYS = {
  ACTIVE_WALLET_TYPE: '@active_wallet_type',
};

// React Native 兼容的字符串转十六进制函数
const stringToHex = (str: string): string => {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    hex += charCode.toString(16).padStart(2, '0');
  }
  return '0x' + hex;
};

// 创建一个 hook 来管理钱包状态
export function useMultiChainWalletState(): MultiChainWalletContextType {
  const { user } = usePrivy();
  
  // Ethereum wallet hooks
  const { wallets: ethWallets, create: createEthWallet } = useEmbeddedEthereumWallet();
  const ethAccount = getUserEmbeddedEthereumWallet(user);
  
  // Solana wallet hooks - 使用官方 Privy Expo 支持
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

  // =============== 修复后的签名和交易方法 ===============
  
  // 统一的签名消息方法
  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (state.activeWalletType === 'ethereum') {
      if (!state.ethereumWallet?.address || !ethWallets || ethWallets.length === 0) {
        throw new Error('No Ethereum wallet available');
      }
      
      console.log('🔷 Using Ethereum wallet provider to sign message');
      
      try {
        const wallet = ethWallets[0];
        const provider = await wallet.getProvider();
        
        // 使用 React Native 兼容的方式转换消息为十六进制
        const hexMessage = stringToHex(message);
        
        console.log('📝 Original message:', message);
        console.log('🔢 Hex message:', hexMessage);
        console.log('📍 Wallet address:', state.ethereumWallet.address);
        
        // 使用 personal_sign 方法
        const signature = await provider.request({
          method: "personal_sign",
          params: [hexMessage, state.ethereumWallet.address],
        });
        
        console.log('✅ Ethereum signature received:', signature);
        return signature;
      } catch (error) {
        console.error('Ethereum signing failed:', error);
        throw new Error(`Failed to sign Ethereum message: ${error.message}`);
      }
    } else {
      console.log('🌞 Starting Solana message signing process');
      
      if (!state.hasSolanaWallet || !state.solanaWallet?.address || !solWallets || solWallets.length === 0) {
        throw new Error('No Solana wallet available');
      }
      
      try {
        const wallet = solWallets[0];
        console.log('🔍 Getting Solana provider...');
        
        // 获取 provider - 这是官方推荐的方法
        const provider = await wallet.getProvider();
        console.log('✅ Solana provider obtained');
        
        // 使用官方 Privy Solana API - provider.request()
        console.log('📝 Signing message:', message);
        const result = await provider.request({
          method: 'signMessage',
          params: {
            message: message, // 直接传递字符串消息
          },
        });
        
        console.log('✅ Solana signature received:', result);
        
        // 返回签名
        if (result && result.signature) {
          return result.signature;
        }
        
        return result;
      } catch (error) {
        console.error('Solana signing failed:', error);
        throw new Error(`Failed to sign Solana message: ${error.message}`);
      }
    }
  }, [state.activeWalletType, state.ethereumWallet, state.hasSolanaWallet, state.solanaWallet, ethWallets, solWallets]);

  // 发送测试交易（金额为0）
  const sendTestTransaction = useCallback(async (): Promise<string> => {
    if (state.activeWalletType === 'ethereum') {
      if (!state.ethereumWallet?.address || !ethWallets || ethWallets.length === 0) {
        throw new Error('No Ethereum wallet available');
      }
      
      console.log('🔷 Sending Ethereum test transaction');
      
      try {
        const wallet = ethWallets[0];
        const provider = await wallet.getProvider();
        
        // 构建一个简单的转账交易（给自己转0 ETH）
        const txParams = {
          from: state.ethereumWallet.address,
          to: state.ethereumWallet.address,
          value: '0x0', // 0 ETH
          gas: '0x5208', // 21000 gas
          gasPrice: '0x9184e72a000', // 10 gwei
        };
        
        console.log('📤 Sending transaction with params:', txParams);
        
        const txHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [txParams],
        });
        
        console.log('✅ Ethereum transaction sent:', txHash);
        return txHash;
      } catch (error) {
        console.error('Ethereum transaction failed:', error);
        throw new Error(`Failed to send Ethereum transaction: ${error.message}`);
      }
    } else {
      if (!state.hasSolanaWallet || !state.solanaWallet?.address || !solWallets || solWallets.length === 0) {
        throw new Error('No Solana wallet available');
      }
      
      console.log('🌞 Sending Solana test transaction');
      
      try {
        const wallet = solWallets[0];
        const provider = await wallet.getProvider();
        const connection = new Connection('https://api.mainnet-beta.solana.com');
        
        // 构建 Solana 交易
        const fromPubkey = new PublicKey(state.solanaWallet.address);
        const toPubkey = new PublicKey(state.solanaWallet.address);
        
        const transaction = new Transaction();
        const transferInstruction = SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: 0, // 0 SOL
        });
        
        transaction.add(transferInstruction);
        
        // 获取最新的 blockhash
        const latestBlockhash = await connection.getLatestBlockhash();
        transaction.recentBlockhash = latestBlockhash.blockhash;
        transaction.feePayer = fromPubkey;
        
        console.log('📤 Solana transaction prepared, sending...');
        
        // 使用官方 Privy Solana API - signAndSendTransaction
        const result = await provider.request({
          method: 'signAndSendTransaction',
          params: {
            transaction,
            connection,
          },
        });
        
        console.log('✅ Solana transaction sent:', result);
        
        // 返回交易签名
        if (result && result.signature) {
          return result.signature;
        }
        
        return result;
      } catch (error) {
        console.error('Solana transaction failed:', error);
        throw new Error(`Failed to send Solana transaction: ${error.message}`);
      }
    }
  }, [state.activeWalletType, state.ethereumWallet, state.hasSolanaWallet, state.solanaWallet, ethWallets, solWallets]);

  // 签名测试交易
  const signTestTransaction = useCallback(async (): Promise<any> => {
    if (state.activeWalletType === 'ethereum') {
      if (!state.ethereumWallet?.address || !ethWallets || ethWallets.length === 0) {
        throw new Error('No Ethereum wallet available');
      }
      
      console.log('🔷 Signing Ethereum test transaction');
      
      try {
        const wallet = ethWallets[0];
        const provider = await wallet.getProvider();
        
        const txParams = {
          from: state.ethereumWallet.address,
          to: state.ethereumWallet.address,
          value: '0x0',
          gas: '0x5208',
          gasPrice: '0x9184e72a000',
        };
        
        const signature = await provider.request({
          method: 'eth_signTransaction',
          params: [txParams],
        });
        
        console.log('✅ Ethereum transaction signed:', signature);
        return signature;
      } catch (error) {
        console.error('Ethereum transaction signing failed:', error);
        throw new Error(`Failed to sign Ethereum transaction: ${error.message}`);
      }
    } else {
      if (!state.hasSolanaWallet || !state.solanaWallet?.address || !solWallets || solWallets.length === 0) {
        throw new Error('No Solana wallet available');
      }
      
      console.log('🌞 Signing Solana test transaction');
      
      try {
        const wallet = solWallets[0];
        const provider = await wallet.getProvider();
        const connection = new Connection('https://api.mainnet-beta.solana.com');
        
        const fromPubkey = new PublicKey(state.solanaWallet.address);
        const toPubkey = new PublicKey(state.solanaWallet.address);
        
        const transaction = new Transaction();
        const transferInstruction = SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: 0,
        });
        
        transaction.add(transferInstruction);
        
        const latestBlockhash = await connection.getLatestBlockhash();
        transaction.recentBlockhash = latestBlockhash.blockhash;
        transaction.feePayer = fromPubkey;
        
        console.log('🔏 Signing Solana transaction...');
        
        // 使用官方 Privy API - signTransaction
        const result = await provider.request({
          method: 'signTransaction',
          params: {
            transaction: transaction,
            connection: connection,
          },
        });
        
        console.log('✅ Solana transaction signed:', result);
        return result;
      } catch (error) {
        console.error('Solana transaction signing failed:', error);
        throw new Error(`Failed to sign Solana transaction: ${error.message}`);
      }
    }
  }, [state.activeWalletType, state.ethereumWallet, state.hasSolanaWallet, state.solanaWallet, ethWallets, solWallets]);

  return {
    ...state,
    switchWalletType,
    createSolanaWallet,
    removeSolanaWallet,
    getActiveWallet,
    canSwitchTo,
    hasEthereumWallet: !!state.ethereumWallet?.address,
    activeWallet: getActiveWallet(),
    // 新增的方法
    signMessage,
    sendTestTransaction,
    signTestTransaction,
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

export default useMultiChainWallet;