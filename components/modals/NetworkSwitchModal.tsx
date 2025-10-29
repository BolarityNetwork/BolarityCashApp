import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BaseModal } from '@/components/common/BaseModal';
import { useTranslation } from 'react-i18next';

interface NetworkSwitchModalProps {
  visible: boolean;
  onClose: () => void;
  getAvailableNetworks: () => any[];
  switchEthereumNetwork: (networkKey: string) => Promise<void>;
  activeEthereumNetwork: string;
  isSwitchingNetwork: boolean;
}

export const NetworkSwitchModal: React.FC<NetworkSwitchModalProps> = ({
  visible,
  onClose,
  getAvailableNetworks,
  switchEthereumNetwork,
  activeEthereumNetwork,
  isSwitchingNetwork,
}) => {
  const { t } = useTranslation();
  const networkConfigMap = {
    mainnet: { name: 'Ethereum Mainnet' },
    sepolia: { name: 'Ethereum Sepolia' },
    polygon: { name: 'Polygon Mainnet' },
    bsc: { name: 'BSC Mainnet' },
    arbitrum: { name: 'Arbitrum One' },
    optimism: { name: 'Optimism' },
    base: { name: 'Base Mainnet' },
  };

  const handleNetworkSwitch = async (networkKey: string) => {
    try {
      await switchEthereumNetwork(networkKey);
      onClose();
    } catch (_) {
      // Error handled in hook
    }
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={t('modals.switchNetwork')}
    >
      <Text className="text-base text-slate-500 mb-6 text-center">
        {t('modals.chooseEthereumNetwork')}
      </Text>

      {getAvailableNetworks().map(network => {
        const networkKey =
          Object.entries(networkConfigMap).find(
            ([_, config]) => config.name === network.name
          )?.[0] || 'mainnet';

        const isActive = activeEthereumNetwork === networkKey;

        return (
          <TouchableOpacity
            key={network.name}
            className={`bg-white rounded-2xl mb-3 shadow-md border ${
              isActive ? 'border-indigo-500 border-2' : 'border-slate-100'
            }`}
            onPress={() => handleNetworkSwitch(networkKey)}
            disabled={isSwitchingNetwork}
          >
            <View className="flex-row items-center p-4">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: network.color + '20' }}
              >
                <Text className="text-2xl">{network.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-slate-800 mb-1">
                  {network.name}
                </Text>
                <Text className="text-sm text-slate-500 mb-0.5">
                  Chain ID: {network.chainId} • {network.symbol}
                </Text>
                <Text className="text-xs text-slate-400">
                  {network.blockExplorer}
                </Text>
              </View>
              {isActive && (
                <Text className="text-2xl text-indigo-500 font-bold">✓</Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}

      {isSwitchingNetwork && (
        <View className="items-center py-5">
          <ActivityIndicator color="#667eea" size="large" />
          <Text className="text-base text-indigo-500 mt-3 font-medium">
            {t('modals.switchingNetwork')}
          </Text>
        </View>
      )}
    </BaseModal>
  );
};
