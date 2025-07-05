// components/RedesignedProfileScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  usePrivy,
  useEmbeddedEthereumWallet,
  getUserEmbeddedEthereumWallet,
  useLinkWithOAuth,
} from "@privy-io/expo";
import Constants from "expo-constants";
import { useLinkWithPasskey } from "@privy-io/expo/passkey";

const { width } = Dimensions.get('window');

const toMainIdentifier = (account: any) => {
  if (account.type === "phone") {
    return account.phoneNumber;
  }
  if (account.type === "email" || account.type === "wallet") {
    return account.address;
  }
  if (account.type === "twitter_oauth" || account.type === "tiktok_oauth") {
    return account.username;
  }
  if (account.type === "custom_auth") {
    return account.custom_user_id;
  }
  return account.type;
};

const getProviderIcon = (type: string) => {
  const icons: { [key: string]: string } = {
    email: "📧",
    phone: "📱",
    wallet: "💼",
    twitter_oauth: "🐦",
    tiktok_oauth: "🎵",
    google: "🔍",
    github: "⚡",
    discord: "🎮",
    apple: "🍎",
    custom_auth: "🔐",
  };
  return icons[type] || "🔗";
};

const RedesignedProfileScreen: React.FC = () => {
  const [chainId, setChainId] = useState("1");
  const [solanaNetwork, setSolanaNetwork] = useState("mainnet-beta");
  const [signedMessages, setSignedMessages] = useState<string[]>([]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSolanaModal, setShowSolanaModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const { logout, user } = usePrivy();
  const { linkWithPasskey } = useLinkWithPasskey();
  const oauth = useLinkWithOAuth();
  const { wallets, create } = useEmbeddedEthereumWallet();
  const account = getUserEmbeddedEthereumWallet(user);

  const signMessage = useCallback(
    async (provider: any) => {
      setIsLoading(true);
      try {
        const message = await provider.request({
          method: "personal_sign",
          params: [`0x${Date.now()}`, account?.address],
        });
        if (message) {
          setSignedMessages((prev) => prev.concat(message));
          Alert.alert("Success", "Message signed successfully!");
        }
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Failed to sign message");
      } finally {
        setIsLoading(false);
      }
    },
    [account?.address]
  );

  const switchChain = useCallback(
    async (provider: any, id: string) => {
      setIsLoading(true);
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: id }],
        });
        Alert.alert("Success", `Chain switched to ${id} successfully`);
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Failed to switch chain");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const switchSolanaNetwork = useCallback(
    async (network: string) => {
      setIsLoading(true);
      try {
        // 模拟Solana网络切换
        setSolanaNetwork(network);
        Alert.alert("Success", `Solana network switched to ${network}`);
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Failed to switch Solana network");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity style={styles.settingsIconButton} onPress={() => setShowSettingsModal(true)}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

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
                  {user.email?.address ? user.email.address.charAt(0).toUpperCase() : '👤'}
                </Text>
              </LinearGradient>
              <View style={styles.statusIndicator}>
                <View style={styles.statusDot} />
              </View>
            </View>
            
            <Text style={styles.profileName}>
              {user.email?.address || 'Bolarity User'}
            </Text>
            <Text style={styles.profileId}>
              ID: {formatAddress(user.id)}
            </Text>
            
            <View style={styles.profileStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user.linked_accounts.length}</Text>
                <Text style={styles.statLabel}>Accounts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{signedMessages.length}</Text>
                <Text style={styles.statLabel}>Messages</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{wallets.length}</Text>
                <Text style={styles.statLabel}>Wallets</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => setShowWalletModal(true)}
              >
                <View style={[styles.quickActionIconContainer, { backgroundColor: '#f0f9ff' }]}>
                  <Text style={styles.quickActionIcon}>💼</Text>
                </View>
                <Text style={styles.quickActionText}>Wallet</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => setShowAccountsModal(true)}
              >
                <View style={[styles.quickActionIconContainer, { backgroundColor: '#fef3c7' }]}>
                  <Text style={styles.quickActionIcon}>🔗</Text>
                </View>
                <Text style={styles.quickActionText}>Accounts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => setShowMessagesModal(true)}
              >
                <View style={[styles.quickActionIconContainer, { backgroundColor: '#f3e8ff' }]}>
                  <Text style={styles.quickActionIcon}>✍️</Text>
                </View>
                <Text style={styles.quickActionText}>Messages</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => setShowSolanaModal(true)}
              >
                <View style={[styles.quickActionIconContainer, { backgroundColor: '#ecfdf5' }]}>
                  <Text style={styles.quickActionIcon}>🌞</Text>
                </View>
                <Text style={styles.quickActionText}>Solana</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Wallet Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('wallet')}
            >
              <View style={styles.sectionTitleContainer}>
                <View style={styles.sectionIconContainer}>
                  <Text style={styles.sectionIcon}>💰</Text>
                </View>
                <Text style={styles.sectionTitleText}>Embedded Wallet</Text>
              </View>
              <Text style={styles.expandIcon}>
                {expandedSection === 'wallet' ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {expandedSection === 'wallet' && (
              <View style={styles.sectionContent}>
                {account?.address ? (
                  <View style={styles.walletInfo}>
                    <View style={styles.walletCard}>
                      <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.walletCardGradient}
                      >
                        <View style={styles.walletStatusContainer}>
                          <View style={styles.walletStatusDot} />
                          <Text style={styles.walletStatus}>Active</Text>
                        </View>
                        <Text style={styles.walletAddress}>
                          {formatAddress(account.address)}
                        </Text>
                        <TouchableOpacity
                          style={styles.walletManageButton}
                          onPress={() => setShowWalletModal(true)}
                        >
                          <Text style={styles.walletManageText}>Manage Wallet</Text>
                        </TouchableOpacity>
                      </LinearGradient>
                    </View>
                  </View>
                ) : (
                  <View style={styles.walletCreate}>
                    <View style={styles.emptyWalletIcon}>
                      <Text style={styles.emptyWalletIconText}>💼</Text>
                    </View>
                    <Text style={styles.walletCreateTitle}>No Wallet Found</Text>
                    <Text style={styles.walletCreateDesc}>
                      Create an embedded wallet to start using DeFi features
                    </Text>
                    <TouchableOpacity
                      style={styles.createButton}
                      onPress={() => create()}
                    >
                      <Text style={styles.createButtonText}>Create Wallet</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Security Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('security')}
            >
              <View style={styles.sectionTitleContainer}>
                <View style={styles.sectionIconContainer}>
                  <Text style={styles.sectionIcon}>🔐</Text>
                </View>
                <Text style={styles.sectionTitleText}>Security & Access</Text>
              </View>
              <Text style={styles.expandIcon}>
                {expandedSection === 'security' ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {expandedSection === 'security' && (
              <View style={styles.sectionContent}>
                <TouchableOpacity
                  style={styles.securityOption}
                  onPress={() =>
                    linkWithPasskey({
                      relyingParty: Constants.expoConfig?.extra?.passkeyAssociatedDomain,
                    })
                  }
                >
                  <View style={styles.securityIconContainer}>
                    <Text style={styles.securityOptionIcon}>🔑</Text>
                  </View>
                  <View style={styles.securityInfo}>
                    <Text style={styles.securityTitle}>Passkey Security</Text>
                    <Text style={styles.securityDesc}>Enhanced biometric authentication</Text>
                  </View>
                  <TouchableOpacity style={styles.linkButton}>
                    <Text style={styles.linkButtonText}>Link</Text>
                  </TouchableOpacity>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.securityOption}
                  onPress={() => setShowMessagesModal(true)}
                >
                  <View style={styles.securityIconContainer}>
                    <Text style={styles.securityOptionIcon}>✍️</Text>
                  </View>
                  <View style={styles.securityInfo}>
                    <Text style={styles.securityTitle}>Signed Messages</Text>
                    <Text style={styles.securityDesc}>View your transaction signatures</Text>
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
              onPress={() => toggleSection('accounts')}
            >
              <View style={styles.sectionTitleContainer}>
                <View style={styles.sectionIconContainer}>
                  <Text style={styles.sectionIcon}>🌐</Text>
                </View>
                <Text style={styles.sectionTitleText}>Connected Accounts</Text>
                <View style={styles.accountsBadge}>
                  <Text style={styles.accountsBadgeText}>{user.linked_accounts.length}</Text>
                </View>
              </View>
              <Text style={styles.expandIcon}>
                {expandedSection === 'accounts' ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {expandedSection === 'accounts' && (
              <View style={styles.sectionContent}>
                {user.linked_accounts.slice(0, 3).map((accountItem, index) => (
                  <View key={index} style={styles.accountPreview}>
                    <View style={styles.accountIconContainer}>
                      <Text style={styles.accountIcon}>
                        {getProviderIcon(accountItem.type)}
                      </Text>
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
                
                {user.linked_accounts.length > 3 && (
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => setShowAccountsModal(true)}
                  >
                    <Text style={styles.viewAllText}>
                      View All ({user.linked_accounts.length})
                    </Text>
                  </TouchableOpacity>
                )}

                <View style={styles.linkNewSection}>
                  <Text style={styles.linkNewTitle}>Link New Account</Text>
                  <View style={styles.providerGrid}>
                    {["google", "github", "discord", "apple"].map((provider) => (
                      <TouchableOpacity
                        key={provider}
                        style={styles.providerButton}
                        onPress={() => oauth.link({ provider } as any)}
                        disabled={oauth.state.status === "loading"}
                      >
                        <Text style={styles.providerIcon}>
                          {getProviderIcon(provider)}
                        </Text>
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

      {/* Wallet Management Modal */}
      <Modal
        visible={showWalletModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWalletModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Wallet Management</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowWalletModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Chain Switch Section */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>🔄 Switch Chain</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={chainId}
                  onChangeText={setChainId}
                  placeholder="Enter Chain ID (e.g., 1, 137, 56)"
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={async () => {
                    if (wallets.length > 0) {
                      await switchChain(await wallets[0].getProvider(), chainId);
                    }
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.actionButtonText}>Switch</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Message Section */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>✍️ Sign Message</Text>
              <TouchableOpacity
                style={[styles.actionButton, styles.fullWidthButton]}
                onPress={async () => {
                  if (wallets.length > 0) {
                    await signMessage(await wallets[0].getProvider());
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.actionButtonText}>Sign Test Message</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Solana Network Modal */}
      <Modal
        visible={showSolanaModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSolanaModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Solana Network</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSolanaModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>🌞 Current Network</Text>
              <View style={styles.networkCard}>
                <Text style={styles.currentNetwork}>{solanaNetwork}</Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Available Networks</Text>
              {['mainnet-beta', 'testnet', 'devnet'].map((network) => (
                <TouchableOpacity
                  key={network}
                  style={[
                    styles.networkOption,
                    solanaNetwork === network && styles.activeNetworkOption
                  ]}
                  onPress={() => switchSolanaNetwork(network)}
                  disabled={isLoading}
                >
                  <View style={styles.networkInfo}>
                    <Text style={styles.networkName}>{network}</Text>
                    <Text style={styles.networkDesc}>
                      {network === 'mainnet-beta' ? 'Production network' :
                       network === 'testnet' ? 'Testing network' : 'Development network'}
                    </Text>
                  </View>
                  {solanaNetwork === network && (
                    <Text style={styles.networkCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Accounts Modal */}
      <Modal
        visible={showAccountsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAccountsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Connected Accounts</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAccountsModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {user.linked_accounts.map((accountItem, index) => (
              <View key={index} style={styles.fullAccountItem}>
                <View style={styles.fullAccountIcon}>
                  <Text style={styles.fullAccountIconText}>
                    {getProviderIcon(accountItem.type)}
                  </Text>
                </View>
                <View style={styles.fullAccountInfo}>
                  <Text style={styles.fullAccountType}>
                    {accountItem.type.replace('_oauth', '').replace('_', ' ')}
                  </Text>
                  <Text style={styles.fullAccountId}>
                    {toMainIdentifier(accountItem)}
                  </Text>
                </View>
                <View style={styles.fullAccountBadge}>
                  <Text style={styles.fullAccountBadgeText}>✓</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Messages Modal */}
      <Modal
        visible={showMessagesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMessagesModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Signed Messages</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowMessagesModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {signedMessages.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📝</Text>
                <Text style={styles.emptyStateTitle}>No Messages Yet</Text>
                <Text style={styles.emptyStateText}>
                  Signed messages will appear here
                </Text>
              </View>
            ) : (
              signedMessages.map((message, index) => (
                <View key={index} style={styles.messageItem}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.messageIndex}>#{index + 1}</Text>
                    <Text style={styles.messageTime}>Just now</Text>
                  </View>
                  <Text style={styles.messageContent}>{message}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Settings</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSettingsModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {[
              { icon: '🔔', title: 'Notifications', desc: 'Manage push notifications' },
              { icon: '🔒', title: 'Privacy', desc: 'Control your privacy settings' },
              { icon: '🌐', title: 'Language', desc: 'Change app language' },
              { icon: '❓', title: 'Help & Support', desc: 'Get help and support' },
              { icon: '📋', title: 'Terms & Privacy', desc: 'Legal information' },
            ].map((setting, index) => (
              <TouchableOpacity key={index} style={styles.settingItem}>
                <View style={styles.settingIconContainer}>
                  <Text style={styles.settingIcon}>{setting.icon}</Text>
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                  <Text style={styles.settingDesc}>{setting.desc}</Text>
                </View>
                <Text style={styles.settingArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  settingsIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 18,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  profileId: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'monospace',
    marginBottom: 20,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionIcon: {
    fontSize: 24,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  section: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  accountsBadge: {
    backgroundColor: '#667eea',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  accountsBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  expandIcon: {
    fontSize: 14,
    color: '#94a3b8',
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  walletInfo: {
    marginTop: -10,
  },
  walletCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  walletCardGradient: {
    padding: 20,
    alignItems: 'center',
  },
  walletStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  walletStatus: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  walletAddress: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  walletManageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  walletManageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  walletCreate: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyWalletIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyWalletIconText: {
    fontSize: 28,
  },
  walletCreateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  walletCreateDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  securityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  securityOptionIcon: {
    fontSize: 18,
  },
  securityInfo: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  securityDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  linkButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  linkButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  viewButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  accountPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  accountIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountIcon: {
    fontSize: 18,
  },
  accountInfo: {
    flex: 1,
  },
  accountType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textTransform: 'capitalize',
  },
  accountId: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  accountStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountStatusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  viewAllButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  linkNewSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  linkNewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  providerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  providerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  providerIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  providerName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  signOutButton: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fee2e2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  signOutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  signOutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  bottomPadding: {
    height: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#64748b',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#f8fafc',
    color: '#1e293b',
  },
  actionButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidthButton: {
    width: '100%',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  // Solana specific styles
  networkCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  currentNetwork: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    textTransform: 'capitalize',
  },
  networkOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeNetworkOption: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  networkInfo: {
    flex: 1,
  },
  networkName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    textTransform: 'capitalize',
  },
  networkDesc: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  networkCheck: {
    fontSize: 18,
    color: '#10b981',
    fontWeight: 'bold',
  },
  fullAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  fullAccountIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fullAccountIconText: {
    fontSize: 20,
  },
  fullAccountInfo: {
    flex: 1,
  },
  fullAccountType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    textTransform: 'capitalize',
  },
  fullAccountId: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  fullAccountBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullAccountBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  messageItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageIndex: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#667eea',
  },
  messageTime: {
    fontSize: 12,
    color: '#64748b',
  },
  messageContent: {
    fontSize: 12,
    color: '#475569',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingIcon: {
    fontSize: 18,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  settingDesc: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  settingArrow: {
    fontSize: 20,
    color: '#cbd5e1',
  },
});

export default RedesignedProfileScreen;

