import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
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
import { useTranslation } from 'react-i18next';

export default function ProfileScreen() {
  const { user: persistedUser, logout } = usePersistedPrivyUser();
  const router = useRouter();
  const { t } = useTranslation();
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

        <SettingSection title={t('appProfile.security')}>
          <SettingItem
            icon={<KeyIcon />}
            title={t('appProfile.keysAndRecovery')}
            onPress={() => router.push('/settings/keys-recovery')}
          />
          <SettingItem
            icon={<SpendingIcon />}
            title={t('appProfile.spendingLimits')}
            onPress={() => router.push('/settings/spending-limits')}
          />
          <SettingItem
            icon={<PrivyIcon />}
            title={t('appProfile.privyRelative')}
            onPress={() => router.push('/settings/privy-relative')}
          />
        </SettingSection>

        {/* General Section */}
        <SettingSection title={t('appProfile.general')}>
          <SettingItem
            icon={<EditIcon />}
            title={t('appProfile.editWallet')}
            onPress={() => router.push('/settings/edit-wallet')}
          />
          <SettingItem
            icon={<NotificationIcon />}
            title={t('appProfile.notifications')}
            onPress={() => router.push('/settings/notifications')}
          />
          <SettingItem
            icon={<AddressIcon />}
            title={t('appProfile.addressBook')}
            onPress={() => router.push('/settings/address-book')}
          />
          <SettingItem
            icon={<SettingIcon />}
            title={t('appProfile.setting')}
            onPress={() => router.push('/settings')}
          />
          <SettingItem
            icon={<NftsIcon />}
            title={t('appProfile.nfts')}
            onPress={() => router.push('/settings/nfts')}
          />
          <SettingItem
            icon={<NetworkIcon />}
            title={t('appProfile.network')}
            onPress={() => router.push('/settings/network')}
          />
        </SettingSection>

        {/* About Section */}
        <SettingSection title={t('appProfile.about')}>
          <SettingItem
            icon={<ContactIcon />}
            title={t('appProfile.contactSupport')}
            onPress={() => router.push('/settings/contact-support')}
          />
          <SettingItem
            icon={<ShareIcon />}
            title={t('appProfile.shareFeedback')}
            onPress={() => router.push('/settings/share-feedback')}
          />
          <SettingItem
            icon={<FollowingIcon />}
            title={t('appProfile.followBolarity')}
            onPress={() => Linking.openURL('https://x.com/Bolarityxyz')}
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
              {t('appProfile.signOut')}
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
