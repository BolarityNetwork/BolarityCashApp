import React from 'react';
import { Text, Image } from 'react-native';

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function toMainIdentifier(account: any): string {
  if (account.type === "phone") {
    return account.phoneNumber;
  }
  if (account.type === "email" || account.type === "wallet") {
    return account.address;
  }
  if (account.type === "twitter_oauth" || account.type === "tiktok_oauth") {
    return account.username;
  }
  if (account.type === "custom_auth") {
    return account.custom_user_id;
  }
  return account.type;
}

// Provider icon logos
let ethereumProviderLogo: any, solanaProviderLogo: any;

try {
  ethereumProviderLogo = require('../../assets/logos/ethereum.png');
} catch (e) {
  console.warn('❌ Ethereum provider logo not found:', e);
  ethereumProviderLogo = null;
}

try {
  solanaProviderLogo = require('../../assets/logos/solana.png');
} catch (e) {
  console.warn('❌ Solana provider logo not found:', e);
  solanaProviderLogo = null;
}

export function getProviderIcon(type: string, size: number = 18): React.ReactElement {
  // For ethereum and solana, return PNG image components if available
  if (type === 'ethereum' && ethereumProviderLogo) {
    return (
      <Image
        source={ethereumProviderLogo}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
        onError={() => {
          console.log('❌ Ethereum provider icon failed to load');
        }}
      />
    );
  }
  
  if (type === 'solana' && solanaProviderLogo) {
    return (
      <Image
        source={solanaProviderLogo}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
        onError={() => {
          console.log('❌ Solana provider icon failed to load');
        }}
      />
    );
  }
  
  // For other types or PNG loading failure, return emoji components
  const icons: { [key: string]: string } = {
    email: "📧",
    phone: "📱",
    wallet: "💼",
    solana: "🌞",      // fallback
    ethereum: "🔷",    // fallback
    twitter_oauth: "🐦",
    tiktok_oauth: "🎵",
    google: "🔍",
    github: "⚡",
    discord: "🎮",
    apple: "🍎",
    custom_auth: "🔐",
  };
  
  const icon = icons[type] || "🔗";
  
  return (
    <Text style={{ fontSize: size * 0.9 }}>
      {icon}
    </Text>
  );
}