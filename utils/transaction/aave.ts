import { ethers } from 'ethers';
import getErrorMessage from '../error';
import { AAVE_POOL_ABI, AAVE_ERC20_ABI } from '../../constants/abis/aave';
import { AAVE_NETWORKS } from '../../constants/networks';

// AAVE集成类 - 重构版本
class AAVEIntegration {
  private provider: any;
  private signer: any;
  private poolAddress: string;
  private userAddress: string;
  private poolContract: ethers.Contract;
  private usdcContract: ethers.Contract;
  private addressesProvider: string;
  private usdcAddress: string;
  private network: string;
  private chainId: string;

  constructor(provider: any, userAddress: string, networkKey: string = 'base') {
    console.log(`🏗️ Initializing AAVEIntegration for ${networkKey}`);

    this.provider = provider;
    this.userAddress = userAddress;
    this.network = networkKey;

    const config = AAVE_NETWORKS[networkKey as keyof typeof AAVE_NETWORKS];
    if (!config) {
      throw new Error(`Unsupported network: ${networkKey}`);
    }

    this.poolAddress = config.POOL_ADDRESS;
    this.addressesProvider = config.ADDRESSES_PROVIDER;
    this.usdcAddress = config.USDC_ADDRESS;
    this.chainId = config.CHAIN_ID;

    // 创建ethers provider和signer
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    this.signer = ethersProvider.getSigner();

    // 初始化合约实例
    this.poolContract = new ethers.Contract(
      this.poolAddress,
      AAVE_POOL_ABI,
      ethersProvider // 只读操作使用provider
    );

    this.usdcContract = new ethers.Contract(
      this.usdcAddress,
      AAVE_ERC20_ABI,
      ethersProvider // 只读操作使用provider
    );

    console.log(`✅ AAVEIntegration initialized:`, {
      network: networkKey,
      pool: this.poolAddress,
      usdc: this.usdcAddress,
      user: this.userAddress,
    });
  }

