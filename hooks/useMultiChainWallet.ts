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

// 网络配置接口
interface NetworkConfig {
  chainId: string;
  name: string;
  rpcUrl: string;
  symbol: string;
  blockExplorer: string;
  icon: string;
  color: string;
}

// EVM 网络配置
const ETHEREUM_NETWORKS: { [key: string]: NetworkConfig } = {
  mainnet: {
    chainId: '0x1',
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    symbol: 'ETH',
    blockExplorer: 'https://etherscan.io',
    icon: '🔷',
    color: '#627eea'
  },
  sepolia: {
    chainId: '0xaa36a7',
    name: 'Ethereum Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    symbol: 'ETH',
    blockExplorer: 'https://sepolia.etherscan.io',
    icon: '🧪',
    color: '#ffa500'
  },
  polygon: {
    chainId: '0x89',
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    symbol: 'MATIC',
    blockExplorer: 'https://polygonscan.com',
    icon: '💜',
    color: '#8247e5'
  },
  bsc: {
    chainId: '0x38',
    name: 'BSC Mainnet',
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    symbol: 'BNB',
    blockExplorer: 'https://bscscan.com',
    icon: '💛',
    color: '#f3ba2f'
  },
  arbitrum: {
    chainId: '0xa4b1',
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    symbol: 'ETH',
    blockExplorer: 'https://arbiscan.io',
    icon: '🔵',
    color: '#28a0f0'
  },
  optimism: {
    chainId: '0xa',
    name: 'Optimism',
    rpcUrl: 'https://mainnet.optimism.io',
    symbol: 'ETH',
    blockExplorer: 'https://optimistic.etherscan.io',
    icon: '🔴',
    color: '#ff0420'
  },
  base: {
    chainId: '0x2105',
    name: 'Base Mainnet',
    rpcUrl: 'https://mainnet.base.org',
    symbol: 'ETH',
    blockExplorer: 'https://basescan.org',
    icon: '🟦',
    color: '#0052ff'
  }
};

interface MultiChainWalletState {
  activeWalletType: WalletType;
  activeEthereumNetwork: string;
  ethereumWallet: any | null;
  solanaWallet: any | null;
  isCreatingSolanaWallet: boolean;
  hasSolanaWallet: boolean;
  isSwitchingNetwork: boolean;
}

// 创建Context来全局管理钱包状态
interface MultiChainWalletContextType extends MultiChainWalletState {
  switchWalletType: (type: WalletType) => void;
  switchEthereumNetwork: (networkKey: string) => Promise<void>;
  createSolanaWallet: () => Promise<boolean>;
  removeSolanaWallet: () => Promise<void>;
  getActiveWallet: () => any;
  getCurrentEthereumNetwork: () => NetworkConfig;
  getAvailableNetworks: () => NetworkConfig[];
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
  ACTIVE_ETHEREUM_NETWORK: '@active_ethereum_network',
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

// 辅助函数：检查以太坊余额
const checkEthereumBalance = async (provider: any, address: string): Promise<string> => {
  try {
    const balance = await provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });
    return balance;
  } catch (error) {
    console.error('Failed to check balance:', error);
    return '0x0';
  }
};

