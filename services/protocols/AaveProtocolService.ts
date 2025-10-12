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

  async getAPRInfo(): Promise<ProtocolInfo> {
    try {
      // Get APY data (7-day average)
      const apyData = await this.aaveService.getAPYInfo(TimeWindow.LastWeek);

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
  async deposit(params: DepositParams): Promise<string> {
    if (!this.aaveWallet) {
      throw new Error(
        'Aave wallet not initialized. Please set up wallet first.'
      );
    }

    try {
      console.log(`💰 Aave deposit: ${params.amount} ${params.asset}`);

      // 调用 useAaveWallet 的 supply 方法
      const txHash = await this.aaveWallet.supply({
        asset: params.asset,
        amount: params.amount,
        userAddress: params.userAddress,
      });

      console.log(`✅ Aave deposit successful: ${txHash}`);
      return txHash;
    } catch (error) {
      console.error('❌ Aave deposit failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Aave deposit failed: ${errorMessage}`);
    }
  }

  // Withdraw from Aave
  async withdraw(params: WithdrawParams): Promise<string> {
    if (!this.aaveWallet) {
      throw new Error(
        'Aave wallet not initialized. Please set up wallet first.'
      );
    }

    try {
      console.log(`💸 Aave withdraw: ${params.amount} ${params.asset}`);

      // 调用 useAaveWallet 的 withdraw 方法
      const txHash = await this.aaveWallet.withdraw({
        asset: params.asset,
        amount: params.amount,
        userAddress: params.userAddress,
      });

      console.log(`✅ Aave withdrawal successful: ${txHash}`);
      return txHash;
    } catch (error) {
      console.error('❌ Aave withdrawal failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Aave withdrawal failed: ${errorMessage}`);
    }
  }

  // Get Balance
  async getBalance(asset: string, userAddress?: string): Promise<number> {
    try {
      // 如果有 aaveWallet 实例，使用它获取余额
      if (this.aaveWallet) {
        console.log(`💎 Getting Aave balance for ${asset}`);
        const balance = await this.aaveWallet.getBalance(asset, userAddress);
        console.log(`💎 Aave balance: ${balance}`);
        return balance;
      }

      // 降级方案：使用 AaveService
      if (!userAddress) {
        throw new Error('User address is required');
      }

      const balance = await this.aaveService.getUserBalance(userAddress);
      return balance.totalValue;
    } catch (error) {
      console.error('❌ Failed to get Aave balance:', error);
      // 返回 0 而不是抛出错误，避免影响其他功能
      return 0;
    }
  }
}

export default AaveProtocolService;
