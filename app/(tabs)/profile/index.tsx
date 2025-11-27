import React from 'react';
import { Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
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
import NetworkIcon from '@/assets/icon/profile/network.svg';
import SignOutIcon from '@/assets/icon/profile/signout.svg';
import EditIcon from '@/assets/icon/profile/edit.svg';
import NftsIcon from '@/assets/icon/profile/nfts.svg';
import SpendingIcon from '@/assets/icon/profile/spending.svg';
import FollowingIcon from '@/assets/icon/profile/following.svg';
import AddressIcon from '@/assets/icon/profile/address.svg';
import NotificationIcon from '@/assets/icon/profile/notification.svg';
import ShareIcon from '@/assets/icon/profile/share.svg';
import ContactIcon from '@/assets/icon/profile/contact.svg';
import { useTranslation } from 'react-i18next';
import { TakoToast } from '@/components/common/TakoToast';
import { ShadowCard } from '@/components/common/ShadowCard';
import CurrencyIcon from '@/assets/icon/profile/currency.svg';
import LanguageIcon from '@/assets/icon/profile/language.svg';
import AboutIcon from '@/assets/icon/profile/about.svg';
import ReportIcon from '@/assets/icon/profile/report.svg';

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
  } = useMultiChainWallet();
  const profileState = useProfileState();

  if (!persistedUser) {
    return <Redirect href="/login" />;
  }

  return (
    <CommonSafeAreaView
      className="flex-1 bg-[#F9FAFC]"
      isIncludeBottomBar={true}
    >
      <ProfileHeader />
      <ScrollView
        className="flex-1 px-5 pt-[20px]"
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        <ShadowCard borderRadius={20}>
          <AccountCard
            address={activeWallet.address || ''}
            profileState={profileState}
          />
        </ShadowCard>

        {/* Security Section */}
        <ShadowCard borderRadius={20} className="mt-4">
          <SettingSection title={t('settings.security')}>
            <SettingItem
              icon={<KeyIcon />}
              title={t('appProfile.keysAndRecovery')}
              onPress={() => router.push('/settings/keys-recovery')}
            />
            <SettingItem
              icon={<SpendingIcon />}
              title={t('appProfile.spendingLimits')}
              isLast
              onPress={() => {
                TakoToast.show({
                  type: 'normal',
                  status: 'info',
                  message: `${t('appProfile.spendingLimits')} ${t('actions.comingSoon')}`,
                });
              }}
            />
          </SettingSection>
        </ShadowCard>

        {/* Wallet Section */}
        <ShadowCard borderRadius={20} className="mt-4">
          <SettingSection title={t('appProfile.general')}>
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
            <SettingItem
              icon={<AddressIcon />}
              title={t('appProfile.addressBook')}
              onPress={() => router.push('/settings/address-book')}
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
              icon={<NetworkIcon />}
              title={t('appProfile.network')}
              isLast
              onPress={() => {
                TakoToast.show({
                  type: 'normal',
                  status: 'info',
                  message: `${t('appProfile.network')} ${t('actions.comingSoon')}`,
                });
              }}
            />
          </SettingSection>
        </ShadowCard>

        {/* Preferences Section */}
        <ShadowCard borderRadius={20} className="mt-4">
          <SettingSection title={t('settings.preferences')}>
            <SettingItem
              icon={<CurrencyIcon />}
              title={t('settings.currency')}
              onPress={() => {
                TakoToast.show({
                  type: 'normal',
                  status: 'info',
                  message: `${t('settings.currency')} ${t('actions.comingSoon')}`,
                });
              }}
            />
            <SettingItem
              icon={<LanguageIcon />}
              title={t('settings.language')}
              isLast
              onPress={() => router.push('/settings/language')}
            />
          </SettingSection>
        </ShadowCard>

        {/* Help & Support Section */}
        <ShadowCard borderRadius={20} className="mt-4">
          <SettingSection title={t('settings.helpAndSupport')}>
            <SettingItem
              icon={<AboutIcon />}
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
              icon={<ReportIcon />}
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
              isLast
              onPress={() => Linking.openURL('https://x.com/Bolarityxyz')}
            />
          </SettingSection>
        </ShadowCard>

        {/* Sign Out Button */}
        <ShadowCard borderRadius={16} bordered={false} className="mt-6">
          <TouchableOpacity
            className="bg-black flex-row items-center justify-center py-[10px] rounded-[16px]"
            onPress={logout}
            activeOpacity={0.7}
          >
            <SignOutIcon className="text-white" />
            <Text className="ml-2 text-[12px] font-[600] leading-[19px] text-white">
              {t('appProfile.signOut')}
            </Text>
          </TouchableOpacity>
        </ShadowCard>
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
      />
    </CommonSafeAreaView>
  );
}
