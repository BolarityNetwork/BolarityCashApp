import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePrivy } from "@privy-io/expo";
import { useMultiChainWallet } from '../../hooks/useMultiChainWallet';
import { useProfileState } from './hooks/useProfileState';
import { useWalletActions } from './hooks/useWalletActions';
import { WalletLogo } from './components/WalletLogo';
import { ProfileHeader } from './components/ProfileHeader';
import { formatAddress } from './utils';
import { styles } from './styles';

export default function RedesignedProfileScreen() {
  const { logout, user } = usePrivy();
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
    create,
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
      sign: () => walletActions.handleSignMessage(profileState.addSignedMessage),
      sendTx: () => walletActions.handleSendTransaction(profileState.addTransaction),
      signTx: () => walletActions.handleSignTransaction(profileState.addTransaction),
    };

    actions[actionType]().finally(() => {
      profileState.setLoading(false);
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ProfileHeader onSettingsPress={() => profileState.openModal('settings')} />
        
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
                  {activeWallet.type === 'ethereum' ? 'Ethereum Wallet' : 'Solana Wallet'}
                </Text>
                <Text style={styles.currentWalletAddress}>
                  {activeWallet.address ? formatAddress(activeWallet.address) : 'Not connected'}
                </Text>
              </View>
              <Text style={styles.switchIcon}>🔄</Text>
            </TouchableOpacity>
            
            <View style={styles.profileStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user.linked_accounts.length}</Text>
                <Text style={styles.statLabel}>Accounts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profileState.signedMessages.length}</Text>
                <Text style={styles.statLabel}>Messages</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profileState.transactionResults.length}</Text>
                <Text style={styles.statLabel}>Transactions</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => profileState.openModal('walletSwitch')}
              >
                <View style={[styles.quickActionIconContainer, { backgroundColor: '#f0f9ff' }]}>
                  <Text style={styles.quickActionIcon}>🔄</Text>
                </View>
                <Text style={styles.quickActionText}>Switch Wallet</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => handleWalletAction('sign')}
                disabled={profileState.isLoading || !walletActions.canPerformActions}
              >
                <View style={[styles.quickActionIconContainer, { backgroundColor: '#ecfdf5' }]}>
                  <Text style={styles.quickActionIcon}>✍️</Text>
                </View>
                <Text style={styles.quickActionText}>Sign Message</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.signOutButton} onPress={logout}>
            <View style={styles.signOutContent}>
              <Text style={styles.signOutIcon}>🚪</Text>
              <Text style={styles.signOutText}>Sign Out</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}