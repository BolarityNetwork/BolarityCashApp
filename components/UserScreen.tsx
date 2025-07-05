import React, { useState, useCallback } from "react";
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

import {
  usePrivy,
  useEmbeddedEthereumWallet,
  getUserEmbeddedEthereumWallet,
  PrivyEmbeddedWalletProvider,
  useLinkWithOAuth,
} from "@privy-io/expo";
import Constants from "expo-constants";
import { useLinkWithPasskey } from "@privy-io/expo/passkey";
import { PrivyUser } from "@privy-io/public-api";

const { width, height } = Dimensions.get('window');

const toMainIdentifier = (x: PrivyUser["linked_accounts"][number]) => {
  if (x.type === "phone") {
    return x.phoneNumber;
  }
  if (x.type === "email" || x.type === "wallet") {
    return x.address;
  }
  if (x.type === "twitter_oauth" || x.type === "tiktok_oauth") {
    return x.username;
  }
  if (x.type === "custom_auth") {
    return x.custom_user_id;
  }
  return x.type;
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

export const UserScreen = () => {
  const [chainId, setChainId] = useState("1");
  const [signedMessages, setSignedMessages] = useState<string[]>([]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { logout, user } = usePrivy();
  const { linkWithPasskey } = useLinkWithPasskey();
  const oauth = useLinkWithOAuth();
  const { wallets, create } = useEmbeddedEthereumWallet();
  const account = getUserEmbeddedEthereumWallet(user);

  const signMessage = useCallback(
    async (provider: PrivyEmbeddedWalletProvider) => {
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
    async (provider: PrivyEmbeddedWalletProvider, id: string) => {
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

  if (!user) {
    return null;
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>⚡</Text>
            </View>
            <Text style={styles.title}>Bolarity Wallet</Text>
            <Text style={styles.subtitle}>Chain Abstraction Platform</Text>
          </View>

          {/* User Balance Card */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>User ID</Text>
              <TouchableOpacity style={styles.eyeButton}>
                <Text style={styles.eyeIcon}>👁</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceAmount}>
              {formatAddress(user.id)}
            </Text>
            <TouchableOpacity 
              style={styles.viewAccountsButton}
              onPress={() => setShowAccountsModal(true)}
            >
              <Text style={styles.viewAccountsText}>
                View Linked Accounts ({user.linked_accounts.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Wallet Card Stack */}
          <View style={styles.cardStack}>
            {/* Background Cards */}
            <View style={[styles.card, styles.cardBottom]} />
            <View style={[styles.card, styles.cardMiddle]} />
            
            {/* Main Wallet Card */}
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              style={[styles.card, styles.cardTop]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Embedded Wallet</Text>
                <Text style={styles.cardSubtitle}>
                  {account?.address ? "Active" : "Not Created"}
                </Text>
              </View>

              {account?.address ? (
                <View style={styles.walletInfo}>
                  <Text style={styles.walletAddress}>
                    {formatAddress(account.address)}
                  </Text>
                  <TouchableOpacity 
                    style={styles.walletButton}
                    onPress={() => setShowWalletModal(true)}
                  >
                    <Text style={styles.walletButtonText}>Manage Wallet</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.createWalletButton}
                  onPress={() => create()}
                >
                  <Text style={styles.createWalletText}>Create Wallet</Text>
                </TouchableOpacity>
              )}

              {/* Layered Features */}
              <View style={styles.cardFeatures}>
                <LinearGradient
                  colors={['#11998e', '#38ef7d']}
                  style={styles.featureLayer}
                >
                  <View style={styles.featureContent}>
                    <Text style={styles.featureIcon}>🔐</Text>
                    <Text style={styles.featureText}>Passkey Security</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      linkWithPasskey({
                        relyingParty: Constants.expoConfig?.extra?.passkeyAssociatedDomain,
                      })
                    }
                  >
                    <Text style={styles.featureAction}>Link</Text>
                  </TouchableOpacity>
                </LinearGradient>

                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={[styles.featureLayer, styles.featureLayerOffset]}
                >
                  <View style={styles.featureContent}>
                    <Text style={styles.featureIcon}>🔗</Text>
                    <Text style={styles.featureText}>Social Accounts</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowAccountsModal(true)}>
                    <Text style={styles.featureAction}>Manage</Text>
                  </TouchableOpacity>
                </LinearGradient>

                <LinearGradient
                  colors={['#ff9a9e', '#fecfef']}
                  style={[styles.featureLayer, styles.featureLayerOffset2]}
                >
                  <View style={styles.featureContent}>
                    <Text style={styles.featureIcon}>✍️</Text>
                    <Text style={styles.featureText}>Sign Messages</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowMessagesModal(true)}>
                    <Text style={styles.featureAction}>View</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </LinearGradient>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {["google", "github", "discord", "apple"].map((provider) => (
                <TouchableOpacity
                  key={provider}
                  style={styles.actionButton}
                  onPress={() => oauth.link({ provider } as any)}
                  disabled={oauth.state.status === "loading"}
                >
                  <Text style={styles.actionIcon}>{getProviderIcon(provider)}</Text>
                  <Text style={styles.actionText}>Link {provider}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Wallet Management Modal */}
        <Modal
          visible={showWalletModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
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
                <Text style={styles.modalSectionTitle}>Switch Chain</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={chainId}
                    onChangeText={setChainId}
                    placeholder="Enter Chain ID (e.g., 1, 137, 56)"
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity
                    style={styles.switchButton}
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
                      <Text style={styles.switchButtonText}>Switch</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign Message Section */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Sign Message</Text>
                <TouchableOpacity
                  style={styles.signButton}
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
                    <Text style={styles.signButtonText}>Sign Test Message</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* Linked Accounts Modal */}
        <Modal
          visible={showAccountsModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Linked Accounts</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAccountsModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {user.linked_accounts.map((account, index) => (
                <View key={index} style={styles.accountItem}>
                  <View style={styles.accountIcon}>
                    <Text style={styles.accountIconText}>
                      {getProviderIcon(account.type)}
                    </Text>
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountType}>{account.type}</Text>
                    <Text style={styles.accountIdentifier}>
                      {toMainIdentifier(account)}
                    </Text>
                  </View>
                  <View style={styles.accountBadge}>
                    <Text style={styles.accountBadgeText}>✓</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </Modal>

        {/* Signed Messages Modal */}
        <Modal
          visible={showMessagesModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
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
                  <Text style={styles.emptyStateText}>No messages signed yet</Text>
                </View>
              ) : (
                signedMessages.map((message, index) => (
                  <View key={index} style={styles.messageItem}>
                    <Text style={styles.messageIndex}>#{index + 1}</Text>
                    <Text style={styles.messageContent}>{message}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </Modal>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  logoText: {
    fontSize: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  eyeButton: {
    padding: 5,
  },
  eyeIcon: {
    fontSize: 16,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    fontFamily: 'monospace',
  },
  viewAccountsButton: {
    backgroundColor: '#333',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  viewAccountsText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  cardStack: {
    height: 280,
    marginBottom: 30,
    position: 'relative',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: 240,
    borderRadius: 20,
  },
  cardBottom: {
    backgroundColor: '#f0f0f0',
    top: 20,
    left: 8,
    right: 8,
    transform: [{ rotate: '2deg' }],
  },
  cardMiddle: {
    backgroundColor: '#e0e0e0',
    top: 10,
    left: 4,
    right: 4,
    transform: [{ rotate: '-1deg' }],
  },
  cardTop: {
    top: 0,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  walletInfo: {
    marginBottom: 20,
  },
  walletAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  walletButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  walletButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  createWalletButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  createWalletText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardFeatures: {
    marginTop: 10,
  },
  featureLayer: {
    borderRadius: 15,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureLayerOffset: {
    marginTop: -8,
    marginLeft: 10,
    marginRight: -10,
  },
  featureLayerOffset2: {
    marginTop: -8,
    marginLeft: 20,
    marginRight: -20,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  featureText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  featureAction: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  quickActions: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    fontSize: 14,
  },
  switchButton: {
    backgroundColor: '#667eea',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  switchButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  signButton: {
    backgroundColor: '#764ba2',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  signButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  accountIconText: {
    fontSize: 18,
  },
  accountInfo: {
    flex: 1,
  },
  accountType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  accountIdentifier: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  accountBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
  messageItem: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  messageIndex: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  messageContent: {
    fontSize: 10,
    color: '#333',
    fontFamily: 'monospace',
  },
});