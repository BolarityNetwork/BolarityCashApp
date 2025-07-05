// utils/solanaWalletRegistration.ts
// Based on @wallet-standard/wallet implementation

interface Wallet {
  readonly version: string;
  readonly name: string;
  readonly icon: string;
  readonly accounts: SolanaAccount[];
  readonly features: WalletFeatures;
}

interface SolanaAccount {
  readonly address: string;
  readonly publicKey: Uint8Array;
  readonly chains: string[];
  readonly features: string[];
}

interface WalletFeatures {
  readonly [feature: string]: unknown;
  readonly 'standard:connect'?: StandardConnectFeature;
  readonly 'standard:disconnect'?: StandardDisconnectFeature;
  readonly 'standard:events'?: StandardEventsFeature;
  readonly 'solana:signMessage'?: SolanaSignMessageFeature;
  readonly 'solana:signTransaction'?: SolanaSignTransactionFeature;
  readonly 'solana:signAndSendTransaction'?: SolanaSignAndSendTransactionFeature;
}

interface StandardConnectFeature {
  connect(): Promise<{ accounts: SolanaAccount[] }>;
}

interface StandardDisconnectFeature {
  disconnect(): Promise<void>;
}

interface StandardEventsFeature {
  on(event: string, listener: (...args: any[]) => void): void;
  off(event: string, listener: (...args: any[]) => void): void;
}

interface SolanaSignMessageFeature {
  signMessage(input: {
    account: SolanaAccount;
    message: Uint8Array;
  }): Promise<{ signedMessage: Uint8Array; signature: Uint8Array }[]>;
}

interface SolanaSignTransactionFeature {
  signTransaction(input: {
    transaction: Uint8Array;
    chain: string;
    account: SolanaAccount;
  }): Promise<{ signedTransaction: Uint8Array }[]>;
}

interface SolanaSignAndSendTransactionFeature {
  signAndSendTransaction(input: {
    transaction: Uint8Array;
    chain: string;
    account: SolanaAccount;
  }): Promise<{ signature: string }>;
}

interface WalletEventsWindow extends Window {
  addEventListener(
    type: 'wallet-standard:app-ready',
    listener: (event: { detail: WindowRegisterWalletEventCallback }) => void
  ): void;
  dispatchEvent(event: WindowRegisterWalletEvent): boolean;
}

interface WindowRegisterWalletEvent extends Event {
  readonly type: 'wallet-standard:register-wallet';
  readonly detail: WindowRegisterWalletEventCallback;
}

interface WindowRegisterWalletEventCallback {
  (api: { register(wallet: Wallet): void }): void;
}

class RegisterWalletEvent extends Event implements WindowRegisterWalletEvent {
  readonly #detail: WindowRegisterWalletEventCallback;

  get detail() {
    return this.#detail;
  }

  override get type() {
    return 'wallet-standard:register-wallet' as const;
  }

  constructor(callback: WindowRegisterWalletEventCallback) {
    super('wallet-standard:register-wallet', {
      bubbles: false,
      cancelable: false,
      composed: false
    });
    this.#detail = callback;
  }
}

/**
 * Register a wallet with the Wallet Standard
 * This function dispatches the appropriate events to make the wallet available to other applications
 */
export function registerWallet(wallet: Wallet): void {
  const callback: WindowRegisterWalletEventCallback = ({ register }) => register(wallet);
  
  try {
    (window as WalletEventsWindow).dispatchEvent(new RegisterWalletEvent(callback));
  } catch (error) {
    console.error('wallet-standard:register-wallet event could not be dispatched\n', error);
  }
  
  try {
    (window as WalletEventsWindow).addEventListener('wallet-standard:app-ready', ({ detail: api }) =>
      callback(api)
    );
  } catch (error) {
    console.error('wallet-standard:app-ready event listener could not be added\n', error);
  }
}

/**
 * Create a Privy Solana wallet adapter
 * This creates a wallet that follows the Wallet Standard specification
 */
