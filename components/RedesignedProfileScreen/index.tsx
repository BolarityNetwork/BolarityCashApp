import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  usePrivy,
  useLinkWithOAuth,
  useEmbeddedEthereumWallet,
} from '@privy-io/expo';
import { useLinkWithPasskey } from '@privy-io/expo/passkey';
import Constants from 'expo-constants';
import { useMultiChainWallet } from '../../hooks/useMultiChainWallet';
import { useProfileState } from './hooks/useProfileState';
import { useWalletActions } from './hooks/useWalletActions';
import { WalletLogo } from './components/WalletLogo';
import { ProfileHeader } from './components/ProfileHeader';
import { QuickAction } from './components/QuickAction';
import { WalletCard } from './components/WalletCard';
import { BaseModal } from './components/BaseModal';
import { formatAddress, toMainIdentifier, getProviderIcon } from './utils';
import { styles } from './styles';

export default function RedesignedProfileScreen() {
  const { logout, user } = usePrivy();
  const { linkWithPasskey } = useLinkWithPasskey();
  const oauth = useLinkWithOAuth();
  const { create } = useEmbeddedEthereumWallet();
  // const { create: createSolanaWallet } = useEmbeddedSolanaWallet();

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading profile...</Text>
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
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ProfileHeader
          onSettingsPress={() => profileState.openModal('settings')}
        />

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {user.email?.address
                    ? user.email.address.charAt(0).toUpperCase()
                    : '👤'}
                </Text>
              </LinearGradient>
              <View style={styles.statusIndicator}>
                <View style={styles.statusDot} />
              </View>
            </View>

            <Text style={styles.profileName}>
              {user.email?.address || 'Bolarity User'}
            </Text>
            <Text style={styles.profileId}>ID: {formatAddress(user.id)}</Text>

            {/* Current Wallet Display */}
            <TouchableOpacity
              style={styles.currentWalletCard}
              onPress={() => profileState.openModal('walletSwitch')}
            >
              <WalletLogo
                type={activeWallet.type === 'ethereum' ? 'ethereum' : 'solana'}
                size={28}
                style={{ marginRight: 12 }}
              />
              <View style={styles.currentWalletInfo}>
                <Text style={styles.currentWalletType}>
                  {activeWallet.type === 'ethereum'
                    ? 'Ethereum Wallet'
                    : 'Solana Wallet'}
                </Text>
                <Text style={styles.currentWalletAddress}>
                  {activeWallet.address
                    ? formatAddress(activeWallet.address)
                    : 'Not connected'}
                </Text>

                {/* Network info for Ethereum */}
                {activeWallet.type === 'ethereum' && (
                  <TouchableOpacity
                    style={styles.networkDisplayButton}
                    onPress={() => profileState.openModal('network')}
                  >
                    <Text style={styles.networkIcon}>
                      {getCurrentEthereumNetwork().icon}
                    </Text>
                    <Text style={styles.networkName}>
                      {getCurrentEthereumNetwork().name}
                    </Text>
                    <Text style={styles.networkSwitchIcon}>⚙️</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.switchIcon}>🔄</Text>
            </TouchableOpacity>

            <View style={styles.profileStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {user.linked_accounts.length}
                </Text>
                <Text style={styles.statLabel}>Accounts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {profileState.signedMessages.length}
                </Text>
                <Text style={styles.statLabel}>Messages</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {profileState.transactionResults.length}
                </Text>
                <Text style={styles.statLabel}>Transactions</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
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
            </View>
          </View>

          {/* Multi-Chain Wallet Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => profileState.toggleSection('wallet')}
            >
              <View style={styles.sectionTitleContainer}>
                <View style={styles.sectionIconContainer}>
                  <Text style={styles.sectionIcon}>💰</Text>
                </View>
                <Text style={styles.sectionTitleText}>Multi-Chain Wallets</Text>
              </View>
              <Text style={styles.expandIcon}>
                {profileState.expandedSection === 'wallet' ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {profileState.expandedSection === 'wallet' && (
              <View style={styles.sectionContent}>
                {/* Ethereum Wallet */}
                <View style={styles.walletSection}>
                  <View style={styles.walletSectionHeader}>
                    <View style={styles.walletTitleContainer}>
                      <WalletLogo
                        type="ethereum"
                        size={24}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.walletSectionTitle}>
                        Ethereum Wallet
                      </Text>
                    </View>
                    {activeWalletType === 'ethereum' && (
                      <View style={styles.activeWalletBadge}>
                        <Text style={styles.activeWalletBadgeText}>Active</Text>
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
                <View style={styles.walletSection}>
                  <View style={styles.walletSectionHeader}>
                    <View style={styles.walletTitleContainer}>
                      <WalletLogo
                        type="solana"
                        size={24}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.walletSectionTitle}>
                        Solana Wallet
                      </Text>
                    </View>
                    {activeWalletType === 'solana' && (
                      <View style={styles.activeWalletBadge}>
                        <Text style={styles.activeWalletBadgeText}>Active</Text>
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
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => profileState.toggleSection('security')}
            >
              <View style={styles.sectionTitleContainer}>
                <View style={styles.sectionIconContainer}>
                  <Text style={styles.sectionIcon}>🔐</Text>
                </View>
                <Text style={styles.sectionTitleText}>Security & Access</Text>
              </View>
              <Text style={styles.expandIcon}>
                {profileState.expandedSection === 'security' ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {profileState.expandedSection === 'security' && (
              <View style={styles.sectionContent}>
                <TouchableOpacity
                  style={styles.securityOption}
                  onPress={() =>
                    linkWithPasskey({
                      relyingParty:
                        Constants.expoConfig?.extra?.passkeyAssociatedDomain,
                    })
                  }
                >
                  <View style={styles.securityIconContainer}>
                    <Text style={styles.securityOptionIcon}>🔑</Text>
                  </View>
                  <View style={styles.securityInfo}>
                    <Text style={styles.securityTitle}>Passkey Security</Text>
                    <Text style={styles.securityDesc}>
                      Enhanced biometric authentication
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.linkButton}>
                    <Text style={styles.linkButtonText}>Link</Text>
                  </TouchableOpacity>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.securityOption}
                  onPress={() => profileState.openModal('messages')}
                >
                  <View style={styles.securityIconContainer}>
                    <Text style={styles.securityOptionIcon}>✍️</Text>
                  </View>
                  <View style={styles.securityInfo}>
                    <Text style={styles.securityTitle}>Signed Messages</Text>
                    <Text style={styles.securityDesc}>
                      View your message signatures
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.securityOption}
                  onPress={() => profileState.openModal('transactions')}
                >
                  <View style={styles.securityIconContainer}>
                    <Text style={styles.securityOptionIcon}>📊</Text>
                  </View>
                  <View style={styles.securityInfo}>
                    <Text style={styles.securityTitle}>
                      Transaction History
                    </Text>
                    <Text style={styles.securityDesc}>
                      View your test transactions
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Connected Accounts */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => profileState.toggleSection('accounts')}
            >
              <View style={styles.sectionTitleContainer}>
                <View style={styles.sectionIconContainer}>
                  <Text style={styles.sectionIcon}>🌐</Text>
                </View>
                <Text style={styles.sectionTitleText}>Connected Accounts</Text>
                <View style={styles.accountsBadge}>
                  <Text style={styles.accountsBadgeText}>
                    {user.linked_accounts.length}
                  </Text>
                </View>
              </View>
              <Text style={styles.expandIcon}>
                {profileState.expandedSection === 'accounts' ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {profileState.expandedSection === 'accounts' && (
              <View style={styles.sectionContent}>
                {user.linked_accounts.slice(0, 3).map((accountItem, index) => (
                  <View key={index} style={styles.accountPreview}>
                    <View style={styles.accountIconContainer}>
                      {getProviderIcon(accountItem.type, 18)}
                    </View>
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountType}>
                        {accountItem.type
                          .replace('_oauth', '')
                          .replace('_', ' ')}
                      </Text>
                      <Text style={styles.accountId}>
                        {toMainIdentifier(accountItem)}
                      </Text>
                    </View>
                    <View style={styles.accountStatus}>
                      <Text style={styles.accountStatusText}>✓</Text>
                    </View>
                  </View>
                ))}

                {user.linked_accounts.length > 3 && (
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => profileState.openModal('accounts')}
                  >
                    <Text style={styles.viewAllText}>
                      View All ({user.linked_accounts.length})
                    </Text>
                  </TouchableOpacity>
                )}

                <View style={styles.linkNewSection}>
                  <Text style={styles.linkNewTitle}>Link New Account</Text>
                  <View style={styles.providerGrid}>
                    {['google', 'github', 'discord', 'apple'].map(provider => (
                      <TouchableOpacity
                        key={provider}
                        style={styles.providerButton}
                        onPress={() => oauth.link({ provider } as any)}
                        disabled={oauth.state.status === 'loading'}
                      >
                        {getProviderIcon(provider, 16)}
                        <Text style={styles.providerName}>
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
          <TouchableOpacity style={styles.signOutButton} onPress={logout}>
            <View style={styles.signOutContent}>
              <Text style={styles.signOutIcon}>🚪</Text>
              <Text style={styles.signOutText}>Sign Out</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>

      {/* All Modals */}
      {/* Network Switch Modal */}
      <BaseModal
        visible={profileState.activeModal === 'network'}
        onClose={profileState.closeModal}
        title="Switch Network"
      >
        <Text style={styles.modalDescription}>
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
              style={[
                styles.networkOption,
                isActive && styles.activeNetworkOption,
              ]}
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
              <View style={styles.networkOptionContent}>
                <View
                  style={[
                    styles.networkIconContainer,
                    { backgroundColor: network.color + '20' },
                  ]}
                >
                  <Text style={styles.networkOptionIcon}>{network.icon}</Text>
                </View>
                <View style={styles.networkOptionInfo}>
                  <Text style={styles.networkOptionTitle}>{network.name}</Text>
                  <Text style={styles.networkOptionDesc}>
                    Chain ID: {network.chainId} • {network.symbol}
                  </Text>
                  <Text style={styles.networkOptionUrl}>
                    {network.blockExplorer}
                  </Text>
                </View>
                {isActive && <Text style={styles.networkOptionCheck}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}

        {isSwitchingNetwork && (
          <View style={styles.switchingIndicator}>
            <ActivityIndicator color="#667eea" size="large" />
            <Text style={styles.switchingText}>Switching network...</Text>
          </View>
        )}
      </BaseModal>

      {/* Wallet Switch Modal */}
      <BaseModal
        visible={profileState.activeModal === 'walletSwitch'}
        onClose={profileState.closeModal}
        title="Switch Wallet"
      >
        <Text style={styles.modalDescription}>
          Choose which wallet to use as your primary wallet
        </Text>

        {/* Ethereum Wallet Option */}
        {ethereumWallet?.address && (
          <TouchableOpacity
            style={[
              styles.walletOption,
              activeWalletType === 'ethereum' && styles.activeWalletOption,
            ]}
            onPress={() => {
              switchWalletType('ethereum');
              profileState.closeModal();
            }}
          >
            <View style={styles.walletOptionContent}>
              <WalletLogo
                type="ethereum"
                size={32}
                style={{ marginRight: 12 }}
              />
              <View style={styles.walletOptionInfo}>
                <Text style={styles.walletOptionTitle}>Ethereum Wallet</Text>
                <Text style={styles.walletOptionAddress}>
                  {formatAddress(ethereumWallet.address)}
                </Text>
                <Text style={styles.walletOptionNetwork}>Ethereum Mainnet</Text>
              </View>
              {activeWalletType === 'ethereum' && (
                <Text style={styles.walletOptionCheck}>✓</Text>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* Solana Wallet Option */}
        {hasSolanaWallet && solanaWallet && (
          <TouchableOpacity
            style={[
              styles.walletOption,
              activeWalletType === 'solana' && styles.activeWalletOption,
            ]}
            onPress={() => {
              switchWalletType('solana');
              profileState.closeModal();
            }}
          >
            <View style={styles.walletOptionContent}>
              <WalletLogo type="solana" size={32} style={{ marginRight: 12 }} />
              <View style={styles.walletOptionInfo}>
                <Text style={styles.walletOptionTitle}>Solana Wallet</Text>
                <Text style={styles.walletOptionAddress}>
                  {formatAddress(solanaWallet.address)}
                </Text>
                <Text style={styles.walletOptionNetwork}>mainnet-beta</Text>
              </View>
              {activeWalletType === 'solana' && (
                <Text style={styles.walletOptionCheck}>✓</Text>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* Create New Wallet Section */}
        <View style={styles.createWalletSection}>
          <Text style={styles.createWalletTitle}>Create New Wallet</Text>

          {!ethereumWallet?.address && (
            <TouchableOpacity
              style={styles.createWalletButton}
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
              <Text style={styles.createWalletText}>
                Create Ethereum Wallet
              </Text>
            </TouchableOpacity>
          )}

          {!hasSolanaWallet && (
            <TouchableOpacity
              style={styles.createWalletButton}
              onPress={async () => {
                profileState.closeModal();
                await createSolanaWallet();
              }}
              disabled={isCreatingSolanaWallet}
            >
              <WalletLogo type="solana" size={24} style={{ marginRight: 12 }} />
              <Text style={styles.createWalletText}>
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
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📝</Text>
            <Text style={styles.emptyStateTitle}>No Messages Signed</Text>
            <Text style={styles.emptyStateDesc}>
              Sign your first message to see it here
            </Text>
          </View>
        ) : (
          profileState.signedMessages.map((message, index) => (
            <View key={index} style={styles.messageItem}>
              <Text style={styles.messageIndex}>#{index + 1}</Text>
              <Text style={styles.messageContent}>{message}</Text>
              <Text style={styles.messageTime}>
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
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📊</Text>
            <Text style={styles.emptyStateTitle}>No Transactions</Text>
            <Text style={styles.emptyStateDesc}>
              Send your first test transaction to see it here
            </Text>
          </View>
        ) : (
          profileState.transactionResults.map((transaction, index) => (
            <View key={index} style={styles.messageItem}>
              <Text style={styles.messageIndex}>#{index + 1}</Text>
              <Text style={styles.messageContent}>{transaction}</Text>
              <Text style={styles.messageTime}>
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
          <View key={index} style={styles.accountPreview}>
            <View style={styles.accountIconContainer}>
              {getProviderIcon(accountItem.type, 18)}
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountType}>
                {accountItem.type.replace('_oauth', '').replace('_', ' ')}
              </Text>
              <Text style={styles.accountId}>
                {toMainIdentifier(accountItem)}
              </Text>
            </View>
            <View style={styles.accountStatus}>
              <Text style={styles.accountStatusText}>✓</Text>
            </View>
          </View>
        ))}
      </BaseModal>
    </View>
  );
}
