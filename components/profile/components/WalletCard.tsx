import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WalletLogo } from '@/components/profile/components/WalletLogo';
import { WalletCardProps } from '@/interfaces/profile';
import { formatAddress } from '@/utils/profile';

export const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  isActive,
  onPress,
  onCopyAddress,
  onNetworkPress,
  isCreating = false,
}) => {
  if (!wallet.address) {
    // Create wallet card
    return (
      <View
        style={{
          alignItems: 'center',
          paddingVertical: 20,
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: '#f1f5f9',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <WalletLogo type={wallet.type} size={40} />
        </View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: 8,
          }}
        >
          No {wallet.type === 'ethereum' ? 'Ethereum' : 'Solana'} Wallet
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: '#64748b',
            textAlign: 'center',
            marginBottom: 16,
            lineHeight: 20,
          }}
        >
          Create a {wallet.type === 'ethereum' ? 'Ethereum' : 'Solana'} wallet
          to use {wallet.type === 'ethereum' ? 'ETH' : 'SOL'} DeFi features
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#667eea',
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 24,
          }}
          onPress={onPress}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#fff',
              }}
            >
              Create {wallet.type === 'ethereum' ? 'ETH' : 'SOL'} Wallet
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  const gradientColors = isActive
    ? wallet.type === 'ethereum'
      ? ['#667eea', '#764ba2']
      : ['#f59e0b', '#d97706']
    : ['#94a3b8', '#64748b'];

  return (
    <View style={{ borderRadius: 16, overflow: 'hidden' }}>
      <LinearGradient
        colors={gradientColors}
        style={{ padding: 20, alignItems: 'center' }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#10b981',
              marginRight: 6,
            }}
          />
          <Text
            style={{
              fontSize: 14,
              color: '#fff',
              fontWeight: '500',
            }}
          >
            Connected
          </Text>
        </View>

        {/* Address container */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 12,
            paddingVertical: 8,
            paddingHorizontal: 12,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#fff',
              fontFamily: 'monospace',
              flex: 1,
            }}
          >
            {formatAddress(wallet.address)}
          </Text>
          {onCopyAddress && (
            <TouchableOpacity
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 8,
              }}
              onPress={() => onCopyAddress(wallet.address!)}
            >
              <Text style={{ fontSize: 16 }}>📋</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Network info for Ethereum */}
        {wallet.type === 'ethereum' && wallet.network && onNetworkPress && (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
              paddingVertical: 8,
              paddingHorizontal: 12,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }}
            onPress={onNetworkPress}
          >
            <Text
              style={{
                fontSize: 16,
                marginRight: 8,
              }}
            >
              🌐
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#fff',
                flex: 1,
                fontWeight: '500',
              }}
            >
              {wallet.network}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#fff',
              }}
            >
              ⚙️
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 12,
            paddingVertical: 10,
            paddingHorizontal: 24,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
          }}
          onPress={onPress}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#fff',
            }}
          >
            {isActive ? 'Manage' : `Switch to ${wallet.type.toUpperCase()}`}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};
