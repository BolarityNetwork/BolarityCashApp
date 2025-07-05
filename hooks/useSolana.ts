// hooks/useSolana.ts
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import type { 
  Wallet, 
  SolanaAccount,
  SolanaSignMessageFeature,
  SolanaSignTransactionFeature 
} from '../utils/solanaWalletRegistration';
import { 
  registerPrivySolanaWallet, 
  hexToUint8Array, 
  uint8ArrayToHex 
} from '../utils/solanaWalletRegistration';

export interface SolanaWalletState {
  isConnected: boolean;
  isConnecting: boolean;
  publicKey: string | null;
  address: string | null;
  network: 'mainnet-beta' | 'testnet' | 'devnet';
}

export interface SolanaWalletActions {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  signTransaction: (transaction: Uint8Array) => Promise<Uint8Array>;
  switchNetwork: (network: 'mainnet-beta' | 'testnet' | 'devnet') => Promise<void>;
}

/**
 * Hook for managing Solana wallet state and actions
 * This is a mock implementation - replace with actual Privy Solana integration when available
 */
export function useSolanaWallet(): SolanaWalletState & SolanaWalletActions {
  const [state, setState] = useState<SolanaWalletState>({
    isConnected: false,
    isConnecting: false,
    publicKey: null,
    address: null,
    network: 'mainnet-beta'
  });

  const [registeredWallet, setRegisteredWallet] = useState<Wallet | null>(null);

  // Mock Solana connection - replace with actual Privy integration
  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true }));
    
    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock account data - replace with actual Privy Solana account
      const mockPublicKey = new Uint8Array(32);
      // Fill with random bytes for demo
      for (let i = 0; i < mockPublicKey.length; i++) {
        mockPublicKey[i] = Math.floor(Math.random() * 256);
      }
      
      const address = uint8ArrayToHex(mockPublicKey);
      const publicKeyBase58 = `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHvp`; // Mock base58 address
      
      const account: SolanaAccount = {
        address: publicKeyBase58,
        publicKey: mockPublicKey,
        chains: [`solana:${state.network}`],
        features: ['solana:signMessage', 'solana:signTransaction', 'solana:signAndSendTransaction']
      };

      // Register wallet with standard
      const wallet = registerPrivySolanaWallet(null, [account]);
      setRegisteredWallet(wallet);
      
      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        publicKey: uint8ArrayToHex(mockPublicKey),
        address: publicKeyBase58
      }));

      Alert.alert('Success', 'Solana wallet connected successfully!');
    } catch (error) {
      setState(prev => ({ ...prev, isConnecting: false }));
      console.error('Failed to connect Solana wallet:', error);
      Alert.alert('Error', 'Failed to connect Solana wallet');
    }
  }, [state.network]);

  const disconnect = useCallback(async () => {
    try {
      if (registeredWallet?.features['standard:disconnect']) {
        await registeredWallet.features['standard:disconnect'].disconnect();
      }
      
      setState({
        isConnected: false,
        isConnecting: false,
        publicKey: null,
        address: null,
        network: state.network
      });
      
      setRegisteredWallet(null);
      Alert.alert('Success', 'Solana wallet disconnected');
    } catch (error) {
      console.error('Failed to disconnect Solana wallet:', error);
      Alert.alert('Error', 'Failed to disconnect Solana wallet');
    }
  }, [registeredWallet, state.network]);

  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!registeredWallet || !state.isConnected || !registeredWallet.accounts.length) {
      throw new Error('Wallet not connected');
    }

    try {
      const signFeature = registeredWallet.features['solana:signMessage'] as SolanaSignMessageFeature;
      if (!signFeature) {
        throw new Error('Wallet does not support message signing');
      }

      const messageBytes = new TextEncoder().encode(message);
      const account = registeredWallet.accounts[0];
      
      const [result] = await signFeature.signMessage({
        account,
        message: messageBytes
      });

      return uint8ArrayToHex(result.signature);
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }, [registeredWallet, state.isConnected]);

  const signTransaction = useCallback(async (transaction: Uint8Array): Promise<Uint8Array> => {
    if (!registeredWallet || !state.isConnected || !registeredWallet.accounts.length) {
      throw new Error('Wallet not connected');
    }

    try {
      const signFeature = registeredWallet.features['solana:signTransaction'] as SolanaSignTransactionFeature;
      if (!signFeature) {
        throw new Error('Wallet does not support transaction signing');
      }

      const account = registeredWallet.accounts[0];
      
      const [result] = await signFeature.signTransaction({
        transaction,
        chain: `solana:${state.network}`,
        account
      });

      return result.signedTransaction;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw error;
    }
  }, [registeredWallet, state.isConnected, state.network]);

  const switchNetwork = useCallback(async (network: 'mainnet-beta' | 'testnet' | 'devnet') => {
    try {
      setState(prev => ({ ...prev, network }));
      
      // If connected, update the account's chains
      if (registeredWallet && registeredWallet.accounts.length > 0) {
        // In a real implementation, you might need to reconnect or update the wallet
        // For now, we'll just update the state
        Alert.alert('Success', `Switched to ${network}`);
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
      Alert.alert('Error', 'Failed to switch network');
    }
  }, [registeredWallet]);

  return {
    ...state,
    connect,
    disconnect,
    signMessage,
    signTransaction,
    switchNetwork
  };
}

