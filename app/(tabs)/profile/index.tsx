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
import { useLanguage } from '@/hooks/useLanguage';
import { TakoToast } from '@/components/common/TakoToast';

export default function ProfileScreen() {
  const { user: persistedUser, logout } = usePersistedPrivyUser();
  const router = useRouter();
  const { t } = useTranslation();
  const { currentLanguageInfo } = useLanguage();
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
      <ProfileHeader />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <AccountCard
          address={activeWallet.address || ''}
          profileState={profileState}
        />

        {/* Feature Section */}
        <SettingSection title={t('appProfile.feature')}>
          <SettingItem
            icon={<EditIcon />}
            title={t('appProfile.editWallet')}
            onPress={() => {
              TakoToast.show({
                type: 'normal',
                status: 'info',
                message: `${t('appProfile.editWallet')} ${t('actions.comingSoon')}`,
              });
            }}
          />
          <SettingItem
            icon={<AddressIcon />}
            title={t('appProfile.addressBook')}
            onPress={() => router.push('/settings/address-book')}
          />
          <SettingItem
            icon={<NetworkIcon />}
            title={t('appProfile.network')}
            onPress={() => {
              TakoToast.show({
                type: 'normal',
                status: 'info',
                message: `${t('appProfile.network')} ${t('actions.comingSoon')}`,
              });
            }}
          />
          <SettingItem
            icon={<NftsIcon />}
            title={t('appProfile.nfts')}
            onPress={() => {
              TakoToast.show({
                type: 'normal',
                status: 'info',
                message: `${t('appProfile.nfts')} ${t('actions.comingSoon')}`,
              });
            }}
          />
          <SettingItem
            icon={<KeyIcon />}
            title={t('appProfile.keysAndRecovery')}
            onPress={() => {
              TakoToast.show({
                type: 'normal',
                status: 'info',
                message: `${t('appProfile.keysAndRecovery')} ${t('actions.comingSoon')}`,
              });
            }}
          />
          <SettingItem
            icon={<SpendingIcon />}
            title={t('appProfile.spendingLimits')}
            onPress={() => {
              TakoToast.show({
                type: 'normal',
                status: 'info',
                message: `${t('appProfile.spendingLimits')} ${t('actions.comingSoon')}`,
              });
            }}
          />
          <SettingItem
            icon={<PrivyIcon />}
            title={t('appProfile.privyRelative')}
            onPress={() => {
              TakoToast.show({
                type: 'normal',
                status: 'info',
                message: `${t('appProfile.privyRelative')} ${t('actions.comingSoon')}`,
              });
            }}
          />
          <SettingItem
            icon={<NotificationIcon />}
            title={t('appProfile.notifications')}
            onPress={() => {
              TakoToast.show({
                type: 'normal',
                status: 'info',
                message: `${t('appProfile.notifications')} ${t('actions.comingSoon')}`,
              });
            }}
          />
        </SettingSection>

        {/* Preference Section */}
        <SettingSection title={t('settings.preferences')}>
          <SettingItem
            icon={<SettingIcon />}
            title={t('settings.currency')}
            subtitle="USD"
            onPress={() => {
              TakoToast.show({
                type: 'normal',
                status: 'info',
                message: `${t('settings.currency')} ${t('actions.comingSoon')}`,
              });
            }}
          />
          <SettingItem
            icon={<SettingIcon />}
            title={t('settings.language')}
            subtitle={currentLanguageInfo.name}
            onPress={() => router.push('/settings/language')}
          />
          <SettingItem
            icon={<SettingIcon />}
            title={t('settings.security')}
            subtitle={t('settings.passwordAndSecurity')}
            onPress={() => {
              TakoToast.show({
                type: 'normal',
                status: 'info',
                message: `${t('settings.security')} ${t('actions.comingSoon')}`,
              });
            }}
          />
        </SettingSection>

        {/* Help & Support Section */}
        <SettingSection title={t('settings.helpAndSupport')}>
          <SettingItem
            icon={<SettingIcon />}
            title={t('settings.about')}
            onPress={() => router.push('/settings/about')}
          />
          <SettingItem
            icon={<ContactIcon />}
            title={t('appProfile.contactSupport')}
            onPress={() => {
              TakoToast.show({
                type: 'normal',
                status: 'info',
                message: `${t('appProfile.contactSupport')} ${t('actions.comingSoon')}`,
              });
            }}
          />
          <SettingItem
            icon={<ShareIcon />}
            title={t('appProfile.shareFeedback')}
            onPress={() => {
              TakoToast.show({
                type: 'normal',
                status: 'info',
                message: `${t('appProfile.shareFeedback')} ${t('actions.comingSoon')}`,
              });
            }}
          />
          <SettingItem
            icon={<SettingIcon />}
            title={t('appProfile.reportBug')}
            onPress={() => {
              TakoToast.show({
                type: 'normal',
                status: 'info',
                message: `${t('appProfile.reportBug')} ${t('actions.comingSoon')}`,
              });
            }}
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