  // 🔧 验证网络连接
  async validateNetwork(): Promise<boolean> {
    try {
      const currentChainId = await this.provider.request({
        method: 'eth_chainId',
      });
      console.log(
        `🔍 Current chainId: ${currentChainId}, Expected: ${this.chainId}`
      );

      if (currentChainId !== this.chainId) {
        console.warn(
          `⚠️ Chain mismatch! Current: ${currentChainId}, Expected: ${this.chainId}`
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to validate network:', error);
      return false;
    }
  }

  // 🔧 获取用户USDC余额
  async getUSDCBalance(): Promise<string> {
    try {
      console.log('💰 Getting USDC balance...');
      const balance = await this.usdcContract.balanceOf(this.userAddress);
      const formattedBalance = ethers.utils.formatUnits(balance, 6);
      console.log(`💰 USDC Balance: ${formattedBalance}`);
      return formattedBalance;
    } catch (error) {
      console.error('❌ Failed to get USDC balance:', error);
      throw new Error(`Failed to get USDC balance: ${getErrorMessage(error)}`);
    }
  }

  // 🔧 获取用户在AAVE的存款余额（改进版本）
  async getUserDeposits(): Promise<{
    totalCollateralUSD: string;
    aTokenBalance: string;
  }> {
    try {
      console.log('🔍 Getting user AAVE deposits...');

      // 🎯 策略1: 获取用户账户总览数据
      const userData = await this.poolContract.getUserAccountData(
        this.userAddress
      );
      const totalCollateralUSD = ethers.utils.formatUnits(
        userData.totalCollateralBase,
        8
      ); // AAVE使用8位小数精度

      console.log(`📊 Total Collateral: ${totalCollateralUSD} USD`);

      // 🎯 策略2: 获取aToken余额（更精确）
      let aTokenBalance = '0';
      try {
        const reserveData = await this.poolContract.getReserveData(
          this.usdcAddress
        );
        const aTokenAddress = reserveData.aTokenAddress;

        console.log(`🪙 aUSDC Address: ${aTokenAddress}`);

        // 创建aToken合约实例
        const aTokenContract = new ethers.Contract(
          aTokenAddress,
          AAVE_ERC20_ABI,
          this.poolContract.provider
        );

        const aBalance = await aTokenContract.balanceOf(this.userAddress);
        aTokenBalance = ethers.utils.formatUnits(aBalance, 6);

        console.log(`💎 aUSDC Balance: ${aTokenBalance}`);
      } catch (aTokenError) {
        console.warn(
          '⚠️ Failed to get aToken balance, using total collateral:',
          getErrorMessage(aTokenError)
        );
        aTokenBalance = totalCollateralUSD;
      }

      return {
        totalCollateralUSD,
        aTokenBalance,
      };
    } catch (error) {
      console.error('❌ Failed to get user deposits:', error);

      // 友好的错误处理
      const errorMsg = getErrorMessage(error);
      if (errorMsg.includes('timeout')) {
        throw new Error(
          'Network timeout. Please check your connection and try again.'
        );
      }

      if (errorMsg.includes('CALL_EXCEPTION')) {
        throw new Error(
          'Unable to connect to AAVE contracts. Please ensure you are on the correct network.'
        );
      }

      throw new Error(`Failed to load account data: ${errorMsg}`);
    }
  }

  // 🔧 存款到AAVE（改进版本）
  async deposit(
    amount: string
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      console.log(`💰 Starting deposit: ${amount} USDC`);

      // 验证网络
      const isValidNetwork = await this.validateNetwork();
      if (!isValidNetwork) {
        throw new Error('Please switch to the correct network');
      }

      // 转换金额
      const weiAmount = ethers.utils.parseUnits(amount, 6);
      console.log(`🔢 Wei amount: ${weiAmount.toString()}`);

      // 检查USDC余额
      const usdcBalance = await this.usdcContract.balanceOf(this.userAddress);
      console.log(
        `💰 Current USDC balance: ${ethers.utils.formatUnits(usdcBalance, 6)}`
      );

      if (usdcBalance.lt(weiAmount)) {
        throw new Error(
          `Insufficient USDC balance. You need ${amount} USDC but only have ${ethers.utils.formatUnits(usdcBalance, 6)} USDC`
        );
      }

      // 检查和设置授权
      const currentAllowance = await this.usdcContract.allowance(
        this.userAddress,
        this.poolAddress
      );
      console.log(
        `🔐 Current allowance: ${ethers.utils.formatUnits(currentAllowance, 6)}`
      );

      if (currentAllowance.lt(weiAmount)) {
        console.log('🔐 Approving USDC...');
        const usdcWithSigner = this.usdcContract.connect(this.signer);
        const approveTx = await usdcWithSigner.approve(
          this.poolAddress,
          weiAmount
        );
        console.log(`🔐 Approve TX: ${approveTx.hash}`);

        const approveReceipt = await approveTx.wait();
        console.log(
          `✅ Approve confirmed in block: ${approveReceipt.blockNumber}`
        );
      }

      // 执行存款
      console.log('💰 Executing supply...');
      const poolWithSigner = this.poolContract.connect(this.signer);

      const supplyTx = await poolWithSigner.supply(
        this.usdcAddress, // asset
        weiAmount, // amount
        this.userAddress, // onBehalfOf
        0 // referralCode
      );

      console.log(`💰 Supply TX: ${supplyTx.hash}`);

      const receipt = await supplyTx.wait();
      console.log(`✅ Supply confirmed in block: ${receipt.blockNumber}`);

      return {
        success: true,
        transactionHash: receipt.transactionHash,
      };
    } catch (error) {
      console.error('❌ Deposit failed:', error);

      const errorMsg = getErrorMessage(error);
      let errorMessage = errorMsg;

      // 用户友好的错误信息
      if (errorMsg.includes('User rejected')) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (errorMsg.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas fees';
      } else if (errorMsg.includes('execution reverted')) {
        errorMessage =
          'Transaction failed. Please check your balance and try again.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // 🔧 从AAVE提取（改进版本）
  async withdraw(
    amount: string
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      console.log(`💸 Starting withdrawal: ${amount} USDC`);

      // 验证网络
      const isValidNetwork = await this.validateNetwork();
      if (!isValidNetwork) {
        throw new Error('Please switch to the correct network');
      }

      // 转换金额（支持"all"）
      const weiAmount =
        amount === 'all'
          ? ethers.constants.MaxUint256
          : ethers.utils.parseUnits(amount, 6);

      console.log(
        `🔢 Withdrawal amount: ${amount === 'all' ? 'MAX' : weiAmount.toString()}`
      );

      // 执行提取
      console.log('💸 Executing withdraw...');
      const poolWithSigner = this.poolContract.connect(this.signer);

      const withdrawTx = await poolWithSigner.withdraw(
        this.usdcAddress, // asset
        weiAmount, // amount
        this.userAddress // to
      );

      console.log(`💸 Withdraw TX: ${withdrawTx.hash}`);

      const receipt = await withdrawTx.wait();
      console.log(`✅ Withdrawal confirmed in block: ${receipt.blockNumber}`);

      return {
        success: true,
        transactionHash: receipt.transactionHash,
      };
    } catch (error) {
      console.error('❌ Withdrawal failed:', error);

      const errorMsg = getErrorMessage(error);
      let errorMessage = errorMsg;

      // 用户友好的错误信息
      if (errorMsg.includes('User rejected')) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (errorMsg.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas fees';
      } else if (errorMsg.includes('execution reverted')) {
        errorMessage =
          'Withdrawal failed. Please check your deposited balance.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // 静态辅助方法
  static getNetworkConfig(networkKey: string) {
    return AAVE_NETWORKS[networkKey as keyof typeof AAVE_NETWORKS] || null;
  }

  static getSupportedNetworks(): string[] {
    return Object.keys(AAVE_NETWORKS);
  }
}

export default AAVEIntegration;
