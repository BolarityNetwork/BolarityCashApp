import { CHAIN_IDS } from '@/utils/blockchain/chainIds';

export const SDK_CONFIG = {
  base: {
    chainId: CHAIN_IDS.BASE,
    rpcUrl: process.env.EXPO_PUBLIC_RPC_URL_8453,
    slippage: 0.01,
  },
  // TODO: Pendle Config
  pendle: {
    market: '0x44e2b05b2c17a12b37f11de18000922e64e23faa',
    ptToken: '0xb04cee9901c0a8d783fe280ded66e60c13a4e296',
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
};
