import React, { useCallback } from 'react';
import { encodeFunctionData, erc20Abi } from 'viem';
import { useEmbeddedEthereumWallet } from '@privy-io/expo';

interface TransferParams {
  tokenAddress: string;
  recipient: `0x${string}`;
  amount: number;
  decimals: number;
}

interface UseTransferTokenReturn {
  transferToken: (params: TransferParams) => Promise<string>;
  isTransferring: boolean;
}

export const useTransferToken = (): UseTransferTokenReturn => {
  const { wallets } = useEmbeddedEthereumWallet();
  const [isTransferring, setIsTransferring] = React.useState(false);
  const wallet = wallets[0];

  const transferToken = useCallback(
    async ({
      tokenAddress,
      recipient,
      amount,
      decimals,
    }: TransferParams): Promise<string> => {
      setIsTransferring(true);

      try {
        // 验证必要参数
        if (!wallet) {
          throw new Error('No active wallet found');
        }

        if (!tokenAddress || !recipient || amount <= 0) {
          throw new Error('Invalid transfer parameters');
        }

        // 验证地址格式
        if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
          throw new Error('Invalid token contract address');
        }

        if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
          throw new Error('Invalid recipient address');
        }

        // 获取钱包提供者
        const provider = await wallet.getProvider();

        // 请求账户
        const accounts = await provider.request({
          method: 'eth_requestAccounts',
        });

        const senderAddress = accounts[0] as string;

        // 计算转账金额（考虑精度）
        const amountInWei = BigInt(Math.round(amount * 10 ** decimals));

        // 编码交易数据
        const encodedData = encodeFunctionData({
          abi: erc20Abi,
          functionName: 'transfer',
          args: [recipient, amountInWei],
        });

        // 确保encodedData以0x开头
        const dataWithPrefix = encodedData.startsWith('0x')
          ? encodedData
          : `0x${encodedData}`;

        // 发送交易
        const txHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: senderAddress,
              to: tokenAddress,
              data: dataWithPrefix,
              // 注意：转账ERC-20代币时，value字段应为0
              value: '0x0',
            },
          ],
        });

        // 验证交易哈希
        if (!txHash || typeof txHash !== 'string') {
          throw new Error('Failed to get transaction hash');
        }

        return txHash;
      } catch (error) {
        console.error('Transfer token error:', error);
        throw error;
      } finally {
        setIsTransferring(false);
      }
    },
    [wallet]
  );

  return {
    transferToken,
    isTransferring,
  };
};
