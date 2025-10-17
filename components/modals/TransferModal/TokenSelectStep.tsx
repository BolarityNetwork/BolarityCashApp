import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Skeleton from '../../common/Skeleton';
import { Token } from './types';
import { Image } from 'expo-image';

interface TokenSelectStepProps {
  isLoading: boolean;
  isError: boolean;
  tokens: Token[];
  onTokenSelect: (token: Token) => void;
  onRefetch: () => void;
}

const TokenSelectStep: React.FC<TokenSelectStepProps> = ({
  isLoading,
  isError,
  tokens,
  onTokenSelect,
  onRefetch,
}) => {
  const iconUrl = (symbol: string) => {
    switch (symbol) {
      case 'ETH':
        return 'https://static.oklink.com/cdn/explorer/oklinkmanage/picture/base_logo.jpeg?x-oss-process=image/resize,w_72,h_72,type_6/ignore-error,1';
      case 'USDC':
        return 'https://static.oklink.com/cdn/web3/currency/token/large/637-0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b-107/type=default_90_0?v=1756203256814&x-oss-process=image/resize,w_72,h_72,type_6/ignore-error,1';
    }
  };
  // Loading state
  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        {/* Show actual search box */}
        <View style={{ padding: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#f1f5f9',
              borderRadius: 8,
              padding: 12,
            }}
          >
            <Icon name="search" size={20} color="#64748b" />
            <TextInput
              style={{ marginLeft: 8, flex: 1, color: '#1e293b' }}
              placeholder="Search for a token..."
              placeholderTextColor="#94a3b8"
              editable={false}
            />
          </View>
        </View>

        {/* Token list skeleton */}
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: 12 }}>
            {[1, 2, 3].map(index => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 16,
                  backgroundColor: 'white',
                  borderRadius: 12,
                }}
              >
                <Skeleton width={40} height={40} borderRadius={20} />
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <Skeleton
                    width={80}
                    height={20}
                    style={{ marginBottom: 6 }}
                  />
                  <Skeleton width={100} height={14} />
                </View>
                <Skeleton width={60} height={20} />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Icon name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="mt-4 text-gray-600 text-center">
          Failed to load tokens, please try again
        </Text>
        <TouchableOpacity
          className="mt-4 bg-indigo-600 rounded-lg p-3"
          onPress={onRefetch}
        >
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No tokens state
  if (tokens.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Icon name="wallet-outline" size={48} color="#94a3b8" />
        <Text className="mt-4 text-gray-600">No tokens available</Text>
      </View>
    );
  }

  // Sort tokens by balance in descending order
  const sortedTokens = [...tokens].sort((a, b) => {
    const balanceA = parseFloat(a.balance) || 0;
    const balanceB = parseFloat(b.balance) || 0;
    return balanceB - balanceA;
  });

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Search box */}
      <View className="flex-row items-center bg-gray-100 rounded-lg p-4 mb-6">
        <Icon name="search" size={20} color="#64748b" />
        <TextInput
          className="ml-3 flex-1 text-gray-800 text-base"
          placeholder="Search for a token..."
          placeholderTextColor="#94a3b8"
          style={{ height: 24 }}
        />
      </View>

      {/* Token list */}
      {sortedTokens.map(token => {
        const hasBalance = parseFloat(token.balance) > 0;
        return (
          <TouchableOpacity
            key={token.id}
            className={`bg-white rounded-2xl p-4 mb-3 border ${
              hasBalance
                ? 'border-indigo-100 active:bg-indigo-50'
                : 'border-gray-100 opacity-60'
            }`}
            onPress={() => onTokenSelect(token)}
            disabled={!hasBalance}
            activeOpacity={hasBalance ? 0.7 : 1}
          >
            <View className="flex-row items-center justify-between">
              {/* Left: Token icon */}
              <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
                <Image
                  source={{ uri: iconUrl(token.symbol) }}
                  style={{ width: 48, height: 48, borderRadius: 24 }}
                />
              </View>
              {/* Right: Token info */}
              <View className="flex-1">
                {/* Token name */}
                <Text className="text-base font-semibold text-gray-900 mb-1">
                  {token.name}
                </Text>

                {/* Token amount + symbol */}
                <Text
                  className={`text-sm ${
                    hasBalance ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  {parseFloat(token.balance).toFixed(6)} {token.symbol}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default TokenSelectStep;
