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

export interface ProfileActions {
  setActiveModal: (modal: ModalType) => void;
  setExpandedSection: (section: string | null) => void;
  addSignedMessage: (message: string) => void;
  addTransaction: (tx: string) => void;
  setLoading: (loading: boolean) => void;
  toggleSection: (section: string) => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
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

export interface WalletLogoProps {
  type: 'ethereum' | 'solana';
  size?: number;
  style?: any;
}

export interface QuickActionProps {
  icon: string;
  text: string;
  onPress: () => void;
  backgroundColor?: string;
  disabled?: boolean;
}

export interface WalletCardProps {
  wallet: WalletInfo;
  isActive: boolean;
  onPress: () => void;
  onCopyAddress?: (address: string) => void;
  onNetworkPress?: () => void;
  isCreating?: boolean;
}

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
