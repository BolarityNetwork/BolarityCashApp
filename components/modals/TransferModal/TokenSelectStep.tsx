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
import IconSearch from '@/assets/icon/common/search.svg';

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
      <ScrollView
        className="flex-1 px-5 mt-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Search box */}
        <View className="flex-row items-center bg-white rounded-[8px] p-4 mb-6 border border-[#E2E8F0]">
          <IconSearch />
          <TextInput
            className="ml-3 flex-1 text-gray-800 text-base"
            placeholder="Search for a token"
            placeholderTextColor="#DADADA"
            editable={false}
          />
        </View>

        {/* Token list skeleton */}
        {[1, 2, 3].map(index => (
          <View
            key={index}
            className="flex-row items-center py-4 px-5 bg-white rounded-[16px] border border-[#F8F8F8] mb-3"
          >
            <Skeleton width={48} height={48} borderRadius={24} />
            <View className="ml-4 flex-1">
              <Skeleton width={80} height={20} style={{ marginBottom: 6 }} />
              <Skeleton width={100} height={14} />
            </View>
          </View>
        ))}
      </ScrollView>
    );
  }

  // Error state
  if (isError) {
    return (
      <View className="flex-1 items-center justify-center px-5">
        <View className="items-center">
          <Icon name="alert-circle-outline" size={48} color="#ef4444" />
          <Text className="mt-4 text-[14px] text-[#50555C] text-center">
            Failed to load tokens, please try again
          </Text>
          <TouchableOpacity
            className="mt-6 bg-black rounded-[16px] px-6 py-3"
            onPress={onRefetch}
            activeOpacity={0.7}
          >
            <Text className="text-white text-[14px] font-[600]">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // No tokens state
  if (tokens.length === 0) {
    return (
      <ScrollView
        className="flex-1 px-5 mt-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Search box */}
        <View className="flex-row items-center bg-white rounded-[8px] p-4 mb-6 border border-[#E2E8F0]">
          <IconSearch />
          <TextInput
            className="ml-3 flex-1 text-gray-800 text-base"
            placeholder="Search for a token"
            placeholderTextColor="#DADADA"
            editable={false}
          />
        </View>

        {/* Empty state */}
        <View className="items-center">
          <Icon name="wallet-outline" size={48} color="#ACB3BF" />
          <Text className="mt-4 text-[14px] text-[#50555C]">
            No tokens available
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Sort tokens by balance in descending order
  const sortedTokens = [...tokens].sort((a, b) => {
    const balanceA = parseFloat(a.balance) || 0;
    const balanceB = parseFloat(b.balance) || 0;
    return balanceB - balanceA;
  });

  return (
    <ScrollView
      className="flex-1 px-5 mt-4"
      showsVerticalScrollIndicator={false}
    >
      {/* Search box */}
      <View className="flex-row items-center bg-white rounded-[8px] p-4 mb-6 border border-[#E2E8F0]">
        <IconSearch />
        <TextInput
          className="ml-3 flex-1 text-gray-800 text-base"
          placeholder="Search for a token"
          placeholderTextColor="#DADADA"
        />
      </View>

      {/* Token list */}
      {sortedTokens.map(token => {
        const hasBalance = parseFloat(token.balance) > 0;
        return (
          <View
            key={token.id}
            className="mb-3 py-4 px-5 bg-white rounded-[16px] border border-[#F8F8F8]"
          >
            <TouchableOpacity
              onPress={() => onTokenSelect(token)}
              disabled={!hasBalance}
              activeOpacity={hasBalance ? 0.7 : 1}
            >
              <View className="flex-row items-center">
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
                  <Text className="text-base font-[600] text-black mb-1">
                    {token.name}
                  </Text>

                  {/* Token amount + symbol */}
                  <Text className="text-[12px] text-[#ACB3BF]">
                    {parseFloat(token.balance).toFixed(6)} {token.symbol}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
};

export default TokenSelectStep;
