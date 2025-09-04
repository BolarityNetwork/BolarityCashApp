import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  usePrivy,
  useLinkWithOAuth,
  useEmbeddedEthereumWallet,
} from '@privy-io/expo';
import { useLinkWithPasskey } from '@privy-io/expo/passkey';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';
import { useProfileState } from '@/hooks/profile/useProfileState';
import { useWalletActions } from '@/hooks/profile/useWalletActions';
import { WalletLogo } from '@/components/profile/components/WalletLogo';
import { ProfileHeader } from '@/components/profile/components/ProfileHeader';
import { QuickAction } from '@/components/profile/components/QuickAction';
import { BaseModal } from '@/components/profile/components/BaseModal';
import { formatAddress, toMainIdentifier } from '@/utils/profile';
import { WalletCard } from '@/components/profile/components/WalletCard';

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
  const { logout, user } = usePrivy();
  const { linkWithPasskey } = useLinkWithPasskey();
  const oauth = useLinkWithOAuth();
  const { create } = useEmbeddedEthereumWallet();
  const router = useRouter();

  const {
    activeWalletType,
    activeWallet,
    ethereumWallet,
    solanaWallet,
    hasSolanaWallet,
    isCreatingSolanaWallet,
    switchWalletType,
    createSolanaWallet,
    getCurrentEthereumNetwork,
    getAvailableNetworks,
    switchEthereumNetwork,
    activeEthereumNetwork,
    isSwitchingNetwork,
  } = useMultiChainWallet();

  const profileState = useProfileState();
  const walletActions = useWalletActions();

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#667eea" />
        <Text className="text-base text-slate-500 mt-3">
          Loading profile...
        </Text>
      </View>
    );
  }

  const handleWalletAction = (actionType: 'sign' | 'sendTx' | 'signTx') => {
    profileState.setLoading(true);

    const actions = {
      sign: () =>
        walletActions.handleSignMessage(profileState.addSignedMessage),
      sendTx: () =>
        walletActions.handleSendTransaction(profileState.addTransaction),
      signTx: () =>
        walletActions.handleSignTransaction(profileState.addTransaction),
    };

    actions[actionType]().finally(() => {
      profileState.setLoading(false);
    });
  };

  return (
    <View className="flex-1 bg-slate-50">
      <SafeAreaView className="flex-1">
        <ProfileHeader onSettingsPress={() => router.push('/settings')} />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header Card */}
          <View className="bg-white mx-5 mt-5 rounded-3xl p-6 items-center shadow-lg">
            <View className="relative mb-4">
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                className="w-25 h-25 rounded-full items-center justify-center shadow-lg"
              >
                <Text className="text-4xl font-bold text-white">
                  {user.email?.address
                    ? user.email.address.charAt(0).toUpperCase()
                    : '👤'}
                </Text>
              </LinearGradient>
              <View className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-white items-center justify-center shadow-md">
                <View className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
              </View>
            </View>

            <Text className="text-2xl font-bold text-slate-800 text-center mb-1">
              {user.email?.address || 'Bolarity User'}
            </Text>
            <Text className="text-sm text-slate-500 font-mono mb-4">
              ID: {formatAddress(user.id)}
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
                  {user.linked_accounts.length}
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
                <Text className="text-xs text-slate-500 mt-0.5">
                  Transactions
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="px-5 mt-6">
            <Text className="text-lg font-bold text-slate-800 mb-3">
              Quick Actions
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <QuickAction
                icon="🔄"
                text="Switch Wallet"
                onPress={() => profileState.openModal('walletSwitch')}
                backgroundColor="#f0f9ff"
              />

              {/* Network switch button for Ethereum */}
              {activeWalletType === 'ethereum' && (
                <QuickAction
                  icon="🌐"
                  text={isSwitchingNetwork ? 'Switching...' : 'Switch Network'}
                  onPress={() => profileState.openModal('network')}
                  backgroundColor="#fef3c7"
                  disabled={isSwitchingNetwork}
                />
              )}

              <QuickAction
                icon="✍️"
                text="Sign Message"
                onPress={() => handleWalletAction('sign')}
                backgroundColor="#ecfdf5"
                disabled={
                  profileState.isLoading || !walletActions.canPerformActions
                }
              />

              <QuickAction
                icon="📤"
                text="Send Test TX"
                onPress={() => handleWalletAction('sendTx')}
                backgroundColor="#f3e8ff"
                disabled={
                  profileState.isLoading || !walletActions.canPerformActions
                }
              />

              <QuickAction
                icon="🔏"
                text="Sign Test TX"
                onPress={() => handleWalletAction('signTx')}
                backgroundColor="#fef2f2"
                disabled={
                  profileState.isLoading || !walletActions.canPerformActions
                }
              />

              <QuickAction
                icon="⚙️"
                text="Settings"
                onPress={() => router.push('/settings')}
                backgroundColor="#f8fafc"
              />
            </View>
          </View>

          {/* Multi-Chain Wallet Section */}
          <View className="mx-5 mt-4 bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100">
            <TouchableOpacity
              className="flex-row items-center justify-between p-5"
              onPress={() => profileState.toggleSection('wallet')}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-9 h-9 rounded-full bg-slate-50 items-center justify-center mr-3">
                  <Text className="text-lg">💰</Text>
                </View>
                <Text className="text-base font-semibold text-slate-800">
                  Multi-Chain Wallets
                </Text>
              </View>
              <Text className="text-sm text-slate-400">
                {profileState.expandedSection === 'wallet' ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {profileState.expandedSection === 'wallet' && (
              <View className="px-5 pb-5">
                {/* Ethereum Wallet */}
                <View className="mb-5">
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <WalletLogo
                        type="ethereum"
                        size={24}
                        style={{ marginRight: 8 }}
                      />
                      <Text className="text-base font-bold text-slate-800">
                        Ethereum Wallet
                      </Text>
                    </View>
                    {activeWalletType === 'ethereum' && (
                      <View className="bg-emerald-500 rounded-xl px-2 py-1">
                        <Text className="text-xs font-bold text-white">
                          Active
                        </Text>
                      </View>
                    )}
                  </View>

                  <WalletCard
                    wallet={{
                      address: ethereumWallet?.address,
                      type: 'ethereum',
                      iconType: 'ethereum',
                      network: getCurrentEthereumNetwork().name,
                    }}
                    isActive={activeWalletType === 'ethereum'}
                    onPress={() => {
                      if (ethereumWallet?.address) {
                        if (activeWalletType !== 'ethereum') {
                          switchWalletType('ethereum');
                        }
                        profileState.openModal('wallet');
                      } else {
                        create();
                      }
                    }}
                    onCopyAddress={address =>
                      walletActions.copyToClipboard(address, 'Ethereum')
                    }
                    onNetworkPress={() => profileState.openModal('network')}
                  />
                </View>

                {/* Solana Wallet */}
                <View className="mb-5">
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <WalletLogo
                        type="solana"
                        size={24}
                        style={{ marginRight: 8 }}
                      />
                      <Text className="text-base font-bold text-slate-800">
                        Solana Wallet
                      </Text>
                    </View>
                    {activeWalletType === 'solana' && (
                      <View className="bg-emerald-500 rounded-xl px-2 py-1">
                        <Text className="text-xs font-bold text-white">
                          Active
                        </Text>
                      </View>
                    )}
                  </View>

                  <WalletCard
                    wallet={{
                      address: solanaWallet?.address,
                      type: 'solana',
                      iconType: 'solana',
                      network: 'mainnet-beta',
                    }}
                    isActive={activeWalletType === 'solana'}
                    onPress={() => {
                      if (hasSolanaWallet && solanaWallet?.address) {
                        if (activeWalletType !== 'solana') {
                          switchWalletType('solana');
                        }
                      } else {
                        createSolanaWallet();
                      }
                    }}
                    onCopyAddress={address =>
                      walletActions.copyToClipboard(address, 'Solana')
                    }
                    isCreating={isCreatingSolanaWallet}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Security Section */}
          <View className="mx-5 mt-4 bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100">
            <TouchableOpacity
              className="flex-row items-center justify-between p-5"
              onPress={() => profileState.toggleSection('security')}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-9 h-9 rounded-full bg-slate-50 items-center justify-center mr-3">
                  <Text className="text-lg">🔐</Text>
                </View>
                <Text className="text-base font-semibold text-slate-800">
                  Security & Access
                </Text>
              </View>
              <Text className="text-sm text-slate-400">
                {profileState.expandedSection === 'security' ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {profileState.expandedSection === 'security' && (
              <View className="px-5 pb-5">
                <TouchableOpacity
                  className="flex-row items-center py-4 border-b border-slate-50"
                  onPress={() =>
                    linkWithPasskey({
                      relyingParty:
                        Constants.expoConfig?.extra?.passkeyAssociatedDomain,
                    })
                  }
                >
                  <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-3">
                    <Text className="text-lg">🔑</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-slate-800">
                      Passkey Security
                    </Text>
                    <Text className="text-xs text-slate-500 mt-0.5">
                      Enhanced biometric authentication
                    </Text>
                  </View>
                  <TouchableOpacity className="bg-indigo-500 rounded-lg py-1.5 px-3">
                    <Text className="text-xs font-semibold text-white">
                      Link
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center py-4 border-b border-slate-50"
                  onPress={() => profileState.openModal('messages')}
                >
                  <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-3">
                    <Text className="text-lg">✍️</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-slate-800">
                      Signed Messages
                    </Text>
                    <Text className="text-xs text-slate-500 mt-0.5">
                      View your message signatures
                    </Text>
                  </View>
                  <TouchableOpacity className="bg-slate-100 rounded-lg py-1.5 px-3">
                    <Text className="text-xs font-semibold text-slate-600">
                      View
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center py-4"
                  onPress={() => profileState.openModal('transactions')}
                >
                  <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-3">
                    <Text className="text-lg">📊</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-slate-800">
                      Transaction History
                    </Text>
                    <Text className="text-xs text-slate-500 mt-0.5">
                      View your test transactions
                    </Text>
                  </View>
                  <TouchableOpacity className="bg-slate-100 rounded-lg py-1.5 px-3">
                    <Text className="text-xs font-semibold text-slate-600">
                      View
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Connected Accounts */}
          <View className="mx-5 mt-4 bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100">
            <TouchableOpacity
              className="flex-row items-center justify-between p-5"
              onPress={() => profileState.toggleSection('accounts')}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-9 h-9 rounded-full bg-slate-50 items-center justify-center mr-3">
                  <Text className="text-lg">🌐</Text>
                </View>
                <Text className="text-base font-semibold text-slate-800">
                  Connected Accounts
                </Text>
                <View className="bg-indigo-500 rounded-lg px-2 py-0.5 ml-2">
                  <Text className="text-xs font-bold text-white">
                    {user.linked_accounts.length}
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-slate-400">
                {profileState.expandedSection === 'accounts' ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {profileState.expandedSection === 'accounts' && (
              <View className="px-5 pb-5">
                {user.linked_accounts.slice(0, 3).map((accountItem, index) => (
                  <View
                    key={index}
                    className="flex-row items-center py-3 border-b border-slate-50"
                  >
                    <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-3">
                      {getProviderIcon(accountItem.type, 18)}
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-slate-800 capitalize">
                        {accountItem.type
                          .replace('_oauth', '')
                          .replace('_', ' ')}
                      </Text>
                      <Text className="text-xs text-slate-500 mt-0.5">
                        {toMainIdentifier(accountItem)}
                      </Text>
                    </View>
                    <View className="w-6 h-6 rounded-full bg-emerald-500 items-center justify-center">
                      <Text className="text-xs text-white font-bold">✓</Text>
                    </View>
                  </View>
                ))}

                {user.linked_accounts.length > 3 && (
                  <TouchableOpacity
                    className="mt-3 py-2 items-center"
                    onPress={() => profileState.openModal('accounts')}
                  >
                    <Text className="text-sm font-semibold text-indigo-500">
                      View All ({user.linked_accounts.length})
                    </Text>
                  </TouchableOpacity>
                )}

                <View className="mt-4 pt-4 border-t border-slate-50">
                  <Text className="text-sm font-semibold text-slate-800 mb-3">
                    Link New Account
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {['google', 'github', 'discord', 'apple'].map(provider => (
                      <TouchableOpacity
                        key={provider}
                        className="flex-row items-center bg-slate-50 rounded-xl py-2 px-3 border border-slate-200"
                        onPress={() => oauth.link({ provider } as any)}
                        disabled={oauth.state.status === 'loading'}
                      >
                        {getProviderIcon(provider, 16)}
                        <Text className="text-xs font-medium text-slate-600 ml-1.5">
                          {provider.charAt(0).toUpperCase() + provider.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>

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
      </SafeAreaView>

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
        {ethereumWallet?.address && (
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
                  {formatAddress(ethereumWallet.address)}
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
        {hasSolanaWallet && solanaWallet && (
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
                  {formatAddress(solanaWallet.address)}
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

          {!ethereumWallet?.address && (
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
        {user.linked_accounts.map((accountItem, index) => (
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
        ))}
      </BaseModal>
    </View>
  );
}
