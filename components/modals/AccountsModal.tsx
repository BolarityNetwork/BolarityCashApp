import React from 'react';
import { View, Text } from 'react-native';
import { BaseModal } from '@/components/common/BaseModal';
import { toMainIdentifier } from '@/utils/profile';

interface AccountItem {
  type: string;
  [key: string]: any;
}

interface AccountsModalProps {
  visible: boolean;
  onClose: () => void;
  linkedAccounts: AccountItem[];
  getProviderIcon: (type: string, size?: number) => React.ReactElement;
}

export const AccountsModal: React.FC<AccountsModalProps> = ({
  visible,
  onClose,
  linkedAccounts,
  getProviderIcon,
}) => {
  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="All Connected Accounts"
    >
      {linkedAccounts.map((accountItem: AccountItem, index: number) => (
        <View
          key={index}
          className="flex-row items-center py-3 border-b border-slate-50"
        >
          <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-3">
            {getProviderIcon(accountItem.type, 18)}
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-slate-800 capitalize">
              {accountItem.type.replace('_oauth', '').replace('_', ' ')}
            </Text>
            <Text className="text-xs text-slate-500 mt-0.5">
              {toMainIdentifier(accountItem)}
            </Text>
          </View>
          <View className="w-6 h-6 rounded-full bg-emerald-500 items-center justify-center">
            <Text className="text-xs text-white font-bold">✓</Text>
          </View>
        </View>
      ))}
    </BaseModal>
  );
};
