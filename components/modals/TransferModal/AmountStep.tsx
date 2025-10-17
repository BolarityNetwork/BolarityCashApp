import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Token } from './types';

interface AmountStepProps {
  recipientAddress: string;
  amount: string;
  selectedToken: Token | null;
  onAmountChange: (value: string) => void;
  onMaxAmount: () => void;
}

const AmountStep: React.FC<AmountStepProps> = ({
  recipientAddress,
  amount,
  selectedToken,
  onAmountChange,
  onMaxAmount,
}) => {
  // 计算USD价值
  const calculateUsdValue = () => {
    if (
      !selectedToken ||
      !selectedToken.usdValue ||
      !selectedToken.balance ||
      !amount
    ) {
      return null;
    }
    const amountFloat = parseFloat(amount);
    const balanceFloat = parseFloat(selectedToken.balance);
    if (balanceFloat === 0) return null;
    return (amountFloat * (selectedToken.usdValue / balanceFloat)).toFixed(2);
  };

  return (
    <View className="flex-1">
      <View className="text-center mb-8">
        <Text className="text-sm text-gray-500 mb-1">
          To: {recipientAddress}
        </Text>
        <TextInput
          className="text-4xl font-bold text-gray-800 text-center"
          placeholder="0"
          placeholderTextColor="#94a3b8"
          value={amount}
          onChangeText={onAmountChange}
          keyboardType="decimal-pad"
        />
        <Text className="text-2xl font-medium text-gray-700">
          {selectedToken?.symbol}
        </Text>
        {calculateUsdValue() && (
          <Text className="text-gray-500">~${calculateUsdValue()}</Text>
        )}
      </View>

      <View className="flex-row justify-between items-center bg-white rounded-xl p-4 mb-8">
        <Text className="text-gray-500">Available Balance</Text>
        <View className="flex-row items-center">
          <Text className="text-gray-800 font-medium mr-3">
            {selectedToken?.balance} {selectedToken?.symbol}
          </Text>
          <TouchableOpacity
            className="bg-indigo-100 text-indigo-600 font-medium px-3 py-1 rounded"
            onPress={onMaxAmount}
          >
            <Text>Max</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AmountStep;
