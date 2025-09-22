import React from 'react';
import { View, Text } from 'react-native';
import { BaseModal } from '@/components/common/BaseModal';

interface MessagesModalProps {
  visible: boolean;
  onClose: () => void;
  signedMessages: string[];
}

export const MessagesModal: React.FC<MessagesModalProps> = ({
  visible,
  onClose,
  signedMessages,
}) => {
  return (
    <BaseModal visible={visible} onClose={onClose} title="Signed Messages">
      {signedMessages.length === 0 ? (
        <View className="items-center py-10">
          <Text className="text-5xl mb-4">📝</Text>
          <Text className="text-lg font-bold text-slate-800 mb-2">
            No Messages Signed
          </Text>
          <Text className="text-sm text-slate-500 text-center">
            Sign your first message to see it here
          </Text>
        </View>
      ) : (
        signedMessages.map((message, index) => (
          <View key={index} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
            <Text className="text-xs font-bold text-indigo-500 mb-2">
              #{index + 1}
            </Text>
            <Text className="text-sm text-slate-800 font-mono mb-2">
              {message}
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