// 辅助函数：获取当前网络ID
const getCurrentChainId = async (provider: any): Promise<string> => {
  try {
    const chainId = await provider.request({
      method: 'eth_chainId',
      params: [],
    });
    return chainId;
  } catch (error) {
    console.error('Failed to get chain ID:', error);
    return '0x1'; // 默认主网
  }
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
    activeEthereumNetwork: 'sepolia', // 默认使用测试网
    ethereumWallet: null,
    solanaWallet: null,
    isCreatingSolanaWallet: false,
    hasSolanaWallet: false,
    isSwitchingNetwork: false,
  });

  // 从AsyncStorage加载保存的状态
  const loadPersistedState = useCallback(async () => {
    try {
      const [activeWalletType, activeEthereumNetwork] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_WALLET_TYPE),
        AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_ETHEREUM_NETWORK),
      ]);

      setState(prev => ({
        ...prev,
        activeWalletType: (activeWalletType as WalletType) || 'ethereum',
        activeEthereumNetwork: activeEthereumNetwork || 'sepolia', // 默认测试网
      }));
    } catch (error) {
      console.error('Failed to load persisted wallet state:', error);
    }
  }, []);

  // 保存状态到AsyncStorage
  const persistState = useCallback(async (newState: Partial<MultiChainWalletState>) => {
    try {
      const promises = [];
      
      if (newState.activeWalletType !== undefined) {
        promises.push(
          AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_WALLET_TYPE, newState.activeWalletType)
        );
      }
      
      if (newState.activeEthereumNetwork !== undefined) {
        promises.push(
          AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_ETHEREUM_NETWORK, newState.activeEthereumNetwork)
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

  // 切换以太坊网络
  const switchEthereumNetwork = useCallback(async (networkKey: string) => {
    if (!ethWallets || ethWallets.length === 0) {
      throw new Error('No Ethereum wallet available');
    }

    const network = ETHEREUM_NETWORKS[networkKey];
    if (!network) {
      throw new Error('Unsupported network');
    }

    setState(prev => ({ ...prev, isSwitchingNetwork: true }));

    try {
      const wallet = ethWallets[0];
      const provider = await wallet.getProvider();

      console.log(`🔄 Switching to ${network.name}...`);

      // 尝试切换到指定网络
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: network.chainId }],
        });
      } catch (switchError: any) {
        // 如果网络不存在，添加网络
        if (switchError.code === 4902) {
          console.log(`➕ Adding ${network.name} to wallet...`);
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: network.chainId,
              chainName: network.name,
              rpcUrls: [network.rpcUrl],
              nativeCurrency: {
                name: network.symbol,
                symbol: network.symbol,
                decimals: 18,
              },
              blockExplorerUrls: [network.blockExplorer],
            }],
          });
        } else {
          throw switchError;
        }
      }

      // 更新状态
      setState(prev => ({ 
        ...prev, 
        activeEthereumNetwork: networkKey,
        isSwitchingNetwork: false,
      }));
      
      // 持久化网络选择
      await persistState({ activeEthereumNetwork: networkKey });
      
      console.log(`✅ Successfully switched to ${network.name}`);
      Alert.alert('Success', `Switched to ${network.name}`);
    } catch (error) {
      console.error('Network switch failed:', error);
      setState(prev => ({ ...prev, isSwitchingNetwork: false }));
      Alert.alert('Error', `Failed to switch network: ${error.message}`);
      throw error;
    }
  }, [ethWallets, persistState]);

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
      const currentNetwork = ETHEREUM_NETWORKS[state.activeEthereumNetwork];
      return {
        type: 'ethereum' as const,
        address: state.ethereumWallet?.address || null,
        network: currentNetwork?.name || 'Ethereum Mainnet',
        networkConfig: currentNetwork,
        iconType: 'ethereum' as const,
        fallbackIcon: '🔷'
      };
    } else {
      return {
        type: 'solana' as const,
        address: state.solanaWallet?.address || null,
        network: 'mainnet-beta',
        networkConfig: null,
        iconType: 'solana' as const,
        fallbackIcon: '🌞'
      };
    }
  }, [state]);

  // 获取当前以太坊网络配置
  const getCurrentEthereumNetwork = useCallback(() => {
    return ETHEREUM_NETWORKS[state.activeEthereumNetwork] || ETHEREUM_NETWORKS.sepolia;
  }, [state.activeEthereumNetwork]);

  // 获取可用网络列表
  const getAvailableNetworks = useCallback(() => {
    return Object.values(ETHEREUM_NETWORKS);
  }, []);

  // 检查是否可以切换到指定钱包类型
  const canSwitchTo = useCallback((type: WalletType) => {
    if (type === 'ethereum') {
      return !!state.ethereumWallet?.address;
    } else {
      return state.hasSolanaWallet;
    }
  }, [state]);

  // =============== 签名和交易方法 ===============
  
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

  // 改进的发送测试交易方法
  const sendTestTransaction = useCallback(async (): Promise<string> => {
    if (state.activeWalletType === 'ethereum') {
      if (!state.ethereumWallet?.address || !ethWallets || ethWallets.length === 0) {
        throw new Error('No Ethereum wallet available');
      }
      
      console.log('🔷 Starting Ethereum test transaction');
      console.log('📍 Wallet address:', state.ethereumWallet.address);
      
      try {
        const wallet = ethWallets[0];
        const provider = await wallet.getProvider();
        
        // 1. 检查当前网络
        console.log('🌐 Checking current network...');
        const currentChainId = await getCurrentChainId(provider);
        const expectedNetwork = ETHEREUM_NETWORKS[state.activeEthereumNetwork];
        
        console.log(`Current chain ID: ${currentChainId}`);
        console.log(`Expected chain ID: ${expectedNetwork.chainId}`);
        console.log(`Expected network: ${expectedNetwork.name}`);
        
        // 如果网络不匹配，尝试切换
        if (currentChainId !== expectedNetwork.chainId) {
          console.log(`⚠️ Network mismatch! Auto-switching to ${expectedNetwork.name}...`);
          try {
            await provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: expectedNetwork.chainId }],
            });
            console.log(`✅ Auto-switched to ${expectedNetwork.name}`);
            
            // 等待网络切换完成
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (switchError: any) {
            console.error('Auto-switch failed:', switchError);
            // 如果自动切换失败，但不是致命错误，继续尝试
            if (switchError.code === 4902) {
              console.log(`➕ Adding ${expectedNetwork.name} to wallet...`);
              try {
                await provider.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: expectedNetwork.chainId,
                    chainName: expectedNetwork.name,
                    rpcUrls: [expectedNetwork.rpcUrl],
                    nativeCurrency: {
                      name: expectedNetwork.symbol,
                      symbol: expectedNetwork.symbol,
                      decimals: 18,
                    },
                    blockExplorerUrls: [expectedNetwork.blockExplorer],
                  }],
                });
                console.log(`✅ Added and switched to ${expectedNetwork.name}`);
              } catch (addError) {
                console.error('Failed to add network:', addError);
                throw new Error(`Please manually switch to ${expectedNetwork.name} network in your wallet`);
              }
            } else {
              // 对于其他错误，提示用户手动切换
              Alert.alert(
                'Network Mismatch', 
                `Please switch to ${expectedNetwork.name} network in your wallet and try again.`,
                [{ text: 'OK' }]
              );
              throw new Error(`Please manually switch to ${expectedNetwork.name} network`);
            }
          }
        }
        
        // 2. 检查余额
        console.log('💰 Checking wallet balance...');
        const balance = await checkEthereumBalance(provider, state.ethereumWallet.address);
        const balanceWei = BigInt(balance);
        const balanceEth = Number(balanceWei) / 1e18;
        
        console.log(`💰 Current balance: ${balance} wei (${balanceEth.toFixed(6)} ETH)`);
        
        // 3. 动态获取Gas Price
        console.log('⛽ Getting current gas price...');
        let gasPrice: string;
        try {
          gasPrice = await provider.request({
            method: 'eth_gasPrice',
            params: [],
          });
          console.log(`⛽ Network gas price: ${gasPrice}`);
        } catch (error) {
          console.warn('Failed to get gas price, using default for network');
          // 根据网络设置不同的默认gas price
          switch (expectedNetwork.chainId) {
            case '0x1': // Ethereum Mainnet
              gasPrice = '0x4a817c800'; // 20 gwei
              break;
            case '0xaa36a7': // Sepolia
              gasPrice = '0x2540be400'; // 10 gwei
              break;
            case '0x89': // Polygon
              gasPrice = '0x77359400'; // 2 gwei
              break;
            case '0x38': // BSC
              gasPrice = '0x2540be400'; // 10 gwei
              break;
            default:
              gasPrice = '0x2540be400'; // 10 gwei default
          }
          console.log(`⛽ Using default gas price: ${gasPrice}`);
        }
        
        const gasPriceWei = BigInt(gasPrice);
        const gasPriceGwei = Number(gasPriceWei) / 1e9;
        console.log(`⛽ Gas price: ${gasPrice} wei (${gasPriceGwei.toFixed(2)} gwei)`);
        
        // 4. 计算gas费用
        const gasLimit = 21000;
        const gasCost = BigInt(gasLimit) * gasPriceWei;
        const gasCostEth = Number(gasCost) / 1e18;
        
        console.log(`⛽ Gas limit: ${gasLimit}`);
        console.log(`⛽ Estimated gas cost: ${gasCost} wei (${gasCostEth.toFixed(6)} ETH)`);
        
        // 5. 检查余额是否足够
        if (balanceWei < gasCost) {
          const needEth = Number(gasCost - balanceWei) / 1e18;
          const errorMsg = [
            `Insufficient balance for gas fees on ${expectedNetwork.name}.`,
            `Current: ${balanceEth.toFixed(6)} ETH`,
            `Needed: ${gasCostEth.toFixed(6)} ETH`,
            `Please add at least ${needEth.toFixed(6)} ETH to your wallet.`
          ].join('\n');
          
          console.error('❌ Insufficient balance:', errorMsg);
          throw new Error(errorMsg);
        }
        
        console.log('✅ Sufficient balance for transaction');
        
        // 6. 构建并发送交易
        const txParams = {
          from: state.ethereumWallet.address,
          to: state.ethereumWallet.address,
          value: '0x0', // 0 ETH
          gas: `0x${gasLimit.toString(16)}`,
          gasPrice: gasPrice, // 使用动态获取的gas price
        };
        
        console.log('📤 Sending transaction with params:', {
          ...txParams,
          network: expectedNetwork.name,
          gasCostEth: gasCostEth.toFixed(6)
        });
        
        const txHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [txParams],
        });
        
        console.log('✅ Ethereum transaction sent successfully!');
        console.log('📝 Transaction hash:', txHash);
        console.log(`🔗 View on explorer: ${expectedNetwork.blockExplorer}/tx/${txHash}`);
        
        // 显示成功消息
        Alert.alert(
          'Transaction Sent!', 
          `Transaction sent on ${expectedNetwork.name}\n\nHash: ${txHash.substring(0, 10)}...\n\nView on ${expectedNetwork.blockExplorer}`,
          [{ text: 'OK' }]
        );
        
        return txHash;
      } catch (error) {
        console.error('❌ Ethereum transaction failed:', error);
        
        // 更友好的错误信息
        if (error.message.includes('insufficient funds')) {
          const networkName = ETHEREUM_NETWORKS[state.activeEthereumNetwork].name;
          throw new Error(
            `Insufficient ETH balance to pay for gas fees. ` +
            `Please ensure you have ETH on the ${networkName} network.`
          );
        }
        
        if (error.message.includes('network') || error.message.includes('switch')) {
          throw new Error(error.message);
        }
        
        if (error.message.includes('User rejected')) {
          throw new Error('Transaction was cancelled by user');
        }
        
        throw new Error(`Failed to send Ethereum transaction: ${error.message}`);
      }
    } else {
      // Solana 交易处理
      if (!state.hasSolanaWallet || !state.solanaWallet?.address || !solWallets || solWallets.length === 0) {
        throw new Error('No Solana wallet available');
      }
      
      console.log('🌞 Starting Solana test transaction');
      console.log('📍 Wallet address:', state.solanaWallet.address);
      
      try {
        const wallet = solWallets[0];
        const provider = await wallet.getProvider();
        const connection = new Connection('https://api.mainnet-beta.solana.com');
        
        // 检查 Solana 余额
        const fromPubkey = new PublicKey(state.solanaWallet.address);
        const balance = await connection.getBalance(fromPubkey);
        const balanceSol = balance / 1e9;
        
        console.log(`💰 Solana balance: ${balance} lamports (${balanceSol} SOL)`);
        
        // 估算租金费用 (Solana 交易费用很低，通常 0.000005 SOL)
        const minRentFee = 5000; // 大约 0.000005 SOL
        
        if (balance < minRentFee) {
          throw new Error(
            `Insufficient SOL balance for transaction fees. ` +
            `Current: ${balanceSol} SOL, ` +
            `Needed: ~0.000005 SOL. ` +
            `Please add some SOL to your wallet.`
          );
        }
        
        // 构建 Solana 交易
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
        
        console.log('✅ Solana transaction sent successfully!');
        console.log('📝 Transaction signature:', result);
        
        // 返回交易签名
        if (result && result.signature) {
          return result.signature;
        }
        
        return result;
      } catch (error) {
        console.error('❌ Solana transaction failed:', error);
        
        if (error.message.includes('insufficient')) {
          throw new Error(
            'Insufficient SOL balance for transaction fees. ' +
            'Please add some SOL to your wallet and try again.'
          );
        }
        
        throw new Error(`Failed to send Solana transaction: ${error.message}`);
      }
    }
  }, [state.activeWalletType, state.ethereumWallet, state.hasSolanaWallet, state.solanaWallet, state.activeEthereumNetwork, ethWallets, solWallets]);

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
        
        // 动态获取gas price
        let gasPrice: string;
        try {
          gasPrice = await provider.request({
            method: 'eth_gasPrice',
            params: [],
          });
        } catch (error) {
          gasPrice = '0x2540be400'; // 10 gwei fallback
        }
        
        const txParams = {
          from: state.ethereumWallet.address,
          to: state.ethereumWallet.address,
          value: '0x0',
          gas: '0x5208',
          gasPrice: gasPrice,
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
    switchEthereumNetwork,
    createSolanaWallet,
    removeSolanaWallet,
    getActiveWallet,
    getCurrentEthereumNetwork,
    getAvailableNetworks,
    canSwitchTo,
    hasEthereumWallet: !!state.ethereumWallet?.address,
    activeWallet: getActiveWallet(),
    // 签名和交易方法
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
export { MultiChainWalletContext, ETHEREUM_NETWORKS };
export type { MultiChainWalletContextType, NetworkConfig };

export default useMultiChainWallet;