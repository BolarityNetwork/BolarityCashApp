import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Recipient } from './types';

interface RecipientStepProps {
  recipientAddress: string;
  recentRecipients: Recipient[];
  addressBookRecipients: Recipient[];
  onRecipientSelect: (recipient: Recipient) => void;
  onAddressChange: (address: string) => void;
  onAddressInputComplete: () => void;
  onManageAddressBook?: () => void;
}

const RecipientStep: React.FC<RecipientStepProps> = ({
  recipientAddress,
  recentRecipients,
  addressBookRecipients,
  onRecipientSelect,
  onAddressChange,
  onAddressInputComplete,
  onManageAddressBook,
}) => {
  return (
    <View>
      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-500 mb-1">
          To: username or address
        </Text>
        <TextInput
          className="bg-gray-100 rounded-lg p-4 text-gray-800"
          placeholder="Enter address or username"
          placeholderTextColor="#94a3b8"
          value={recipientAddress}
          onChangeText={onAddressChange}
          autoCapitalize="none"
          autoCorrect={false}
          editable={true}
          selectTextOnFocus={true}
          onSubmitEditing={onAddressInputComplete}
        />
        <TouchableOpacity className="absolute right-3 top-9">
          <Icon name="qr-code-outline" size={24} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Recent usage */}
      {recentRecipients.length > 0 && (
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Icon name="time-outline" size={16} color="#64748b" />
            <Text className="ml-1 text-sm font-medium text-gray-500">
              Recently Used
            </Text>
          </View>
          {recentRecipients.map(recipient => (
            <TouchableOpacity
              key={recipient.id}
              className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-3"
              onPress={() => onRecipientSelect(recipient)}
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <Icon name="wallet-outline" size={16} color="#64748b" />
                </View>
                <View>
                  <Text className="font-medium text-gray-800">
                    {recipient.address.slice(0, 6) +
                      '...' +
                      recipient.address.slice(-4)}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {recipient.lastUsed}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Address book */}
      <View>
        <View className="flex-row items-center mb-3">
          <Icon name="book-outline" size={16} color="#64748b" />
          <Text className="ml-1 text-sm font-medium text-gray-500">
            Address Book
          </Text>
        </View>

        {addressBookRecipients.length > 0 ? (
          addressBookRecipients.map(recipient => (
            <TouchableOpacity
              key={recipient.id}
              className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-3"
              onPress={() => onRecipientSelect(recipient)}
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <Text className="font-bold text-gray-600">
                    {recipient.name?.charAt(0) || 'A'}
                  </Text>
                </View>
                <View>
                  <Text className="font-medium text-gray-800">
                    {recipient.name || 'Unknown'}
                  </Text>
                  <Text className="text-xs font-mono text-gray-500">
                    {recipient.address.slice(0, 6) +
                      '...' +
                      recipient.address.slice(-4)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <TouchableOpacity
            className="flex-row items-center justify-center bg-gray-50 rounded-xl p-4 mb-3 border border-gray-100"
            onPress={onManageAddressBook}
          >
            <View className="flex-row items-center">
              <Icon name="add-circle-outline" size={16} color="#94a3b8" />
              <Text className="ml-2 text-sm text-gray-500">
                Add contacts to your address book
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default RecipientStep;