/**
 * Hook for detecting available Solana wallets
 * This simulates the behavior described in the documentation
 */
export function useSolanaStandardWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Simulate wallet detection
    const timeout = setTimeout(() => {
      // Mock available wallets - in real implementation, this would detect actual wallets
      setWallets([
        {
          name: 'Privy Solana',
          version: '1.0.0',
          icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iMTYiIGZpbGw9IiM2NjdlZWEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik04IDJMMTQgNkw4IDE0TDIgNkw4IDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+',
          accounts: [],
          features: {
            'standard:connect': {
              async connect() {
                const mockAccount: SolanaAccount = {
                  address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHvp',
                  publicKey: new Uint8Array(32),
                  chains: ['solana:mainnet-beta', 'solana:testnet', 'solana:devnet'],
                  features: ['solana:signMessage', 'solana:signTransaction']
                };
                return { accounts: [mockAccount] };
              }
            },
            'standard:disconnect': {
              async disconnect() {
                console.log('Disconnecting mock Solana wallet');
              }
            },
            'solana:signMessage': {
              async signMessage({ account, message }) {
                // Mock signing
                return [{
                  signedMessage: message,
                  signature: new Uint8Array(64).fill(1)
                }];
              }
            },
            'solana:signTransaction': {
              async signTransaction({ transaction, chain, account }) {
                return [{ signedTransaction: transaction }];
              }
            }
          }
        },
        // Add more mock wallets as needed
        {
          name: 'Phantom',
          version: '1.0.0',
          icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iMTYiIGZpbGw9IiM1MzQzOWIiLz48cGF0aCBkPSJNMTYgOEMyMi42IDggMjggMTMuNCQyOCAyMFMyMi42IDMyIDE2IDMyIDQgMjYuNiQgNCQyMCA5LjQgOCAxNiA4WiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=',
          accounts: [],
          features: {
            'standard:connect': {
              async connect() {
                const mockAccount: SolanaAccount = {
                  address: 'BxKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHvp',
                  publicKey: new Uint8Array(32),
                  chains: ['solana:mainnet-beta'],
                  features: ['solana:signMessage', 'solana:signTransaction']
                };
                return { accounts: [mockAccount] };
              }
            },
            'standard:disconnect': {
              async disconnect() {
                console.log('Disconnecting Phantom wallet');
              }
            }
          }
        }
      ]);
      setReady(true);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return { wallets, ready };
}

/**
 * Core wallet utility functions
 */
export const solanaWalletUtils = {
  // Connect to a specific wallet
  connect: (wallet: Wallet) => {
    if (wallet.features['standard:connect']) {
      return wallet.features['standard:connect'].connect();
    }
    throw new Error('Wallet does not support connect feature');
  },

  // Disconnect from a specific wallet
  disconnect: (wallet: Wallet) => {
    if (wallet.features['standard:disconnect']) {
      return wallet.features['standard:disconnect'].disconnect();
    }
    throw new Error('Wallet does not support disconnect feature');
  },

  // Sign message with specific wallet
  signMessage: async (
    wallet: Wallet,
    address: string,
    message: Uint8Array
  ) => {
    const account = wallet.accounts.find((a) => a.address === address);
    if (!account) {
      throw new Error('Account not found');
    }

    const signFeature = wallet.features['solana:signMessage'] as SolanaSignMessageFeature;
    if (!signFeature) {
      throw new Error('Wallet does not support message signing');
    }

    const [result] = await signFeature.signMessage({
      account,
      message
    });
    return result;
  },

  // Sign transaction with specific wallet
  signTransaction: async (
    wallet: Wallet,
    address: string,
    transaction: Uint8Array,
    network: string = 'mainnet-beta'
  ) => {
    const account = wallet.accounts.find((a) => a.address === address);
    if (!account) {
      throw new Error('Account not found');
    }

    const signFeature = wallet.features['solana:signTransaction'] as SolanaSignTransactionFeature;
    if (!signFeature) {
      throw new Error('Wallet does not support transaction signing');
    }

    const [result] = await signFeature.signTransaction({
      transaction,
      chain: `solana:${network}`,
      account
    });
    return result;
  },

  // Check if wallet supports a specific feature
  supportsFeature: (wallet: Wallet, feature: string): boolean => {
    return feature in wallet.features;
  }
};

export default useSolanaWallet;