import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Token } from './types';

interface ConfirmStepProps {
  selectedToken: Token | null;
  recipientAddress: string;
  amount: string;
  isProcessing: boolean;
}

const ConfirmStep: React.FC<ConfirmStepProps> = ({
  selectedToken,
  recipientAddress,
  amount,
  isProcessing,
}) => {
  // 计算USD价值
  const calculateUsdValue = () => {
    if (!selectedToken || !selectedToken.usdValue || !amount) return 0;
    const tokenBalance = parseFloat(selectedToken.balance) || 0;
    const tokenValue = parseFloat(amount) || 0;
    return tokenValue * (selectedToken.usdValue / tokenBalance);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'space-between' }}>
      <View>
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>
            Token
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon
              name={(selectedToken?.icon || 'swap-horizontal') as any}
              size={24}
              color="#64748b"
              style={{ marginRight: 8 }}
            />
            <Text
              style={{ fontWeight: 'bold', fontSize: 18, color: '#1e293b' }}
            >
              {selectedToken?.name}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>
            Recipient
          </Text>
          <Text style={{ fontWeight: '500', color: '#1e293b' }}>
            {recipientAddress}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>
            Amount
          </Text>
          <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#1e293b' }}>
            {amount} {selectedToken?.symbol}
          </Text>
          {selectedToken?.usdValue && (
            <Text style={{ fontSize: 14, color: '#64748b' }}>
              ~${calculateUsdValue().toFixed(2)}
            </Text>
          )}
        </View>

        <View
          style={{ backgroundColor: 'white', borderRadius: 12, padding: 20 }}
        >
          <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>
            Network Fee
          </Text>
          <Text style={{ fontWeight: '500', color: '#1e293b' }}>
            ~0.0001 {selectedToken?.symbol}
          </Text>
        </View>
      </View>

      {isProcessing && (
        <ActivityIndicator
          size="large"
          color="#6366f1"
          style={{ paddingVertical: 16 }}
        />
      )}
    </View>
  );
};

export default ConfirmStep;
