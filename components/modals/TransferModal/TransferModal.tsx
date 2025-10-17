import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { BaseModal } from '@/components/common/BaseModal';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { useUserBalances } from '@/api/account';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';
import { useTransferToken } from '@/hooks/transactions/useTransferToken';
import { Token, Recipient, Step } from './types';
import TokenSelectStep from './TokenSelectStep';
import RecipientStep from './RecipientStep';
import AmountStep from './AmountStep';
import ConfirmStep from './ConfirmStep';
import ResultStep from './ResultStep';

interface TransferModalProps {}

const TransferModalComponent: React.FC<TransferModalProps> = () => {
  const modal = useModal();
  const onClose = () => modal.hide();
  const { activeWallet } = useMultiChainWallet();
  const walletAddress = activeWallet?.address || '';
  const { transferToken } = useTransferToken();

  // 获取用户余额数据
  const {
    data: balancesData,
    isLoading,
    isError,
    refetch,
  } = useUserBalances(walletAddress, !!walletAddress);

  // 状态管理
  const [currentStep, setCurrentStep] = useState<Step>(Step.SELECT_TOKEN);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [transactionHash, setTransactionHash] = useState<string>('');

  // 从余额数据中提取真实代币列表
  const tokens: Token[] = React.useMemo(() => {
    if (!balancesData?.wallet) return [];

    // 合并 assets 和 stable 代币
    const assets = balancesData.wallet.assets || [];
    const stablecoins = balancesData.wallet.stable || [];
    const allTokens = [...assets, ...stablecoins];
    console.log('allTokens', allTokens);

    // 转换为 Token 格式
    return allTokens.map(token => ({
      id: token.address || token.symbol,
      name: token.symbol,
      symbol: token.symbol,
      icon: token.isStable ? 'logo-usd' : 'logo-ethereum',
      balance: token.amount.toString(),
      chain: 'ethereum', // 假设都是以太坊链上的代币
      address: token.address,
      decimals: token.decimals,
      usdValue: token.usdValue,
    }));
  }, [balancesData]);

  // 模拟最近使用的地址
  const recentRecipients: Recipient[] = [
    {
      id: '1',
      address: '0x15fc368f7f8bff752119cda045fce815dc8f053a',
      lastUsed: '5mo ago',
      type: 'recent',
    },
  ];

  // 模拟地址簿
  const addressBookRecipients: Recipient[] = [
    {
      id: '2',
      name: 'Account 2',
      address: '7Btb...LQfr',
      type: 'address_book',
    },
  ];

  // 处理代币选择
  const handleTokenSelect = useCallback((token: Token) => {
    if (!token.balance || parseFloat(token.balance) <= 0) {
      Alert.alert('余额不足', '请选择余额大于0的代币');
      return;
    }
    setSelectedToken(token);
    setCurrentStep(Step.ENTER_RECIPIENT);
  }, []);

  // 处理接收者选择
  const handleRecipientSelect = useCallback((recipient: Recipient) => {
    setRecipientAddress(recipient.address);
    setRecipientName(recipient.name || '');
    setCurrentStep(Step.ENTER_AMOUNT);
  }, []);

  // 处理地址输入完成
  const handleAddressInputComplete = useCallback(() => {
    if (!recipientAddress.trim()) {
      Alert.alert('错误', '请输入接收地址');
      return;
    }
    setCurrentStep(Step.ENTER_AMOUNT);
  }, [recipientAddress]);

  // 处理金额输入
  const handleAmountChange = useCallback((value: string) => {
    // 只允许数字和小数点
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  }, []);

  // 处理最大金额
  const handleMaxAmount = useCallback(() => {
    if (selectedToken) {
      // 减去少量作为手续费缓冲
      const maxAmount = (parseFloat(selectedToken.balance) * 0.99).toFixed(6);
      setAmount(maxAmount);
    }
  }, [selectedToken]);

  // 处理金额输入完成
  const handleAmountInputComplete = useCallback(() => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('错误', '请输入有效的金额');
      return;
    }
    setCurrentStep(Step.CONFIRM);
  }, [amount]);

  // 处理交易确认
  const handleConfirm = useCallback(async () => {
    setIsProcessing(true);

    try {
      // 检查金额是否有效
      if (!selectedToken || !recipientAddress || !amount) {
        throw new Error('交易参数不完整');
      }

      const amountFloat = parseFloat(amount);
      const balanceFloat = parseFloat(selectedToken.balance);

      if (amountFloat > balanceFloat) {
        throw new Error('余额不足');
      }

      // 验证代币地址
      if (!selectedToken.address) {
        throw new Error('未找到代币合约地址');
      }

      // 验证接收地址格式
      const addressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!addressRegex.test(recipientAddress)) {
        throw new Error('请输入有效的以太坊地址（以0x开头的42位字符）');
      }

      // 执行真实转账
      const txHash = await transferToken({
        tokenAddress: selectedToken.address,
        recipient: recipientAddress as `0x${string}`,
        amount: amountFloat,
        decimals: selectedToken.decimals || 18, // 默认使用18位精度，USDC等会使用6位
      });

      // 设置交易哈希和成功状态
      setTransactionHash(txHash);
      setIsSuccess(true);
      setCurrentStep(Step.RESULT);
    } catch (error: any) {
      console.error('转账失败:', error);
      Alert.alert(
        '转账失败',
        error?.message || '请检查您的网络连接和权限设置后重试'
      );
      setIsSuccess(false);
      setCurrentStep(Step.RESULT);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedToken, recipientAddress, amount, transferToken]);

  // 处理返回上一步
  const handleBack = useCallback(() => {
    if (currentStep > Step.SELECT_TOKEN) {
      setCurrentStep(currentStep - 1);
    } else {
      onClose();
    }
  }, [currentStep, onClose]);

  // 处理完成并关闭
  const handleComplete = useCallback(() => {
    // 重置状态
    setCurrentStep(Step.SELECT_TOKEN);
    setSelectedToken(null);
    setRecipientAddress('');
    setRecipientName('');
    setAmount('');
    setIsSuccess(null);
    setTransactionHash('');
    onClose();
  }, [onClose]);

  // 按余额降序排序代币
  const sortedTokens = [...tokens].sort((a, b) => {
    const balanceA = parseFloat(a.balance) || 0;
    const balanceB = parseFloat(b.balance) || 0;
    return balanceB - balanceA;
  });

  // 渲染当前步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case Step.SELECT_TOKEN:
        return (
          <TokenSelectStep
            isLoading={isLoading}
            isError={isError}
            tokens={sortedTokens}
            onTokenSelect={handleTokenSelect}
            onRefetch={() => refetch()}
          />
        );
      case Step.ENTER_RECIPIENT:
        return (
          <RecipientStep
            recipientAddress={recipientAddress}
            recentRecipients={recentRecipients}
            addressBookRecipients={addressBookRecipients}
            onRecipientSelect={handleRecipientSelect}
            onAddressChange={setRecipientAddress}
            onAddressInputComplete={handleAddressInputComplete}
          />
        );
      case Step.ENTER_AMOUNT:
        return (
          <AmountStep
            recipientAddress={recipientAddress}
            amount={amount}
            selectedToken={selectedToken}
            onAmountChange={handleAmountChange}
            onMaxAmount={handleMaxAmount}
          />
        );
      case Step.CONFIRM:
        return (
          <ConfirmStep
            selectedToken={selectedToken}
            recipientAddress={recipientAddress}
            amount={amount}
            isProcessing={isProcessing}
          />
        );
      case Step.RESULT:
        return (
          <ResultStep
            isSuccess={isSuccess}
            selectedToken={selectedToken}
            amount={amount}
            recipientAddress={recipientAddress}
            recipientName={recipientName}
            transactionHash={transactionHash}
          />
        );
      default:
        return null;
    }
  };

  // 获取当前步骤标题
  const getCurrentStepTitle = () => {
    switch (currentStep) {
      case Step.SELECT_TOKEN:
        return 'Select Token';
      case Step.ENTER_RECIPIENT:
        return selectedToken?.symbol || 'Select Recipient';
      case Step.ENTER_AMOUNT:
        return 'Enter Amount';
      case Step.CONFIRM:
        return 'Confirm';
      case Step.RESULT:
        return '';
      default:
        return 'Transfer';
    }
  };

  // 是否显示下一步按钮
  const showNextButton = currentStep < Step.CONFIRM;
  // 是否显示确认按钮
  const showConfirmButton = currentStep === Step.CONFIRM;
  // 是否显示关闭按钮
  const showCloseButton = currentStep === Step.RESULT;

  return (
    <BaseModal
      visible={modal.visible}
      onClose={handleBack}
      title={getCurrentStepTitle()}
    >
      {renderStepContent()}

      {/* 底部操作按钮 */}
      {(showNextButton || showConfirmButton || showCloseButton) && (
        <View className="mt-8">
          {showNextButton && (
            <TouchableOpacity
              className="bg-indigo-600 rounded-xl p-4 items-center justify-center"
              onPress={
                currentStep === Step.ENTER_RECIPIENT
                  ? handleAddressInputComplete
                  : handleAmountInputComplete
              }
            >
              <Text className="text-white font-bold text-lg">Next</Text>
            </TouchableOpacity>
          )}

          {showConfirmButton && (
            <TouchableOpacity
              className="bg-indigo-600 rounded-xl p-4 items-center justify-center"
              onPress={handleConfirm}
              disabled={isProcessing}
            >
              <Text className="text-white font-bold text-lg">
                Confirm & Send
              </Text>
            </TouchableOpacity>
          )}

          {showCloseButton && (
            <TouchableOpacity
              className="bg-indigo-600 rounded-xl p-4 items-center justify-center"
              onPress={handleComplete}
            >
              <Text className="text-white font-bold text-lg">Close</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </BaseModal>
  );
};

export const TransferModal = NiceModal.create(TransferModalComponent);
