import {
  ProtocolService,
  ProtocolInfo,
  DepositParams,
  WithdrawParams,
} from './types';
import { DEFAULT_CHAIN_ID } from '@/utils/blockchain/chainIds';
import CompoundService from '@/api/CompoundService';

export class CompoundProtocolService implements ProtocolService {
  name = 'Compound';
  chainId = DEFAULT_CHAIN_ID;
  private compoundWallet: any; // Store useCompoundWallet instance

  constructor(private compoundService: CompoundService) {}

  // Set Compound Wallet (for transactions)
  setCompoundWallet(wallet: any) {
    this.compoundWallet = wallet;
  }

  async getAPRInfo(userAddress: string): Promise<ProtocolInfo> {
    try {
      // Get APR data first
      const aprData = await this.compoundService.getAPRInfo();
      const balance = await this.compoundService.getUserBalance(userAddress);
      // Try to get TVL data, but don't fail if it doesn't work
      let tvlDisplay = '$0'; // Default fallback
      try {
        const tvlData = await this.compoundService.getTVL();
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

        tvlDisplay = formatTVL(tvlData.totalTVL);
      } catch (tvlError) {
        console.warn(
          'Failed to get TVL data, using fallback:',
          tvlError instanceof Error ? tvlError.message : 'Unknown error'
        );
      }

      return {
        name: this.name,
        apy: aprData.totalAPR,
        apyDisplay: `${aprData.totalAPR.toFixed(2)}%`,
        description: 'Ethereum money markets',
        tvl: tvlDisplay,
        risk: 'Low-Medium',
        isLive: true,
        lastUpdated: Date.now(),
        balance: balance.totalValue,
      };
    } catch (error) {
      console.error('Failed to get Compound APR:', error);
      return {
        name: this.name,
        apy: 0,
        apyDisplay: '0%',
        description: 'Ethereum money markets',
        tvl: '$0',
        risk: 'Low-Medium',
        isLive: false,
        lastUpdated: Date.now(),
        balance: 0,
      };
    }
  }

  getCacheKey(): string {
    return `compound_${this.chainId}`;
  }

  isSupported(): boolean {
    return !!this.compoundService;
  }

  // Deposit to Compound
  async deposit(params: DepositParams): Promise<string> {
    if (!this.compoundWallet) {
      throw new Error(
        'Compound wallet not initialized. Please set up wallet first.'
      );
    }
    return this.compoundWallet.supply(params);
  }

  // Withdraw from Compound
  async withdraw(params: WithdrawParams): Promise<string> {
    if (!this.compoundWallet) {
      throw new Error(
        'Compound wallet not initialized. Please set up wallet first.'
      );
    }
    return this.compoundWallet.withdraw(params);
  }

  // Get Balance
  async getBalance(asset: string, userAddress?: string): Promise<number> {
    if (!this.compoundWallet) {
      throw new Error(
        'Compound wallet not initialized. Please set up wallet first.'
      );
    }
    return this.compoundWallet.getBalance(asset, userAddress);
  }
}

export default CompoundProtocolService;
