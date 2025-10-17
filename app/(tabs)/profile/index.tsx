import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';
import { useProfileState } from '@/hooks/profile/useProfileState';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { NetworkSwitchModal } from '@/components/modals/NetworkSwitchModal';
import { AccountCard } from '@/components/profile/AccountCard';
import { SettingItem } from '@/components/profile/SettingItem';
import { SettingSection } from '@/components/profile/SettingSection';
import { CommonSafeAreaView } from '@/components/CommonSafeAreaView';
import { usePersistedPrivyUser } from '@/hooks/usePersistedPrivyUser';
import { WalletSwitchModal } from '@/components/modals/WalletSwitchModal';
import KeyIcon from '@/assets/icon/profile/key.svg';
import SettingIcon from '@/assets/icon/profile/setting.svg';
import NetworkIcon from '@/assets/icon/profile/network.svg';
import SignOutIcon from '@/assets/icon/profile/signout.svg';
import EditIcon from '@/assets/icon/profile/edit.svg';
import NftsIcon from '@/assets/icon/profile/nfts.svg';
import SpendingIcon from '@/assets/icon/profile/spending.svg';
import FollowingIcon from '@/assets/icon/profile/following.svg';
import PrivyIcon from '@/assets/icon/profile/privy.svg';
import AddressIcon from '@/assets/icon/profile/address.svg';
import NotificationIcon from '@/assets/icon/profile/notification.svg';
import ShareIcon from '@/assets/icon/profile/share.svg';
import ContactIcon from '@/assets/icon/profile/contact.svg';

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

  return <Text style={{ fontSize: size * 0.9 }}>{icon}</Text>;
}

export default function ProfileScreen() {
  const { user: persistedUser, logout } = usePersistedPrivyUser();
  const router = useRouter();
  const {
    activeWallet,
    getAvailableNetworks,
    switchEthereumNetwork,
    activeEthereumNetwork,
    isSwitchingNetwork,
    switchWalletType,
    createSolanaWallet,
    ethereumAddress,
    solanaAddress,
    hasSolanaWallet,
    isCreatingSolanaWallet,
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
        <AccountCard
          address={activeWallet.address || ''}
          profileState={profileState}
        />

        <SettingSection title="Security">
          <SettingItem
            icon={<KeyIcon />}
            title="Keys & Recovery"
            onPress={() => router.push('/settings/keys-recovery')}
          />
          <SettingItem
            icon={<SpendingIcon />}
            title="Spending Limits"
            onPress={() => router.push('/settings/spending-limits')}
          />
          <SettingItem
            icon={<PrivyIcon />}
            title="Privy relative"
            onPress={() => router.push('/settings/privy-relative')}
          />
        </SettingSection>

        {/* General Section */}
        <SettingSection title="General">
          <SettingItem
            icon={<EditIcon />}
            title="Edit wallet"
            onPress={() => router.push('/settings/edit-wallet')}
          />
          <SettingItem
            icon={<NotificationIcon />}
            title="Notifications"
            onPress={() => router.push('/settings/notifications')}
          />
          <SettingItem
            icon={<AddressIcon />}
            title="Address book"
            onPress={() => router.push('/settings/address-book')}
          />
          <SettingItem
            icon={<SettingIcon />}
            title="Setting"
            onPress={() => router.push('/settings')}
          />
          <SettingItem
            icon={<NftsIcon />}
            title="NFTs"
            onPress={() => router.push('/settings/nfts')}
          />
          <SettingItem
            icon={<NetworkIcon />}
            title="Network"
            onPress={() => router.push('/settings/network')}
          />
        </SettingSection>

        {/* About Section */}
        <SettingSection title="About">
          <SettingItem
            icon={<ContactIcon />}
            title="Contact support"
            onPress={() => router.push('/settings/contact-support')}
          />
          <SettingItem
            icon={<ShareIcon />}
            title="Share your feedback"
            onPress={() => router.push('/settings/share-feedback')}
          />
          <SettingItem
            icon={<FollowingIcon />}
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
            <SignOutIcon />
            <Text className="ml-2 text-base font-semibold text-red-600">
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>

        <View className="h-5" />
      </ScrollView>

      {/* All Modals */}
      {/* Network Switch Modal */}
      <NetworkSwitchModal
        visible={profileState.activeModal === 'network'}
        onClose={profileState.closeModal}
        getAvailableNetworks={getAvailableNetworks}
        switchEthereumNetwork={switchEthereumNetwork}
        activeEthereumNetwork={activeEthereumNetwork}
        isSwitchingNetwork={isSwitchingNetwork}
      />

      {/* Wallet Switch Modal */}
      <WalletSwitchModal
        visible={profileState.activeModal === 'walletSwitch'}
        onClose={profileState.closeModal}
        activeWalletType={activeWallet.type || 'ethereum'}
        ethereumAddress={ethereumAddress}
        solanaAddress={solanaAddress}
        hasSolanaWallet={hasSolanaWallet}
        isCreatingSolanaWallet={isCreatingSolanaWallet}
        switchWalletType={switchWalletType}
        createSolanaWallet={createSolanaWallet}
        create={() => {}}
      />
    </CommonSafeAreaView>
  );
}
