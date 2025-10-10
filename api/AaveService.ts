/**
 * Aave Protocol Service
 * 提供 Aave 协议的 APY、TVL、余额等信息
 */

import { supplyAPYHistory, markets } from '@aave/client/actions';
import {
  evmAddress,
  chainId as toAaveChainId,
  TimeWindow,
  AaveClient,
} from '@aave/client';
// import { client } from '@/hooks/protocol/aave/client';
import { AAVE_NETWORKS } from '@/constants/networks';
import { DEFAULT_CHAIN_ID } from '@/utils/blockchain/chainIds';

const client = AaveClient.create();

// 数据结构定义
type PercentValue = {
  raw: string;
  decimals: number;
  value: string;
  formatted: string;
};

type APYSample = {
  avgRate: PercentValue;
  date: string;
};

// 工具函数：解包 Result 类型
const unwrapResult = <T>(result: any): T | null => {
  if (!result) return null;
  if (typeof result.isErr === 'function') {
    if (result.isErr()) {
      console.error('Aave SDK error:', result.error);
      return null;
    }
    if ('value' in result) {
      return result.value as T;
    }
  }
  return result as T;
};

// 工具函数：转换为数字
const toNumber = (value: any): number => {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  if (typeof value === 'object' && 'value' in value) {
    return Number(value.value);
  }
  if (typeof value.toString === 'function') {
    return Number(value.toString());
  }
  return 0;
};

class AaveService {
  private chainId: number;
  private underlyingToken: string;
  private marketAddress: string;

  constructor(
    chainId: number = DEFAULT_CHAIN_ID // 默认 Base 链
  ) {
    this.chainId = chainId;

    // 根据链 ID 选择配置
    const networkConfig =
      chainId === DEFAULT_CHAIN_ID
        ? AAVE_NETWORKS.base
        : chainId === 1
          ? AAVE_NETWORKS.mainnet
          : AAVE_NETWORKS.base;

    this.marketAddress = networkConfig.POOL_ADDRESS;
    this.underlyingToken = networkConfig.USDC_ADDRESS;
  }

  /**
   * 获取 APY 信息
   * @param window 时间窗口，默认最近 7 天
   * @returns APY 信息
   */
  async getAPYInfo(window: TimeWindow = TimeWindow.LastWeek) {
    try {
      const result = await supplyAPYHistory(client, {
        chainId: toAaveChainId(this.chainId),
        underlyingToken: evmAddress(this.underlyingToken as `0x${string}`),
        market: evmAddress(this.marketAddress as `0x${string}`),
        window,
      });

      const samples = unwrapResult<APYSample[]>(result);

      if (!samples || samples.length === 0) {
        throw new Error('No APY data available');
      }

      // 计算平均 APY
      const avgAPY =
        samples.reduce((acc, sample) => {
          return acc + Number(sample.avgRate.value);
        }, 0) / samples.length;

      // 获取最新 APY
      const latestAPY = Number(samples[samples.length - 1].avgRate.value);

      return {
        baseAPR: avgAPY, // 基础 APY（小数形式，如 0.0547 = 5.47%）
        baseAPRPercentage: avgAPY * 100, // 百分比形式
        totalAPR: avgAPY,
        totalAPRPercentage: avgAPY * 100,
        latestAPY: latestAPY,
        latestAPYPercentage: latestAPY * 100,
        dataPoints: samples.length,
        window: window,
      };
    } catch (error: any) {
      throw new Error(`获取 APY 失败: ${error.message}`);
    }
  }

  /**
   * 获取 TVL 信息
   * @returns TVL 信息
   */
  async getTVL() {
    try {
      const chainIdentifier = toAaveChainId(this.chainId);

      const marketResult = await markets(client, {
        chainIds: [chainIdentifier],
      });

      const marketData = unwrapResult<any[]>(marketResult);

      if (!marketData || marketData.length === 0) {
        throw new Error('No market data available');
      }

      let totalTVL = 0;
      let totalLiquidity = 0;
      let usdcTVL = 0;

      const marketDetails = marketData.map(market => {
        const marketSize = toNumber(market?.totalMarketSize);
        const availableLiquidity = toNumber(market?.totalAvailableLiquidity);
        const reserves = Array.isArray(market?.supplyReserves)
          ? market.supplyReserves
          : [];

        totalTVL += marketSize;
        totalLiquidity += availableLiquidity;

        // 查找 USDC reserve
        const usdcReserve = reserves.find((r: any) =>
          String(r?.underlyingToken?.symbol || r?.symbol || '')
            .toUpperCase()
            .includes('USDC')
        );

        if (usdcReserve) {
          usdcTVL += toNumber(usdcReserve?.size?.usd);
        }

        return {
          address: market?.address || market?.marketAddress || 'unknown',
          name: market?.name || 'Unknown Market',
          totalMarketSize: marketSize,
          availableLiquidity: availableLiquidity,
          borrowed: marketSize - availableLiquidity,
          reserves: reserves.map((r: any) => ({
            symbol: r?.underlyingToken?.symbol || r?.symbol || '',
            supplied: toNumber(r?.size?.amount?.value),
            suppliedUSD: toNumber(r?.size?.usd),
            borrowedUSD: toNumber(r?.borrowInfo?.totalDebtBalanceUSD),
          })),
        };
      });

      return {
        totalTVL: `$${totalTVL.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        totalTVLRaw: totalTVL,
        totalLiquidity: `$${totalLiquidity.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        totalLiquidityRaw: totalLiquidity,
        usdcTVL: `$${usdcTVL.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        usdcTVLRaw: usdcTVL,
        chain: this.chainId === DEFAULT_CHAIN_ID ? 'Base' : 'Ethereum',
        chainId: this.chainId,
        marketAddress: this.marketAddress,
        markets: marketDetails,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      throw new Error(`获取 TVL 失败: ${error.message}`);
    }
  }

  /**
   * 获取用户余额
   * @param userAddress 用户地址
   * @returns 用户余额信息
   */
  async getUserBalance(userAddress: string) {
    try {
      // TODO: 实现获取用户在 Aave 的余额
      console.log(22280, userAddress);
      // 需要使用 @aave/client 的 userPositions 或类似方法
      console.warn(
        'getUserBalance not fully implemented yet. Returning mock data.'
      );

      return {
        supplied: 0,
        borrowed: 0,
        totalValue: 0,
        healthFactor: 0,
      };
    } catch (error: any) {
      throw new Error(`获取余额失败: ${error.message}`);
    }
  }

  /**
   * 存款到 Aave
   * @param amount 存款金额
   * @returns 交易结果
   */
  // async deposit(amount: string) {
  //   try {
  //     // TODO: 实现存款逻辑
  //     // 需要使用 @aave/client 的 supply 方法
  //     console.warn('Deposit not implemented yet');

  //     throw new Error('Deposit functionality not implemented yet');
  //   } catch (error: any) {
  //     throw new Error(`存款失败: ${error.message}`);
  //   }
  // }

  /**
   * 从 Aave 提取
   * @param amount 提取金额
   * @returns 交易结果
   */
  // async withdraw(amount: string) {
  //   try {
  //     // TODO: 实现提取逻辑
  //     // 需要使用 @aave/client 的 withdraw 方法
  //     console.warn('Withdraw not implemented yet');

  //     throw new Error('Withdraw functionality not implemented yet');
  //   } catch (error: any) {
  //     throw new Error(`提取失败: ${error.message}`);
  //   }
  // }
}

export default AaveService;
