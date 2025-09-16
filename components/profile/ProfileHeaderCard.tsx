import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { WalletLogo } from '@/components/profile/WalletLogo';
import { formatAddress } from '@/utils/profile';

interface ProfileHeaderCardProps {
  user: any;
  activeWallet: {
    type: string;
    address?: string;
  };
  profileState: any;
  getCurrentEthereumNetwork: () => {
    icon: string;
    name: string;
  };
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  user,
  activeWallet,
  profileState,
  getCurrentEthereumNetwork,
}) => {
  return (
    <View className="bg-white mx-5 mt-5 rounded-3xl p-6 items-center">
      <View className="relative mb-4">
        <Text className="text-4xl font-bold text-white">
          {user?.email?.address
            ? user.email.address.charAt(0).toUpperCase()
            : '👤'}
        </Text>
      </View>

      <Text className="text-2xl font-bold text-slate-800 text-center mb-1">
        {user?.email?.address || 'Bolarity User'}
      </Text>
      <Text className="text-sm text-slate-500 font-mono mb-4">
        ID: {formatAddress(user?.id)}
      </Text>

      {/* Current Wallet Display */}
      <TouchableOpacity
        className="flex-row items-center bg-slate-50 rounded-2xl p-4 mb-5 border-2 border-slate-200 w-full"
        onPress={() => profileState.openModal('walletSwitch')}
      >
        <WalletLogo
          type={activeWallet.type === 'ethereum' ? 'ethereum' : 'solana'}
          size={28}
          style={{ marginRight: 12 }}
        />
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-800">
            {activeWallet.type === 'ethereum'
              ? 'Ethereum Wallet'
              : 'Solana Wallet'}
          </Text>
          <Text className="text-sm text-slate-500 font-mono mt-0.5">
            {activeWallet.address
              ? formatAddress(activeWallet.address)
              : 'Not connected'}
          </Text>

          {/* Network info for Ethereum */}
          {activeWallet.type === 'ethereum' && (
            <TouchableOpacity
              className="flex-row items-center bg-slate-100/50 rounded-lg py-1 px-2 border border-slate-200/50 mt-1"
              onPress={() => profileState.openModal('network')}
            >
              <Text className="text-xs mr-1">
                {getCurrentEthereumNetwork().icon}
              </Text>
              <Text className="text-xs text-slate-500 flex-1">
                {getCurrentEthereumNetwork().name}
              </Text>
              <Text className="text-xs ml-1">⚙️</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text className="text-xl text-indigo-500">🔄</Text>
      </TouchableOpacity>

      <View className="flex-row items-center bg-slate-50 rounded-2xl py-4 px-6 border border-slate-200">
        <View className="items-center flex-1">
          <Text className="text-xl font-bold text-indigo-500">
            {user?.linked_accounts.length}
          </Text>
          <Text className="text-xs text-slate-500 mt-0.5">Accounts</Text>
        </View>
        <View className="w-px h-8 bg-slate-200 mx-4" />
        <View className="items-center flex-1">
          <Text className="text-xl font-bold text-indigo-500">
            {profileState.signedMessages.length}
          </Text>
          <Text className="text-xs text-slate-500 mt-0.5">Messages</Text>
        </View>
        <View className="w-px h-8 bg-slate-200 mx-4" />
        <View className="items-center flex-1">
          <Text className="text-xl font-bold text-indigo-500">
            {profileState.transactionResults.length}
          </Text>
          <Text className="text-xs text-slate-500 mt-0.5">Transactions</Text>
        </View>
      </View>
    </View>
  );
};
