// vaults/AaveVault.ts - AAVE protocol implementation
// Linux principle: One vault, one responsibility

import { ethers } from 'ethers';
import {
  BaseVault,
  VaultConfig,
  VaultBalance,
  VaultTransaction,
  VaultOperationResult,
} from './types';

export class AaveVault implements BaseVault {
  config: VaultConfig = {
    id: 'aave-usdc',
    name: 'AAVE USDC',
    protocol: 'AAVE',
    type: 'lending',
    apy: '8.2%',
    description: 'Decentralized lending protocol',
    minimumDeposit: '0.01',
    risk: 'Medium',
    tvl: '$12.5B',
    features: ['Instant withdrawals', 'Variable APY', 'Compound interest'],
    ui: {
      icon: 'DollarSign',
      gradientColors: ['#667eea', '#5a67d8'],
      supportedTokens: ['USDC'],
    },
  };

  private userAddress: string = '';
  private provider: any = null;
  private signer: any = null;
  private usdcContract: any = null;
  private poolContract: any = null;

  // Network configurations
  private readonly CONTRACTS = {
    base: {
      POOL_ADDRESS: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
      USDC_ADDRESS: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      AUSDC_ADDRESS: '0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB',
    },
  };

  async initialize(userAddress: string): Promise<void> {
    this.userAddress = userAddress;
    // Provider setup would be injected from the app context
    // This is just the structure
  }

  async deposit(amount: string, token: string): Promise<VaultOperationResult> {
    try {
      if (token !== 'USDC') {
        throw new Error('Only USDC deposits supported');
      }

      const weiAmount = ethers.utils.parseUnits(amount, 6);

      // Check allowance
      const currentAllowance = await this.usdcContract.allowance(
        this.userAddress,
        this.CONTRACTS.base.POOL_ADDRESS
      );

      // Approve if needed
      if (currentAllowance.lt(weiAmount)) {
        const usdcWithSigner = this.usdcContract.connect(this.signer);
        const approveTx = await usdcWithSigner.approve(
          this.CONTRACTS.base.POOL_ADDRESS,
          weiAmount
        );
        await approveTx.wait();
      }

      // Execute deposit
      const poolWithSigner = this.poolContract.connect(this.signer);
      const supplyTx = await poolWithSigner.supply(
        this.CONTRACTS.base.USDC_ADDRESS,
        weiAmount,
        this.userAddress,
        0
      );

      const receipt = await supplyTx.wait();

      return {
        success: true,
        transactionHash: receipt.transactionHash,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async withdraw(amount: string): Promise<VaultOperationResult> {
    try {
      const weiAmount = ethers.utils.parseUnits(amount, 6);

      const poolWithSigner = this.poolContract.connect(this.signer);
      const withdrawTx = await poolWithSigner.withdraw(
        this.CONTRACTS.base.USDC_ADDRESS,
        weiAmount,
        this.userAddress
      );

      const receipt = await withdrawTx.wait();

      return {
        success: true,
        transactionHash: receipt.transactionHash,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async claim(): Promise<VaultOperationResult> {
    // AAVE automatically compounds, no manual claim needed
    return { success: true };
  }

  async getBalance(userAddress: string): Promise<VaultBalance> {
    try {
      const aUSDCContract = new ethers.Contract(
        this.CONTRACTS.base.AUSDC_ADDRESS,
        ['function balanceOf(address) view returns (uint256)'],
        this.provider
      );

      const aUSDCBalance = await aUSDCContract.balanceOf(userAddress);
      const deposited = ethers.utils.formatUnits(aUSDCBalance, 6);

      // Calculate earned amount (simplified)
      const earned = '0.00'; // Would calculate based on deposit history

      return {
        deposited,
        earned,
        totalValue: deposited,
        apy: this.config.apy,
      };
    } catch (_) {
      return {
        deposited: '0',
        earned: '0',
        totalValue: '0',
        apy: '0%',
      };
    }
  }

  async getTransactions(_: string): Promise<VaultTransaction[]> {
    // Would fetch from transaction history or events
    return [];
  }

  async canDeposit(amount: string, token: string): Promise<boolean> {
    if (token !== 'USDC') return false;

    const minDeposit = parseFloat(this.config.minimumDeposit);
    return parseFloat(amount) >= minDeposit;
  }

  async canWithdraw(amount: string): Promise<boolean> {
    const balance = await this.getBalance(this.userAddress);
    return parseFloat(amount) <= parseFloat(balance.deposited);
  }

  async cleanup(): Promise<void> {
    // Cleanup resources if needed
  }
}
