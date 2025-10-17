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
  // 加载状态
  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        {/* 显示实际的搜索框 */}
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
              placeholder="搜索代币..."
              placeholderTextColor="#94a3b8"
              editable={false}
            />
          </View>
        </View>

        {/* 代币列表骨架屏 */}
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
                  borderLeftWidth: 4,
                  borderLeftColor: '#6366f1',
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

  // 错误状态
  if (isError) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Icon name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="mt-4 text-gray-600 text-center">
          加载代币失败，请重试
        </Text>
        <TouchableOpacity
          className="mt-4 bg-indigo-600 rounded-lg p-3"
          onPress={onRefetch}
        >
          <Text className="text-white font-medium">重新加载</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 无代币状态
  if (tokens.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Icon name="wallet-outline" size={48} color="#94a3b8" />
        <Text className="mt-4 text-gray-600">暂无可用代币</Text>
      </View>
    );
  }

  // 按余额降序排序代币
  const sortedTokens = [...tokens].sort((a, b) => {
    const balanceA = parseFloat(a.balance) || 0;
    const balanceB = parseFloat(b.balance) || 0;
    return balanceB - balanceA;
  });

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* 搜索框 */}
      <View className="flex-row items-center bg-gray-100 rounded-lg p-3 mb-6">
        <Icon name="search" size={20} color="#64748b" />
        <TextInput
          className="ml-2 flex-1 text-gray-800"
          placeholder="搜索代币..."
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* 代币列表 */}
      {sortedTokens.map(token => {
        const hasBalance = parseFloat(token.balance) > 0;
        return (
          <TouchableOpacity
            key={token.id}
            className={`flex-row items-center justify-between bg-white rounded-xl p-4 mb-3 border-l-4 ${hasBalance ? 'border-indigo-500' : 'border-gray-200'}`}
            onPress={() => onTokenSelect(token)}
            disabled={!hasBalance}
          >
            <View className="flex-row items-center">
              <View className="flex-1">
                <Text className="font-bold text-gray-800">{token.name}</Text>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-500">
                    {parseFloat(token.balance).toFixed(6)} {token.symbol}
                  </Text>
                  {token.usdValue && (
                    <Text className="text-sm font-medium text-gray-700">
                      ${token.usdValue.toFixed(2)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
            <Icon
              name="chevron-forward"
              size={20}
              color={hasBalance ? '#6366f1' : '#cbd5e1'}
            />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default TokenSelectStep;
