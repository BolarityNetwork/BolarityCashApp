export type ModalType = 
  | 'wallet'
  | 'accounts' 
  | 'messages'
  | 'transactions'
  | 'settings'
  | 'walletSwitch'
  | 'network'
  | null;

export interface ProfileState {
  activeModal: ModalType;
  expandedSection: string | null;
  signedMessages: string[];
  transactionResults: string[];
  isLoading: boolean;
}

export interface WalletInfo {
  address?: string;
  type: 'ethereum' | 'solana';
  iconType: string;
  network?: string;
}

export interface NetworkInfo {
  name: string;
  icon: string;
  chainId: string;
  symbol: string;
  blockExplorer: string;
  color: string;
}