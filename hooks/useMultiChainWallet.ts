// hooks/useMultiChainWallet.ts
import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  createContext,
  useContext,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TakoToast } from '@/components/common/TakoToast';
import {
  usePrivy,
  useEmbeddedEthereumWallet,
  getUserEmbeddedEthereumWallet,
  useEmbeddedSolanaWallet,
  getUserEmbeddedSolanaWallet,
} from '@privy-io/expo';
import {
  Connection,
  Transaction,
  SystemProgram,
  PublicKey,
} from '@solana/web3.js';

// ==================== 数据结构设计 ====================
// "Bad programmers worry about the code. Good programmers worry about data structures."

type ChainType = 'ethereum' | 'solana';

interface Network {
  chainId: string;
  name: string;
  rpcUrl: string;
  symbol: string;
  blockExplorer: string;
  icon: string;
  color: string;
}

// 网络配置 - 简单的查找表，没有特殊情况
const NETWORKS: Record<string, Network> = {
  mainnet: {
    chainId: '0x1',
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    symbol: 'ETH',
    blockExplorer: 'https://etherscan.io',
    icon: '🔷',
    color: '#627eea',
  },
  sepolia: {
    chainId: '0xaa36a7',
    name: 'Ethereum Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    symbol: 'ETH',
    blockExplorer: 'https://sepolia.etherscan.io',
    icon: '🧪',
    color: '#ffa500',
  },
  polygon: {
    chainId: '0x89',
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    symbol: 'MATIC',
    blockExplorer: 'https://polygonscan.com',
    icon: '💜',
    color: '#8247e5',
  },
  bsc: {
    chainId: '0x38',
    name: 'BSC Mainnet',
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    symbol: 'BNB',
    blockExplorer: 'https://bscscan.com',
    icon: '💛',
    color: '#f3ba2f',
  },
  arbitrum: {
    chainId: '0xa4b1',
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    symbol: 'ETH',
    blockExplorer: 'https://arbiscan.io',
    icon: '🔵',
    color: '#28a0f0',
  },
  optimism: {
    chainId: '0xa',
    name: 'Optimism',
    rpcUrl: 'https://mainnet.optimism.io',
    symbol: 'ETH',
    blockExplorer: 'https://optimistic.etherscan.io',
    icon: '🔴',
    color: '#ff0420',
  },
  base: {
    chainId: '0x2105',
    name: 'Base Mainnet',
    rpcUrl:
      'https://rpc.ankr.com/base/d71a9cd8dd190bf86a472bb7c7211ec1d99f131c9739266c6420a2efcafe4325',
    symbol: 'ETH',
    blockExplorer: 'https://basescan.org',
    icon: '🟦',
    color: '#0052ff',
  },
};

// 核心状态 - 只存必要的，其他都动态计算
interface WalletState {
  activeChain: ChainType;
  activeNetwork: string; // 只对 ethereum 有意义
}

// ==================== 工具函数 - 纯函数，无副作用 ====================

const stringToHex = (str: string): string =>
  '0x' +
  Array.from(str)
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');

const weiToEth = (wei: bigint): number => Number(wei) / 1e18;

// ==================== Provider 管理 - 统一接口 ====================

class WalletProvider {
  constructor(
    private ethWallets: any[],
    private solWallets: any[],
    private activeChain: ChainType
  ) {}

  async get(): Promise<any> {
    const wallets =
      this.activeChain === 'ethereum' ? this.ethWallets : this.solWallets;
    if (!wallets?.length)
      throw new Error(`No ${this.activeChain} wallet available`);
    return wallets[0].getProvider();
  }

  async ensureNetwork(networkKey: string): Promise<any> {
    if (this.activeChain !== 'ethereum') return this.get();

    const provider = await this.get();
    const network = NETWORKS[networkKey];
    if (!network) throw new Error('Invalid network');

    const chainId = await provider.request({ method: 'eth_chainId' });
    if (chainId === network.chainId) return provider;

    // 网络不匹配，切换
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // 网络不存在，添加
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: network.chainId,
              chainName: network.name,
              rpcUrls: [network.rpcUrl],
              nativeCurrency: {
                name: network.symbol,
                symbol: network.symbol,
                decimals: 18,
              },
              blockExplorerUrls: [network.blockExplorer],
            },
          ],
        });
      } else {
        throw error;
      }
    }
    return provider;
  }
}

// ==================== 存储管理 - 简单直接 ====================

class Storage {
  private static KEYS = {
    CHAIN: '@active_chain',
    NETWORK: '@active_network',
  };

