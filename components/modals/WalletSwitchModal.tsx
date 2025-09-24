import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { BaseModal } from '@/components/common/BaseModal';
import { WalletLogo } from '@/components/profile/WalletLogo';
import { formatAddress } from '@/utils/profile';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';

interface WalletSwitchModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WalletSwitchModal: React.FC<WalletSwitchModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    activeWallet,
    switchWalletType,
    createSolanaWallet,
    ethereumAddress,
    solanaAddress,
    hasSolanaWallet,
    isCreatingSolanaWallet,
  } = useMultiChainWallet();

  const activeWalletType = activeWallet.type || 'ethereum';

  const handleWalletSwitch = (type: 'ethereum' | 'solana') => {
    switchWalletType(type);
    onClose();
  };

  const handleCreateEthereumWallet = () => {
    Alert.alert(
      'Info',
      'Ethereum wallet creation is handled automatically by Privy when you sign up. If you need a new Ethereum wallet, please contact support.'
    );
    onClose();
  };

  const handleCreateSolanaWallet = async () => {
    onClose();
    return await createSolanaWallet();
  };

  return (
    <BaseModal visible={visible} onClose={onClose} title="Switch Wallet">
      <Text className="text-base text-slate-500 mb-6 text-center">
        Choose which wallet to use as your primary wallet
      </Text>

      {/* Ethereum Wallet Option */}
      {ethereumAddress && (
        <TouchableOpacity
          className={`bg-white rounded-2xl mb-3 shadow-md border ${
            activeWalletType === 'ethereum'
              ? 'border-indigo-500 border-2'
              : 'border-slate-100'
          }`}
          onPress={() => handleWalletSwitch('ethereum')}
        >
          <View className="flex-row items-center p-4">
            <WalletLogo type="ethereum" size={32} style={{ marginRight: 12 }} />
            <View className="flex-1">
              <Text className="text-base font-bold text-slate-800">
                Ethereum Wallet
              </Text>
              <Text className="text-sm text-slate-500 font-mono mt-0.5">
                {formatAddress(ethereumAddress)}
              </Text>
              <Text className="text-xs text-slate-400 mt-0.5">
                Ethereum Mainnet
              </Text>
            </View>
            {activeWalletType === 'ethereum' && (
              <Text className="text-xl text-indigo-500 font-bold">✓</Text>
            )}
          </View>
        </TouchableOpacity>
      )}

      {/* Solana Wallet Option */}
      {hasSolanaWallet && solanaAddress && (
        <TouchableOpacity
          className={`bg-white rounded-2xl mb-3 shadow-md border ${
            activeWalletType === 'solana'
              ? 'border-indigo-500 border-2'
              : 'border-slate-100'
          }`}
          onPress={() => handleWalletSwitch('solana')}
        >
          <View className="flex-row items-center p-4">
            <WalletLogo type="solana" size={32} style={{ marginRight: 12 }} />
            <View className="flex-1">
              <Text className="text-base font-bold text-slate-800">
                Solana Wallet
              </Text>
              <Text className="text-sm text-slate-500 font-mono mt-0.5">
                {formatAddress(solanaAddress)}
              </Text>
              <Text className="text-xs text-slate-400 mt-0.5">
                mainnet-beta
              </Text>
            </View>
            {activeWalletType === 'solana' && (
              <Text className="text-xl text-indigo-500 font-bold">✓</Text>
            )}
          </View>
        </TouchableOpacity>
      )}

      {/* Create New Wallet Section */}
      <View className="mt-5 pt-5 border-t border-slate-100">
        <Text className="text-base font-bold text-slate-800 mb-4">
          Create New Wallet
        </Text>

        {!ethereumAddress && (
          <TouchableOpacity
            className="flex-row items-center bg-slate-50 rounded-xl p-4 mb-3 border border-slate-200"
            onPress={handleCreateEthereumWallet}
          >
            <WalletLogo type="ethereum" size={24} style={{ marginRight: 12 }} />
            <Text className="text-base font-semibold text-slate-800">
              Create Ethereum Wallet
            </Text>
          </TouchableOpacity>
        )}

        {!hasSolanaWallet && (
          <TouchableOpacity
            className="flex-row items-center bg-slate-50 rounded-xl p-4 mb-3 border border-slate-200"
            onPress={handleCreateSolanaWallet}
            disabled={isCreatingSolanaWallet}
          >
            <WalletLogo type="solana" size={24} style={{ marginRight: 12 }} />
            <Text className="text-base font-semibold text-slate-800">
              {isCreatingSolanaWallet ? 'Creating...' : 'Create Solana Wallet'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </BaseModal>
  );
};