export function createPrivySolanaWallet(
  privyWallet: any, // Replace with actual Privy wallet type
  accounts: SolanaAccount[] = []
): Wallet {
  return {
    version: '1.0.0',
    name: 'Privy',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iMTYiIGZpbGw9IiM2NjdlZWEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik04IDJMMTQgNkw4IDE0TDIgNkw4IDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+',
    accounts,
    features: {
      'standard:connect': {
        async connect() {
          try {
            // Connect logic here - implement based on your Privy wallet interface
            console.log('Connecting Privy Solana wallet...');
            
            // Mock implementation - replace with actual Privy Solana connection
            const mockAccount: SolanaAccount = {
              address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHvp',
              publicKey: new Uint8Array(32), // Replace with actual public key
              chains: ['solana:mainnet-beta', 'solana:testnet', 'solana:devnet'],
              features: ['solana:signMessage', 'solana:signTransaction', 'solana:signAndSendTransaction']
            };

            return { accounts: [mockAccount] };
          } catch (error) {
            console.error('Failed to connect Privy Solana wallet:', error);
            throw error;
          }
        }
      },

      'standard:disconnect': {
        async disconnect() {
          try {
            console.log('Disconnecting Privy Solana wallet...');
            // Implement disconnect logic
          } catch (error) {
            console.error('Failed to disconnect Privy Solana wallet:', error);
            throw error;
          }
        }
      },

      'solana:signMessage': {
        async signMessage({ account, message }) {
          try {
            console.log('Signing message with Privy Solana wallet...');
            
            // Mock implementation - replace with actual Privy signing
            const signature = new Uint8Array(64);
            // Fill with mock signature data
            for (let i = 0; i < signature.length; i++) {
              signature[i] = Math.floor(Math.random() * 256);
            }

            return [{
              signedMessage: message,
              signature
            }];
          } catch (error) {
            console.error('Failed to sign message:', error);
            throw error;
          }
        }
      },

      'solana:signTransaction': {
        async signTransaction({ transaction, chain, account }) {
          try {
            console.log('Signing transaction with Privy Solana wallet...');
            
            // Mock implementation - replace with actual Privy transaction signing
            const signedTransaction = new Uint8Array(transaction.length);
            signedTransaction.set(transaction);
            
            return [{ signedTransaction }];
          } catch (error) {
            console.error('Failed to sign transaction:', error);
            throw error;
          }
        }
      },

      'solana:signAndSendTransaction': {
        async signAndSendTransaction({ transaction, chain, account }) {
          try {
            console.log('Signing and sending transaction with Privy Solana wallet...');
            
            // Mock implementation - replace with actual implementation
            const signature = Array.from(new Uint8Array(64))
              .map(b => b.toString(16).padStart(2, '0'))
              .join('');
              
            return { signature };
          } catch (error) {
            console.error('Failed to sign and send transaction:', error);
            throw error;
          }
        }
      }
    }
  };
}

/**
 * Register Privy wallet with Solana Wallet Standard
 * Call this function after initializing your Privy wallet
 */
export function registerPrivySolanaWallet(privyWallet: any, accounts: SolanaAccount[] = []) {
  const wallet = createPrivySolanaWallet(privyWallet, accounts);
  registerWallet(wallet);
  console.log('Privy Solana wallet registered with Wallet Standard');
  return wallet;
}

/**
 * Utility function to convert hex string to Uint8Array
 */
export function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Utility function to convert Uint8Array to hex string
 */
export function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Get supported Solana chains
 */
export function getSupportedSolanaChains(): string[] {
  return [
    'solana:mainnet-beta',
    'solana:testnet', 
    'solana:devnet'
  ];
}

/**
 * Helper function to check if a feature is supported
 */
export function isFeatureSupported(wallet: Wallet, feature: string): boolean {
  return feature in wallet.features;
}

export type {
  Wallet,
  SolanaAccount,
  WalletFeatures,
  StandardConnectFeature,
  StandardDisconnectFeature,
  SolanaSignMessageFeature,
  SolanaSignTransactionFeature,
  SolanaSignAndSendTransactionFeature
};