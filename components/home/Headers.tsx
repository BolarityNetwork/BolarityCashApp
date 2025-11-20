// components/PerfectVaultSavingsPlatform/components/Header.tsx
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import IconComponent from '@/components/home/IconComponent';
import bolarityLogo from '@/assets/images/icon.png';
import NotificationIcon from '@/assets/icon/common/notification.svg';
import { useTranslation } from 'react-i18next';
import AddressLink from '@/assets/icon/common/address-link.svg';
import { WalletSwitchModal } from '../modals/WalletSwitchModal';
interface HeaderProps {
  user: any;
  currentWalletInfo: {
    address: string | null;
    type: string;
    icon: string;
    network: string;
  };
  formatAddress: (address: string) => string;
}

const Header: React.FC<HeaderProps> = ({
  user,
  currentWalletInfo,
  formatAddress,
}) => {
  const { t } = useTranslation();
  const [showWalletSwitchModal, setShowWalletSwitchModal] = useState(false);
  return (
    <View className="px-5 mt-5 mb-[25]">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-black rounded-full items-center justify-center mr-3 overflow-hidden">
            {bolarityLogo ? (
              <Image
                source={bolarityLogo}
                className="w-12 h-12"
                resizeMode="cover"
              />
            ) : (
              <IconComponent name="Vault" size={24} color="#fff" />
            )}
          </View>
          <View>
            <Text className="text-xl font-[600] text-black">
              {t('home.appName')}
            </Text>
            <Text className="text-sm text-[#ACB3BF]">
              {t('home.appSubtitle')}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-4">
          {user && currentWalletInfo.address && (
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => {
                setShowWalletSwitchModal(true);
              }}
            >
              <AddressLink />
              <Text className="ml-[6] text-[10px] text-black">
                {formatAddress(currentWalletInfo.address)}
              </Text>
            </TouchableOpacity>
          )}
          <NotificationIcon />
        </View>
      </View>
      <WalletSwitchModal
        visible={showWalletSwitchModal}
        onClose={() => setShowWalletSwitchModal(false)}
      />
    </View>
  );
};

export default Header;
