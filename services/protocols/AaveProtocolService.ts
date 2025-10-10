import {
  ProtocolService,
  ProtocolInfo,
  DepositParams,
  WithdrawParams,
} from './types';
import { DEFAULT_CHAIN_ID } from '@/utils/blockchain/chainIds';
import AaveService from '@/api/AaveService';
import { TimeWindow } from '@aave/client';

export class AaveProtocolService implements ProtocolService {
  name = 'AAVE';
  chainId = DEFAULT_CHAIN_ID;
  private aaveWallet: any; // Store wallet instance for transactions

  constructor(private aaveService: AaveService) {}

  // Set Aave Wallet (for transactions)
  setAaveWallet(wallet: any) {
    this.aaveWallet = wallet;
  }

  async getAPRInfo(userAddress: string): Promise<ProtocolInfo> {
    try {
      // Get APY data (7-day average)
      const apyData = await this.aaveService.getAPYInfo(TimeWindow.LastWeek);
      console.log(22277, apyData);

      // Get user balance
      const balance = await this.aaveService.getUserBalance(userAddress);

      // Try to get TVL data
      let tvlDisplay = '$0';
      try {
        const tvlData = await this.aaveService.getTVL();
        // Format TVL for display
        const formatTVL = (tvl: number): string => {
          if (tvl >= 1e9) {
            return `$${(tvl / 1e9).toFixed(1)}B`;
          } else if (tvl >= 1e6) {
            return `$${(tvl / 1e6).toFixed(1)}M`;
          } else if (tvl >= 1e3) {
            return `$${(tvl / 1e3).toFixed(1)}K`;
          } else {
            return `$${tvl.toFixed(0)}`;
          }
        };

        tvlDisplay = formatTVL(tvlData.totalTVLRaw);
      } catch (tvlError) {
        console.warn(
          'Failed to get Aave TVL data, using fallback:',
          tvlError instanceof Error ? tvlError.message : 'Unknown error'
        );
      }

      return {
        name: this.name,
        apy: apyData.totalAPR,
        apyDisplay: `${(apyData.totalAPR * 100).toFixed(2)}%`,
        description: 'Decentralized lending protocol',
        tvl: tvlDisplay,
        risk: 'Low-Medium',
        isLive: true,
        lastUpdated: Date.now(),
        balance: balance.totalValue,
      };
    } catch (error) {
      console.error('Failed to get Aave APY:', error);
      return {
        name: this.name,
        apy: 0,
        apyDisplay: '0%',
        description: 'Decentralized lending protocol',
        tvl: '$0',
        risk: 'Low-Medium',
        isLive: false,
        lastUpdated: Date.now(),
        balance: 0,
      };
    }
  }

  getCacheKey(): string {
    return `aave_${this.chainId}`;
  }

  isSupported(): boolean {
    return !!this.aaveService;
  }

  // Deposit to Aave
  async deposit(_params: DepositParams): Promise<string> {
    if (!this.aaveWallet) {
      throw new Error(
        'Aave wallet not initialized. Please set up wallet first.'
      );
    }
    // TODO: Implement deposit logic using aaveWallet
    throw new Error('Aave deposit not implemented yet');
  }

  // Withdraw from Aave
  async withdraw(_params: WithdrawParams): Promise<string> {
    if (!this.aaveWallet) {
      throw new Error(
        'Aave wallet not initialized. Please set up wallet first.'
      );
    }
    // TODO: Implement withdraw logic using aaveWallet
    throw new Error('Aave withdraw not implemented yet');
  }

  // Get Balance
  async getBalance(asset: string, userAddress?: string): Promise<number> {
    if (!userAddress) {
      throw new Error('User address is required');
    }
    const balance = await this.aaveService.getUserBalance(userAddress);
    return balance.totalValue;
  }
}

export default AaveProtocolService;
