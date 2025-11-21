import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Share } from 'react-native';
import QRCode from 'react-native-qrcode-styled';
import { BaseModal } from '@/components/common/BaseModal';
import * as Clipboard from 'expo-clipboard';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { useTranslation } from 'react-i18next';
import { TakoToast } from '@/components/common/TakoToast';
import { ShadowCard } from '@/components/common/ShadowCard';
import bolarityLogo from '@/assets/logos/bolarity_round.png';
import IconShare from '@/assets/icon/common/share.svg';
import IconCopy from '@/assets/icon/common/copy.svg';
import IconInfo from '@/assets/icon/common/info.svg';

interface ReceiveModalProps {}

const ReceiveModalComponent: React.FC<ReceiveModalProps> = () => {
  const { t } = useTranslation();
  const modal = useModal();
  const onClose = () => modal.hide();
  const { activeWallet } = useMultiChainWallet();
  const [copied, setCopied] = useState(false);

  const walletAddress = activeWallet?.address || '';

  if (!walletAddress) {
    return (
      <BaseModal visible={modal.visible} onClose={onClose}>
        <View
          style={{
            alignItems: 'center',
            padding: 20,
          }}
        >
          <Text style={{ marginBottom: 20, textAlign: 'center' }}>
            This is a test modal to check if it displays correctly.
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: '#007AFF',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </BaseModal>
    );
  }

  const handleCopyAddress = async () => {
    if (!walletAddress) {
      TakoToast.show({
        type: 'normal',
        status: 'error',
        message: 'No wallet address available',
      });
      return;
    }

    try {
      await Clipboard.setStringAsync(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_error) {
      TakoToast.show({
        type: 'normal',
        status: 'error',
        message: 'Failed to copy address',
      });
    }
  };

  const handleShareAddress = async () => {
    if (!walletAddress) {
      TakoToast.show({
        type: 'normal',
        status: 'error',
        message: 'No wallet address available',
      });
      return;
    }

    try {
      await Share.share({
        message: `My wallet address: ${walletAddress}`,
        title: 'Wallet Address',
      });
    } catch (_error) {
      TakoToast.show({
        type: 'normal',
        status: 'error',
        message: 'Failed to share address',
      });
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <BaseModal
      visible={modal.visible}
      onClose={onClose}
      title={t('modals.receive')}
    >
      {/* <View className="px-5 bg-[#F9FAFC]" style={{ zIndex: 1000 }}> */}
      {/* QR Code Section */}
      <ShadowCard
        borderRadius={16}
        bordered={false}
        className="items-center justify-center mt-8 mx-[60px] p-[25px]"
      >
        <QRCode
          data={walletAddress}
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            width: 260,
            height: 260,
          }}
          pieceSize={8}
          pieceBorderRadius={0}
          isPiecesGlued={false}
          color="#000000"
          logo={{
            href: bolarityLogo,
          }}
        />
      </ShadowCard>

      {/* Your wallet address divider */}
      <View className="flex-row items-center justify-center mt-8">
        <View className="w-[100px] h-[1px] bg-[#EBEBEB] mr-[12px]" />
        <Text className="text-[14px] text-[#ACB3BE]">
          {t('modals.yourWalletAddress')}
        </Text>
        <View className="w-[100px] h-[1px] bg-[#EBEBEB] ml-[12px]" />
      </View>

      {/* Address Display */}
      <View
        className="mt-8 py-5"
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          borderStyle: 'dashed',
          borderWidth: 1,
          borderColor: '#DADADA',
          marginHorizontal: 20,
        }}
      >
        <Text className="text-center text-black text-sm">
          {formatAddress(walletAddress)}
        </Text>
      </View>

      {/* Action Buttons */}
      <ShadowCard
        borderRadius={20}
        bordered={true}
        style={{
          borderColor: '#000000',
          borderWidth: 1,
          marginHorizontal: 20,
          marginTop: 15,
        }}
      >
        <TouchableOpacity
          onPress={handleCopyAddress}
          className="flex-row items-center justify-center"
          style={{ height: 60, paddingHorizontal: 20 }}
          activeOpacity={0.7}
        >
          <View className="w-[22px] h-[22px] items-center justify-center mr-3">
            <IconCopy />
          </View>
          <Text className="text-[14px] font-[600] text-black">
            {copied ? t('modals.copied') : t('modals.copyAddress')}
          </Text>
        </TouchableOpacity>
      </ShadowCard>

      <TouchableOpacity
        onPress={handleShareAddress}
        className="flex-row items-center justify-center "
        style={{
          paddingVertical: 20,
          paddingHorizontal: 20,
          borderColor: '#DADADA',
          borderWidth: 1,
          marginHorizontal: 20,
          marginTop: 15,
          borderStyle: 'dashed',
          borderRadius: 20,
        }}
        activeOpacity={0.7}
      >
        <View className="w-[22px] h-[22px] items-center justify-center mr-3">
          <IconShare />
        </View>
        <Text className="text-[14px]  text-black">
          {t('modals.shareAddress')}
        </Text>
      </TouchableOpacity>

      {/* Instructions */}
      <View className="flex-row items-center justify-center px-5 py-4 border border-[#F8F8F8] rounded-[16px] mx-5 mt-[25px] bg-white">
        <IconInfo />
        <Text className="ml-[10px] text-[12px] text-[#50555C] flex-1 text-center">
          {t('modals.shareQRCode')}
        </Text>
      </View>
    </BaseModal>
  );
};

export const ReceiveModal = NiceModal.create(ReceiveModalComponent);
