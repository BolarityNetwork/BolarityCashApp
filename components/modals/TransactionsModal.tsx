import React from 'react';
import { View, Text } from 'react-native';
import { BaseModal } from '@/components/common/BaseModal';

interface TransactionsModalProps {
  visible: boolean;
  onClose: () => void;
  transactionResults: string[];
}

export const TransactionsModal: React.FC<TransactionsModalProps> = ({
  visible,
  onClose,
  transactionResults,
}) => {
  return (
    <BaseModal visible={visible} onClose={onClose} title="Transaction History">
      {transactionResults.length === 0 ? (
        <View className="items-center py-10">
          <Text className="text-5xl mb-4">📊</Text>
          <Text className="text-lg font-bold text-slate-800 mb-2">
            No Transactions
          </Text>
          <Text className="text-sm text-slate-500 text-center">
            Send your first test transaction to see it here
          </Text>
        </View>
      ) : (
        transactionResults.map((transaction, index) => (
          <View key={index} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
            <Text className="text-xs font-bold text-indigo-500 mb-2">
              #{index + 1}
            </Text>
            <Text className="text-sm text-slate-800 font-mono mb-2">
              {transaction}
            </Text>
            <Text className="text-xs text-slate-400">
              {new Date().toLocaleString()}
            </Text>
          </View>
        ))
      )}
    </BaseModal>
  );
};
