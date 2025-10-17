import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Token } from './types';

interface ResultStepProps {
  isSuccess: boolean | null;
  selectedToken: Token | null;
  amount: string;
  recipientAddress: string;
  recipientName: string;
  transactionHash: string;
}

const ResultStep: React.FC<ResultStepProps> = ({
  isSuccess,
  selectedToken,
  amount,
  recipientAddress,
  recipientName,
  transactionHash,
}) => {
  return (
    <View className="flex-1 items-center justify-center p-4">
      <View
        className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}
      >
        <Icon
          name={isSuccess ? 'checkmark' : 'close'}
          size={40}
          color={isSuccess ? '#22c55e' : '#ef4444'}
        />
      </View>

      <Text className="text-2xl font-bold text-gray-800 mb-3">
        {isSuccess ? 'Sent!' : 'Failed'}
      </Text>

      {isSuccess && (
        <Text className="text-center text-gray-600 mb-6">
          {amount} {selectedToken?.symbol} was successfully sent to
          {recipientName ? ` ${recipientName} ` : ' '}({recipientAddress})
        </Text>
      )}

      {!isSuccess && (
        <Text className="text-center text-gray-600 mb-6">
          Transaction failed. Please try again later.
        </Text>
      )}

      {isSuccess && transactionHash && (
        <TouchableOpacity className="text-indigo-600 font-medium mb-12">
          <Text>View transaction</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ResultStep;
