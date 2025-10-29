import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Share } from 'react-native';
import QRCode from 'react-native-qrcode-styled';
import { BaseModal } from '@/components/common/BaseModal';
import * as Clipboard from 'expo-clipboard';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { useTranslation } from 'react-i18next';

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
      Alert.alert('Error', 'No wallet address available');
      return;
    }

    try {
      await Clipboard.setStringAsync(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_error) {
      Alert.alert('Error', 'Failed to copy address');
    }
  };

  const handleShareAddress = async () => {
    if (!walletAddress) {
      Alert.alert('Error', 'No wallet address available');
      return;
    }

    try {
      await Share.share({
        message: `My wallet address: ${walletAddress}`,
        title: 'Wallet Address',
      });
    } catch (_error) {
      Alert.alert('Error', 'Failed to share address');
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
      <View className="items-center px-4" style={{ zIndex: 1000 }}>
        {/* QR Code Section */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <QRCode
            data={walletAddress}
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
            }}
            pieceSize={8}
            pieceBorderRadius={2}
            isPiecesGlued={false}
            color="#1e293b"
            outerEyesOptions={{
              borderRadius: 12,
              color: '#1e293b',
            }}
            innerEyesOptions={{
              borderRadius: 6,
              color: '#1e293b',
            }}
            logo={{
              href: require('@/assets/logos/bolarity.png'),
              padding: 4,
              hidePieces: false,
            }}
          />
        </View>

        {/* Address Display */}
        <View className="w-full mb-6">
          <Text className="text-sm text-gray-600 mb-2 text-center">
            {t('modals.yourWalletAddress')}
          </Text>
          <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <Text className="text-center text-gray-800 font-mono text-sm">
              {formatAddress(walletAddress)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="w-full space-y-3">
          <TouchableOpacity
            onPress={handleCopyAddress}
            className={`w-full py-4 rounded-xl ${
              copied
                ? 'bg-green-100 border-green-300'
                : 'bg-blue-50 border-blue-200'
            } border-2`}
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-lg mr-2">{copied ? '✅' : '📋'}</Text>
              <Text
                className={`text-base font-semibold ${
                  copied ? 'text-green-700' : 'text-blue-700'
                }`}
              >
                {copied ? t('modals.copied') : t('modals.copyAddress')}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShareAddress}
            className="w-full py-4 rounded-xl bg-gray-50 border-2 border-gray-200"
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-lg mr-2">📤</Text>
              <Text className="text-base font-semibold text-gray-700">
                {t('modals.shareAddress')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <Text className="text-sm text-blue-800 text-center leading-5">
            {t('modals.shareQRCode')}
          </Text>
        </View>
      </View>
    </BaseModal>
  );
};

export const ReceiveModal = NiceModal.create(ReceiveModalComponent);
