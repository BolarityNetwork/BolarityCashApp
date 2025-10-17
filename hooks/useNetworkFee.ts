import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface NetworkFeeData {
  gasPrice: string;
  gasLimit: string;
  estimatedFee: string;
  estimatedFeeUSD: string;
  isLoading: boolean;
  error: string | null;
}

export const useNetworkFee = (
  tokenAddress?: string,
  recipient?: string,
  amount?: string
): NetworkFeeData => {
  const [gasPrice, setGasPrice] = useState<string>('0');
  const [gasLimit, setGasLimit] = useState<string>('21000');
  const [estimatedFee, setEstimatedFee] = useState<string>('0');
  const [estimatedFeeUSD, setEstimatedFeeUSD] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const estimateFee = async () => {
      if (!recipient || !amount) {
        setEstimatedFee('0');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // 使用公共 RPC 提供者
        const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');

        // 获取当前 gas price
        const feeData = await provider.getFeeData();
        const currentGasPrice = feeData.gasPrice || BigInt(20000000000); // 20 gwei fallback
        setGasPrice(currentGasPrice.toString());

        let estimatedGasLimit = BigInt(21000); // 默认 ETH 转账 gas limit

        // 如果是 ERC20 代币转账，估算 gas limit
        if (
          tokenAddress &&
          tokenAddress !== '0x0000000000000000000000000000000000000000'
        ) {
          try {
            // ERC20 transfer 的 gas limit 通常是 65000-100000
            estimatedGasLimit = BigInt(65000);
          } catch (err) {
            console.warn('Failed to estimate gas for token transfer:', err);
            estimatedGasLimit = BigInt(65000); // 使用默认值
          }
        }

        setGasLimit(estimatedGasLimit.toString());

        // 计算总费用
        const totalFee = currentGasPrice * estimatedGasLimit;
        const feeInEth = ethers.formatEther(totalFee);
        setEstimatedFee(feeInEth);

        // 获取 ETH 价格
        try {
          const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
          );
          const data = await response.json();
          const ethPrice = data.ethereum?.usd || 3000; // 默认 $3000

          // 计算 USD 价值
          const feeInUSD = parseFloat(feeInEth) * ethPrice;
          setEstimatedFeeUSD(feeInUSD.toFixed(2));
        } catch (priceErr) {
          console.warn('Failed to fetch ETH price:', priceErr);
          // 使用默认价格计算
          const defaultEthPrice = 3000;
          const feeInUSD = parseFloat(feeInEth) * defaultEthPrice;
          setEstimatedFeeUSD(feeInUSD.toFixed(2));
        }
      } catch (err: any) {
        console.error('Failed to estimate network fee:', err);
        setError(err.message || 'Failed to estimate network fee');
        // 设置默认值
        setGasPrice('20000000000'); // 20 gwei
        setGasLimit('21000');
        setEstimatedFee('0.00042'); // 默认约 $1-2
        setEstimatedFeeUSD('1.26'); // 默认约 $1.26 (0.00042 * 3000)
      } finally {
        setIsLoading(false);
      }
    };

    estimateFee();
  }, [tokenAddress, recipient, amount]);

  return {
    gasPrice,
    gasLimit,
    estimatedFee,
    estimatedFeeUSD,
    isLoading,
    error,
  };
};
