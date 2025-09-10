import * as Updates from 'expo-updates';

let APP_CONFIG = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://app.bolarity.xyz',
  privyAppId:
    process.env.EXPO_PUBLIC_PRIVY_APP_ID || 'cmb4ld7xg00qclg0n0ocxmp9l',
  privyClientId:
    process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID ||
    'client-WY6Lz4usDuw3YiQgxVEbvUJcwvAc2Tg4QkwDcPXkJNPt7',
  network: 'mainnet',
};

if (Updates.channel !== 'preview' && Updates.channel !== 'production') {
  APP_CONFIG.apiUrl = 'https://app.bolarity.xyz';
  APP_CONFIG.privyAppId = 'cmb4ld7xg00qclg0n0ocxmp9l';
  APP_CONFIG.privyClientId =
    'client-WY6Lz4usDuw3YiQgxVEbvUJcwvAc2Tg4QkwDcPXkJNPt7';
  APP_CONFIG.network = 'testnet';
}

export default APP_CONFIG;
