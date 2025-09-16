import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  StatusBar,
} from 'react-native';
import { useEmbeddedEthereumWallet } from '@privy-io/expo';
import { Redirect, useRouter } from 'expo-router';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';
import { useProfileState } from '@/hooks/profile/useProfileState';
import { WalletLogo } from '@/components/profile/WalletLogo';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { BaseModal } from '@/components/profile/BaseModal';
import { BalanceCard } from '@/components/profile/BalanceCard';
import { SettingItem } from '@/components/profile/SettingItem';
import { SettingSection } from '@/components/profile/SettingSection';
import { formatAddress, toMainIdentifier } from '@/utils/profile';
import { CommonSafeAreaView } from '@/components/CommonSafeAreaView';
import { usePersistedPrivyUser } from '@/hooks/usePersistedPrivyUser';

// Provider icon logos
let ethereumProviderLogo: any, solanaProviderLogo: any;

try {
  ethereumProviderLogo = require('@/assets/logos/ethereum.png');
} catch (e) {
  console.warn('❌ Ethereum provider logo not found:', e);
  ethereumProviderLogo = null;
}

try {
  solanaProviderLogo = require('@/assets/logos/solana.png');
} catch (e) {
  console.warn('❌ Solana provider logo not found:', e);
  solanaProviderLogo = null;
}

export function getProviderIcon(
  type: string,
  size: number = 18
): React.ReactElement {
  // For ethereum and solana, return PNG image components if available
  if (type === 'ethereum' && ethereumProviderLogo) {
    return (
      <Image
        source={ethereumProviderLogo}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
        onError={() => {
          console.log('❌ Ethereum provider icon failed to load');
        }}
      />
    );
  }

  if (type === 'solana' && solanaProviderLogo) {
    return (
      <Image
        source={solanaProviderLogo}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
        onError={() => {
          console.log('❌ Solana provider icon failed to load');
        }}
      />
    );
  }

  // For other types or PNG loading failure, return emoji components
  const icons: { [key: string]: string } = {
    email: '📧',
    phone: '📱',
    wallet: '💼',
    solana: '🌞', // fallback
    ethereum: '🔷', // fallback
    twitter_oauth: '🐦',
    tiktok_oauth: '🎵',
    google: '🔍',
    github: '⚡',
    discord: '🎮',
    apple: '🍎',
    custom_auth: '🔐',
  };

  const icon = icons[type] || '🔗';

  return <Text style={{ fontSize: size * 0.9 }}>{icon}</Text>;
}