  static async load(): Promise<Partial<WalletState>> {
    try {
      const [chain, network] = await Promise.all([
        AsyncStorage.getItem(this.KEYS.CHAIN),
        AsyncStorage.getItem(this.KEYS.NETWORK),
      ]);
      return {
        activeChain: (chain as ChainType) || 'ethereum',
        activeNetwork: network || 'sepolia',
      };
    } catch {
      return {};
    }
  }

  static async save(state: Partial<WalletState>): Promise<void> {
    const promises = [];
    if (state.activeChain)
      promises.push(AsyncStorage.setItem(this.KEYS.CHAIN, state.activeChain));
    if (state.activeNetwork)
      promises.push(
        AsyncStorage.setItem(this.KEYS.NETWORK, state.activeNetwork)
      );
    await Promise.all(promises);
  }
}

// ==================== 交易处理 - 分离关注点 ====================

class TransactionHandler {
  constructor(
    private provider: WalletProvider,
    private state: WalletState
  ) {}

  async signMessage(message: string, address: string): Promise<string> {
    const provider = await this.provider.get();

    if (this.state.activeChain === 'ethereum') {
      return provider.request({
        method: 'personal_sign',
        params: [stringToHex(message), address],
      });
    } else {
      const result = await provider.request({
        method: 'signMessage',
        params: { message },
      });
      return result?.signature || result;
    }
  }

  async sendTransaction(address: string): Promise<string> {
    if (this.state.activeChain === 'ethereum') {
      return this.sendEthereumTx(address);
    } else {
      return this.sendSolanaTx(address);
    }
  }

  private async sendEthereumTx(address: string): Promise<string> {
    const provider = await this.provider.ensureNetwork(
      this.state.activeNetwork
    );

    // 检查余额
    const balance = await provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });

    // 获取 gas price
    const gasPrice = await provider
      .request({ method: 'eth_gasPrice' })
      .catch(() => '0x2540be400'); // 10 gwei fallback

    const gasLimit = 21000;
    const gasCost = BigInt(gasLimit) * BigInt(gasPrice);

    if (BigInt(balance) < gasCost) {
      const network = NETWORKS[this.state.activeNetwork];
      throw new Error(
        `Insufficient balance on ${network.name}. ` +
          `Need ${weiToEth(gasCost).toFixed(6)} ${network.symbol} for gas.`
      );
    }

    return provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: address,
          to: address,
          value: '0x0',
          gas: `0x${gasLimit.toString(16)}`,
          gasPrice,
        },
      ],
    });
  }

  private async sendSolanaTx(address: string): Promise<string> {
    const provider = await this.provider.get();
    const connection = new Connection('https://api.mainnet-beta.solana.com');

    const pubkey = new PublicKey(address);
    const balance = await connection.getBalance(pubkey);

    if (balance < 5000) {
      throw new Error(`Insufficient SOL balance. Need ~0.000005 SOL for fees.`);
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: pubkey,
        toPubkey: pubkey,
        lamports: 0,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = pubkey;

    const result = await provider.request({
      method: 'signAndSendTransaction',
      params: { transaction, connection },
    });

    return result?.signature || result;
  }

  async signTransaction(address: string): Promise<any> {
    const provider = await this.provider.get();

    if (this.state.activeChain === 'ethereum') {
      const gasPrice = await provider
        .request({ method: 'eth_gasPrice' })
        .catch(() => '0x2540be400');

      return provider.request({
        method: 'eth_signTransaction',
        params: [
          {
            from: address,
            to: address,
            value: '0x0',
            gas: '0x5208',
            gasPrice,
          },
        ],
      });
    } else {
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const pubkey = new PublicKey(address);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: pubkey,
          toPubkey: pubkey,
          lamports: 0,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = pubkey;

      return provider.request({
        method: 'signTransaction',
        params: { transaction, connection },
      });
    }
  }
}

// ==================== Context 定义 ====================

interface WalletContextType {
  // 状态
  activeChain: ChainType;
  activeNetwork: string;
  ethereumAddress: string | null;
  solanaAddress: string | null;
  hasSolanaWallet: boolean;
  isCreatingSolanaWallet: boolean;
  isSwitchingNetwork: boolean;

  // 核心方法
  switchChain: (chain: ChainType) => void;
  switchNetwork: (network: string) => Promise<void>;
  createSolanaWallet: () => Promise<boolean>;
  removeSolanaWallet: () => Promise<void>;

  // 工具方法
  getActiveWallet: () => any;
  getCurrentNetwork: () => Network;
  getAvailableNetworks: () => Network[];
  canSwitchTo: (chain: ChainType) => boolean;

