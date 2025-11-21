import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BaseModal } from '@/components/common/BaseModal';
import { WalletLogo } from '@/components/profile/WalletLogo';
import { formatAddress } from '@/utils/profile';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';
import { useTranslation } from 'react-i18next';
import { TakoToast } from '@/components/common/TakoToast';

interface WalletSwitchModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WalletSwitchModal: React.FC<WalletSwitchModalProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useTranslation();
  const {
    activeWallet,
    switchWalletType,
    createSolanaWallet,
    ethereumAddress,
    solanaAddress,
    hasSolanaWallet,
    isCreatingSolanaWallet,
  } = useMultiChainWallet();

  const activeWalletType = activeWallet.type || 'ethereum';

  const handleWalletSwitch = (type: 'ethereum' | 'solana') => {
    switchWalletType(type);
    onClose();
  };

  const handleCreateEthereumWallet = () => {
    TakoToast.show({
      type: 'normal',
      status: 'info',
      message: t('modals.ethereumWalletInfo'),
    });
    onClose();
  };

  const handleCreateSolanaWallet = async () => {
    onClose();
    return await createSolanaWallet();
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={t('modals.switchWallet')}
    >
      <Text className="text-base text-slate-500 mb-6 text-center">
        {t('modals.choosePrimaryWallet')}
      </Text>

      {/* Ethereum Wallet Option */}
      {ethereumAddress && (
        <TouchableOpacity
          className={`mx-5 px-5 py-4 bg-white rounded-[16px] mb-3 border border-[#F8F8F8] ${
            activeWalletType === 'ethereum' ? 'border-black' : 'border-gray-200'
          }`}
          onPress={() => handleWalletSwitch('ethereum')}
        >
          <View className="flex-row items-center">
            <WalletLogo type="ethereum" size={32} style={{ marginRight: 12 }} />
            <View className="flex-1">
              <Text className="text-base font-[600] text-black">
                {t('modals.ethereumWallet')}
              </Text>
              <Text className="text-[12px] text-[#ACB3BF] font-mono mt-0.5">
                {formatAddress(ethereumAddress)}
              </Text>
              <Text className="text-[12px] text-[#ACB3BF] mt-0.5">
                {t('modals.ethereumMainnet')}
              </Text>
            </View>
            {activeWalletType === 'ethereum' && (
              <Text className="text-xl text-black font-[600]">✓</Text>
            )}
          </View>
        </TouchableOpacity>
      )}

      {/* Solana Wallet Option */}
      {hasSolanaWallet && solanaAddress && (
        <TouchableOpacity
          className={`mx-5 px-5 py-4 bg-white rounded-[16px] mb-3 border border-[#F8F8F8] ${
            activeWalletType === 'solana' ? 'border-black' : 'border-gray-200'
          }`}
          onPress={() => handleWalletSwitch('solana')}
        >
          <View className="flex-row items-center">
            <WalletLogo type="solana" size={32} style={{ marginRight: 12 }} />
            <View className="flex-1">
              <Text className="text-base font-[600] text-black">
                {t('modals.solanaWallet')}
              </Text>
              <Text className="text-[12px] text-[#ACB3BF] font-mono mt-0.5">
                {formatAddress(solanaAddress)}
              </Text>
              <Text className="text-[12px] text-[#ACB3BF] mt-0.5">
                {t('modals.mainnetBeta')}
              </Text>
            </View>
            {activeWalletType === 'solana' && (
              <Text className="text-xl text-black font-[600]">✓</Text>
            )}
          </View>
        </TouchableOpacity>
      )}

      {/* Create New Wallet Section */}
      <View className="mt-5 pt-4">
        {/* <Text className="text-base font-[600] text-black mb-4">
          {t('modals.createNewWallet')}
        </Text> */}

        {!ethereumAddress && (
          <TouchableOpacity
            className="flex-row items-center bg-white rounded-[16px] p-4 mb-3 border border-[#F8F8F8]"
            onPress={handleCreateEthereumWallet}
          >
            <WalletLogo type="ethereum" size={24} style={{ marginRight: 12 }} />
            <Text className="text-base font-[600] text-black">
              {t('modals.createEthereumWallet')}
            </Text>
          </TouchableOpacity>
        )}

        {!hasSolanaWallet && (
          <TouchableOpacity
            className="flex-row items-center bg-white rounded-[16px] p-4 mb-3 border border-[#F8F8F8]"
            onPress={handleCreateSolanaWallet}
            disabled={isCreatingSolanaWallet}
          >
            <WalletLogo type="solana" size={24} style={{ marginRight: 12 }} />
            <Text className="text-base font-[600] text-black">
              {isCreatingSolanaWallet
                ? t('modals.creating')
                : t('modals.createSolanaWallet')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </BaseModal>
  );
};
