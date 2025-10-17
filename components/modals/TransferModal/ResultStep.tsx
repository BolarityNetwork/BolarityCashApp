import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Token } from './types';

interface ResultStepProps {
  isSuccess: boolean | null;
  selectedToken: Token | null;
  amount: string;
  recipientAddress: string;
  recipientName: string;
  transactionHash: string;
  showAddToAddressBook?: boolean;
  onAddToAddressBook?: (name: string) => void;
  onSkipAddToAddressBook?: () => void;
}

const ResultStep: React.FC<ResultStepProps> = ({
  isSuccess,
  selectedToken,
  amount,
  recipientAddress,
  recipientName,
  transactionHash,
  showAddToAddressBook = false,
  onAddToAddressBook,
  onSkipAddToAddressBook,
}) => {
  const [addressBookName, setAddressBookName] = useState('');

  const handleAddToAddressBook = () => {
    if (!addressBookName.trim()) {
      Alert.alert('Error', 'Please enter contact name');
      return;
    }
    onAddToAddressBook?.(addressBookName);
  };

  const handleSkipAddToAddressBook = () => {
    onSkipAddToAddressBook?.();
  };
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

      {/* Add to address book functionality */}
      {isSuccess && showAddToAddressBook && (
        <View className="w-full bg-gray-50 rounded-xl p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-2 text-center">
            Add to Address Book
          </Text>
          <Text className="text-sm text-gray-600 mb-4 text-center">
            Add a name for this address to make future transfers easier
          </Text>

          <TextInput
            className="bg-white border border-gray-200 rounded-lg px-4 py-3 mb-4 text-gray-800"
            placeholder="Enter contact name"
            value={addressBookName}
            onChangeText={setAddressBookName}
            autoCapitalize="words"
          />

          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
              onPress={handleSkipAddToAddressBook}
            >
              <Text className="text-gray-700 font-medium">Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-indigo-600 rounded-lg py-3 items-center"
              onPress={handleAddToAddressBook}
            >
              <Text className="text-white font-medium">Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default ResultStep;
