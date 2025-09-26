import { CompoundSDK } from '../sdk/CompoundSDK';
import { SDK_CONFIG } from '../sdk/config';

class CompoundService {
  constructor(privateKey) {
    this.sdk = new CompoundSDK({
      chainId: SDK_CONFIG.base.chainId,
      rpcUrl: SDK_CONFIG.base.rpcUrl,
      privateKey: privateKey,
      slippage: SDK_CONFIG.base.slippage,
      verbose: __DEV__, // 开发模式下启用详细日志
    });
  }

  // 获取 APR 信息
  async getAPRInfo() {
    try {
      const aprData = await this.sdk.getTotalAPR('USDC');
      return {
        baseAPR: aprData.baseAPRPercentage,
        compAPR: aprData.compAPRPercentage,
        totalAPR: aprData.totalAPRPercentage,
      };
    } catch (error) {
      throw new Error(`获取 APR 失败: ${error.message}`);
    }
  }

  // 获取用户余额
  async getUserBalance(userAddress) {
    try {
      const balance = await this.sdk.getBalance('USDC', userAddress);
      return {
        supplied: balance.supplied,
        compRewards: balance.compRewards,
        totalValue: balance.totalValue,
      };
    } catch (error) {
      throw new Error(`获取余额失败: ${error.message}`);
    }
  }

  // 存款到 Compound
  async deposit(amount) {
    try {
      const result = await this.sdk.supply('USDC', amount);
      if (result.success) {
        return {
          success: true,
          txHash: result.hash,
          gasUsed: result.gasUsed,
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`存款失败: ${error.message}`);
    }
  }
  // 从 Compound 提取
  async withdraw(amount) {
    try {
      const result = await this.sdk.withdraw('USDC', amount);
      if (result.success) {
        return {
          success: true,
          txHash: result.hash,
          gasUsed: result.gasUsed,
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`提取失败: ${error.message}`);
    }
  }

  // 领取 COMP 奖励
  async claimRewards(userAddress) {
    try {
      const result = await this.sdk.claimRewards(userAddress);
      if (result.success) {
        return {
          success: true,
          txHash: result.hash,
          rewards: result.rewards,
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`领取奖励失败: ${error.message}`);
    }
  }
}

export default CompoundService;