  // Provider 方法
  getProvider: () => Promise<any>;
  getEthereumProvider: () => Promise<any>;
  getSolanaProvider: () => Promise<any>;
  getCurrentNetworkKey: () => string;

  // 交易方法
  signMessage: (message: string) => Promise<string>;
  sendTestTransaction: () => Promise<string>;
  signTestTransaction: () => Promise<any>;

  // 兼容性
  activeWalletType: ChainType;
  activeEthereumNetwork: string;
  hasEthereumWallet: boolean;
  activeWallet: any;
  switchWalletType: (type: ChainType) => void;
  switchEthereumNetwork: (network: string) => Promise<void>;
  getCurrentEthereumNetwork: () => Network;
}

const MultiChainWalletContext = createContext<WalletContextType | null>(null);

// ==================== 主 Hook - 组装一切 ====================

export function useMultiChainWalletState(): WalletContextType {
  const { user } = usePrivy();

  // Privy hooks
  const { wallets: ethWallets } = useEmbeddedEthereumWallet();
  const ethAccount = getUserEmbeddedEthereumWallet(user);
  console.log(333, { ethAccount, user });
  const { wallets: solWallets, create: createSolWallet } =
    useEmbeddedSolanaWallet();
  const solAccount = getUserEmbeddedSolanaWallet(user);

  const externalEthereumAccount = useMemo(() => {
    if (!user?.linked_accounts?.length) return null;
    return (
      user.linked_accounts.find(
        account =>
          account.type === 'wallet' && account.chain_type === 'ethereum'
      ) ?? null
    );
  }, [user]);

  const externalSolanaAccount = useMemo(() => {
    if (!user?.linked_accounts?.length) return null;
    return (
      user.linked_accounts.find(
        account => account.type === 'wallet' && account.chain_type === 'solana'
      ) ?? null
    );
  }, [user]);

  const ethereumAddress =
    ethAccount?.address || externalEthereumAccount?.address || null;
  const solanaAddress =
    solAccount?.address || externalSolanaAccount?.address || null;

  // 核心状态
  const [state, setState] = useState<WalletState>({
    activeChain: 'ethereum',
    activeNetwork: 'sepolia',
  });

  const [isCreating, setIsCreating] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // 初始化
  useEffect(() => {
    if (user) {
      Storage.load().then(saved => {
        setState(prev => ({ ...prev, ...saved }));
      });
    }
  }, [user]);

  // 创建辅助类实例
  const provider = new WalletProvider(
    ethWallets || [],
    solWallets || [],
    state.activeChain
  );
  const txHandler = new TransactionHandler(provider, state);

  // ==================== 方法实现 ====================

  const switchChain = useCallback((chain: ChainType) => {
    setState(prev => ({ ...prev, activeChain: chain }));
    Storage.save({ activeChain: chain });
  }, []);

  const switchNetwork = useCallback(
    async (network: string) => {
      if (!NETWORKS[network]) throw new Error('Invalid network');

      setIsSwitching(true);
      try {
        await provider.ensureNetwork(network);
        setState(prev => ({ ...prev, activeNetwork: network }));
        await Storage.save({ activeNetwork: network });
        TakoToast.show({
          type: 'normal',
          status: 'success',
          message: `Switched to ${NETWORKS[network].name}`,
        });
      } catch (error: any) {
        TakoToast.show({
          type: 'normal',
          status: 'error',
          message: `Failed to switch: ${error.message}`,
        });
        throw error;
      } finally {
        setIsSwitching(false);
      }
    },
    [provider]
  );

  const createSolanaWallet = useCallback(async () => {
    if (!user) {
      TakoToast.show({
        type: 'normal',
        status: 'error',
        message: 'Please login first',
      });
      return false;
    }

    setIsCreating(true);
    try {
      const wallet = await createSolWallet?.();
      if (wallet) {
        setState(prev => ({ ...prev, activeChain: 'solana' }));
        await Storage.save({ activeChain: 'solana' });
        TakoToast.show({
          type: 'normal',
          status: 'success',
          message: 'Solana wallet created',
        });
        return true;
      }
      throw new Error('Failed to create wallet');
    } catch (_) {
      TakoToast.show({
        type: 'normal',
        status: 'error',
        message: 'Failed to create Solana wallet',
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  }, [user, createSolWallet]);

  const removeSolanaWallet = useCallback(async () => {
    TakoToast.show({
      type: 'normal',
      status: 'info',
      message:
        'Wallet removal not supported. It remains linked to your account.',
    });
  }, []);

  const getActiveWallet = useCallback(() => {
    if (state.activeChain === 'ethereum') {
      const network = NETWORKS[state.activeNetwork];
      return {
        type: 'ethereum' as const,
        address: ethereumAddress,
        network: network?.name || 'Ethereum Mainnet',
        networkConfig: network,
        iconType: 'ethereum' as const,
        fallbackIcon: '🔷',
      };
    } else {
      return {
        type: 'solana' as const,
        address: solanaAddress,
        network: 'mainnet-beta',
        networkConfig: null,
        iconType: 'solana' as const,
        fallbackIcon: '🌞',
      };
    }
  }, [state, ethereumAddress, solanaAddress]);

  const getCurrentNetwork = useCallback(
    () => NETWORKS[state.activeNetwork] || NETWORKS.sepolia,
    [state.activeNetwork]
  );

  const getAvailableNetworks = useCallback(() => Object.values(NETWORKS), []);

  const canSwitchTo = useCallback(
    (chain: ChainType) =>
      chain === 'ethereum' ? !!ethereumAddress : !!solanaAddress,
    [ethereumAddress, solanaAddress]
  );

  const getProvider = useCallback(() => provider.get(), [provider]);
  const getEthereumProvider = useCallback(
    () => provider.ensureNetwork(state.activeNetwork),
    [provider, state.activeNetwork]
  );
  const getSolanaProvider = useCallback(() => {
    if (!solWallets?.length) throw new Error('No Solana wallet');
    return solWallets[0].getProvider();
  }, [solWallets]);

  const getCurrentNetworkKey = useCallback(
    () =>
      state.activeChain === 'ethereum' ? state.activeNetwork : 'mainnet-beta',
    [state]
  );

  const signMessage = useCallback(
    async (message: string) => {
      const address =
        state.activeChain === 'ethereum'
          ? ethAccount?.address
          : solAccount?.address;

      if (!address) throw new Error(`No ${state.activeChain} wallet`);
      return txHandler.signMessage(message, address);
    },
    [state.activeChain, ethAccount, solAccount, txHandler]
  );

  const sendTestTransaction = useCallback(async () => {
    const address =
      state.activeChain === 'ethereum'
        ? ethAccount?.address
        : solAccount?.address;

    if (!address) throw new Error(`No ${state.activeChain} wallet`);

    try {
      const txHash = await txHandler.sendTransaction(address);

      if (state.activeChain === 'ethereum') {
        TakoToast.show({
          type: 'normal',
          status: 'success',
          message: `Transaction Sent! Hash: ${txHash.substring(0, 10)}...`,
        });
      }

      return txHash;
    } catch (error: any) {
      if (error.message.includes('User rejected')) {
        throw new Error('Transaction cancelled');
      }
      throw error;
    }
  }, [state, ethAccount, solAccount, txHandler]);

  const signTestTransaction = useCallback(async () => {
    const address =
      state.activeChain === 'ethereum'
        ? ethAccount?.address
        : solAccount?.address;

    if (!address) throw new Error(`No ${state.activeChain} wallet`);
    return txHandler.signTransaction(address);
  }, [state.activeChain, ethAccount, solAccount, txHandler]);

  // ==================== 返回完整接口 ====================

  return {
    // 状态
    activeChain: state.activeChain,
    activeNetwork: state.activeNetwork,
    ethereumAddress,
    solanaAddress,
    hasSolanaWallet: !!solanaAddress,
    isCreatingSolanaWallet: isCreating,
    isSwitchingNetwork: isSwitching,

    // 核心方法
    switchChain,
    switchNetwork,
    createSolanaWallet,
    removeSolanaWallet,

    // 工具方法
    getActiveWallet,
    getCurrentNetwork,
    getAvailableNetworks,
    canSwitchTo,

    // Provider 方法
    getProvider,
    getEthereumProvider,
    getSolanaProvider,
    getCurrentNetworkKey,

    // 交易方法
    signMessage,
    sendTestTransaction,
    signTestTransaction,

    // 向后兼容
    activeWalletType: state.activeChain,
    activeEthereumNetwork: state.activeNetwork,
    hasEthereumWallet: !!ethereumAddress,
    activeWallet: getActiveWallet(),
    switchWalletType: switchChain,
    switchEthereumNetwork: switchNetwork,
    getCurrentEthereumNetwork: getCurrentNetwork,
  };
}

// ==================== 导出 ====================

export function useMultiChainWallet() {
  const context = useContext(MultiChainWalletContext);
  if (!context) {
    throw new Error(
      'useMultiChainWallet must be used within a MultiChainWalletProvider'
    );
  }
  return context;
}

export { MultiChainWalletContext, NETWORKS as ETHEREUM_NETWORKS };

export type {
  WalletContextType as MultiChainWalletContextType,
  Network as NetworkConfig,
};

export default useMultiChainWallet;