export default function ProfileScreen() {
  const { user: persistedUser, logout } = usePersistedPrivyUser();
  const { create } = useEmbeddedEthereumWallet();
  const router = useRouter();
  const {
    activeWalletType,
    activeWallet,
    ethereumAddress,
    solanaAddress,
    hasSolanaWallet,
    isCreatingSolanaWallet,
    switchWalletType,
    createSolanaWallet,
    getAvailableNetworks,
    switchEthereumNetwork,
    activeEthereumNetwork,
    isSwitchingNetwork,
  } = useMultiChainWallet();
  const profileState = useProfileState();

  if (!persistedUser) {
    return <Redirect href="/login" />;
  }

  return (
    <CommonSafeAreaView className="flex-1 bg-white" isIncludeBottomBar={true}>
      <StatusBar barStyle="dark-content" />
      <ProfileHeader onSettingsPress={() => router.push('/settings')} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <BalanceCard
          address={activeWallet.address || ''}
          // TODO: get asset distribution from backend
          assetDistribution={{
            USD: 0.4,
            BTC: 0.35,
            ETH: 0.25,
          }}
          profileState={profileState}
        />

        {/* Security Section */}
        <SettingSection title="Security">
          <SettingItem
            icon="🔑"
            title="Keys & Recovery"
            onPress={() => router.push('/settings/keys-recovery')}
          />
          <SettingItem
            icon="⏰"
            title="Spending Limits"
            onPress={() => router.push('/settings/spending-limits')}
          />
          <SettingItem
            icon="🔐"
            title="Privy relative"
            onPress={() => router.push('/settings/privy-relative')}
          />
        </SettingSection>

        {/* General Section */}
        <SettingSection title="General">
          <SettingItem
            icon="💼"
            title="Edit wallet"
            onPress={() => router.push('/settings/edit-wallet')}
          />
          <SettingItem
            icon="🔔"
            title="Notifications"
            onPress={() => router.push('/settings/notifications')}
          />
          <SettingItem
            icon="👥"
            title="Address book"
            onPress={() => router.push('/settings/address-book')}
          />
          <SettingItem
            icon="🏔️"
            title="Setting"
            onPress={() => router.push('/settings')}
          />
          <SettingItem
            icon="🖼️"
            title="NFTs"
            onPress={() => router.push('/settings/nfts')}
          />
          <SettingItem
            icon="🌐"
            title="Network"
            onPress={() => router.push('/settings/network')}
          />
        </SettingSection>

        {/* About Section */}
        <SettingSection title="About">
          <SettingItem
            icon="💬"
            title="Contact support"
            onPress={() => router.push('/settings/contact-support')}
          />
          <SettingItem
            icon="⭐"
            title="Share your feedback"
            onPress={() => router.push('/settings/share-feedback')}
          />
          <SettingItem
            icon="🐦"
            title="Follow @bolaritywallet"
            onPress={() => router.push('/settings/follow-twitter')}
          />
        </SettingSection>

        {/* Sign Out Button */}
        <TouchableOpacity
          className="mx-5 mt-6 bg-white rounded-2xl overflow-hidden border-2 border-red-100 shadow-md"
          onPress={logout}
        >
          <View className="flex-row items-center justify-center py-4">
            <Text className="text-lg mr-2">🚪</Text>
            <Text className="text-base font-semibold text-red-600">
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>

        <View className="h-5" />
      </ScrollView>

      {/* All Modals */}
      {/* Network Switch Modal */}
      <BaseModal
        visible={profileState.activeModal === 'network'}
        onClose={profileState.closeModal}
        title="Switch Network"
      >
        <Text className="text-base text-slate-500 mb-6 text-center">
          Choose which Ethereum network to connect to
        </Text>

        {getAvailableNetworks().map(network => {
          const networkKey =
            Object.entries({
              mainnet: { name: 'Ethereum Mainnet' },
              sepolia: { name: 'Ethereum Sepolia' },
              polygon: { name: 'Polygon Mainnet' },
              bsc: { name: 'BSC Mainnet' },
              arbitrum: { name: 'Arbitrum One' },
              optimism: { name: 'Optimism' },
              base: { name: 'Base Mainnet' },
            }).find(([_, config]) => config.name === network.name)?.[0] ||
            'mainnet';

          const isActive = activeEthereumNetwork === networkKey;

          return (
            <TouchableOpacity
              key={network.name}
              className={`bg-white rounded-2xl mb-3 shadow-md border ${
                isActive ? 'border-indigo-500 border-2' : 'border-slate-100'
              }`}
              onPress={async () => {
                try {
                  await switchEthereumNetwork(networkKey);
                  profileState.closeModal();
                } catch (_) {
                  // Error handled in hook
                }
              }}
              disabled={isSwitchingNetwork}
            >
              <View className="flex-row items-center p-4">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: network.color + '20' }}
                >
                  <Text className="text-2xl">{network.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-slate-800 mb-1">
                    {network.name}
                  </Text>
                  <Text className="text-sm text-slate-500 mb-0.5">
                    Chain ID: {network.chainId} • {network.symbol}
                  </Text>
                  <Text className="text-xs text-slate-400">
                    {network.blockExplorer}
                  </Text>
                </View>
                {isActive && (
                  <Text className="text-2xl text-indigo-500 font-bold">✓</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {isSwitchingNetwork && (
          <View className="items-center py-5">
            <ActivityIndicator color="#667eea" size="large" />
            <Text className="text-base text-indigo-500 mt-3 font-medium">
              Switching network...
            </Text>
          </View>
        )}
      </BaseModal>

      {/* Wallet Switch Modal */}
      <BaseModal
        visible={profileState.activeModal === 'walletSwitch'}
        onClose={profileState.closeModal}
        title="Switch Wallet"
      >
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
            onPress={() => {
              switchWalletType('ethereum');
              profileState.closeModal();
            }}
          >
            <View className="flex-row items-center p-4">
              <WalletLogo
                type="ethereum"
                size={32}
                style={{ marginRight: 12 }}
              />
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
            onPress={() => {
              switchWalletType('solana');
              profileState.closeModal();
            }}
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
              onPress={() => {
                create();
                profileState.closeModal();
              }}
            >
              <WalletLogo
                type="ethereum"
                size={24}
                style={{ marginRight: 12 }}
              />
              <Text className="text-base font-semibold text-slate-800">
                Create Ethereum Wallet
              </Text>
            </TouchableOpacity>
          )}

          {!hasSolanaWallet && (
            <TouchableOpacity
              className="flex-row items-center bg-slate-50 rounded-xl p-4 mb-3 border border-slate-200"
              onPress={async () => {
                profileState.closeModal();
                await createSolanaWallet();
              }}
              disabled={isCreatingSolanaWallet}
            >
              <WalletLogo type="solana" size={24} style={{ marginRight: 12 }} />
              <Text className="text-base font-semibold text-slate-800">
                {isCreatingSolanaWallet
                  ? 'Creating...'
                  : 'Create Solana Wallet'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </BaseModal>

      {/* Messages Modal */}
      <BaseModal
        visible={profileState.activeModal === 'messages'}
        onClose={profileState.closeModal}
        title="Signed Messages"
      >
        {profileState.signedMessages.length === 0 ? (
          <View className="items-center py-10">
            <Text className="text-5xl mb-4">📝</Text>
            <Text className="text-lg font-bold text-slate-800 mb-2">
              No Messages Signed
            </Text>
            <Text className="text-sm text-slate-500 text-center">
              Sign your first message to see it here
            </Text>
          </View>
        ) : (
          profileState.signedMessages.map((message, index) => (
            <View
              key={index}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm"
            >
              <Text className="text-xs font-bold text-indigo-500 mb-2">
                #{index + 1}
              </Text>
              <Text className="text-sm text-slate-800 font-mono mb-2">
                {message}
              </Text>
              <Text className="text-xs text-slate-400">
                {new Date().toLocaleString()}
              </Text>
            </View>
          ))
        )}
      </BaseModal>

      {/* Transactions Modal */}
      <BaseModal
        visible={profileState.activeModal === 'transactions'}
        onClose={profileState.closeModal}
        title="Transaction History"
      >
        {profileState.transactionResults.length === 0 ? (
          <View className="items-center py-10">
            <Text className="text-5xl mb-4">📊</Text>
            <Text className="text-lg font-bold text-slate-800 mb-2">
              No Transactions
            </Text>
            <Text className="text-sm text-slate-500 text-center">
              Send your first test transaction to see it here
            </Text>
          </View>
        ) : (
          profileState.transactionResults.map((transaction, index) => (
            <View
              key={index}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm"
            >
              <Text className="text-xs font-bold text-indigo-500 mb-2">
                #{index + 1}
              </Text>
              <Text className="text-sm text-slate-800 font-mono mb-2">
                {transaction}
              </Text>
              <Text className="text-xs text-slate-400">
                {new Date().toLocaleString()}
              </Text>
            </View>
          ))
        )}
      </BaseModal>

      {/* Accounts Modal */}
      <BaseModal
        visible={profileState.activeModal === 'accounts'}
        onClose={profileState.closeModal}
        title="All Connected Accounts"
      >
        {persistedUser?.linked_accounts.map(
          (accountItem: any, index: number) => (
            <View
              key={index}
              className="flex-row items-center py-3 border-b border-slate-50"
            >
              <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-3">
                {getProviderIcon(accountItem.type, 18)}
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-slate-800 capitalize">
                  {accountItem.type.replace('_oauth', '').replace('_', ' ')}
                </Text>
                <Text className="text-xs text-slate-500 mt-0.5">
                  {toMainIdentifier(accountItem)}
                </Text>
              </View>
              <View className="w-6 h-6 rounded-full bg-emerald-500 items-center justify-center">
                <Text className="text-xs text-white font-bold">✓</Text>
              </View>
            </View>
          )
        )}
      </BaseModal>
    </CommonSafeAreaView>
  );
}
