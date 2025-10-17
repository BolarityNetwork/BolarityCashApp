import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { BaseModal } from '@/components/common/BaseModal';
import Icon from 'react-native-vector-icons/Ionicons';
import NiceModal, { useModal } from '@ebay/nice-modal-react';

// 定义代币类型
interface Token {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  balance: string;
  chain: string;
}

// 定义接收地址类型
interface Recipient {
  id: string;
  name?: string;
  address: string;
  lastUsed?: string;
  type: 'recent' | 'address_book';
}

interface TransferModalProps {}

const TransferModalComponent: React.FC<TransferModalProps> = () => {
  const modal = useModal();
  const onClose = () => modal.hide();
  // 步骤定义
  enum Step {
    SELECT_TOKEN,
    ENTER_RECIPIENT,
    ENTER_AMOUNT,
    CONFIRM,
    RESULT,
  }

  // 状态管理
  const [currentStep, setCurrentStep] = useState<Step>(Step.SELECT_TOKEN);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [transactionHash, setTransactionHash] = useState<string>('');

  // 模拟代币数据
  const tokens: Token[] = [
    {
      id: 'btc',
      name: 'Bitcoin',
      symbol: 'BTC',
      icon: 'logo-bitcoin',
      balance: '0',
      chain: 'bitcoin',
    },
    {
      id: 'eth',
      name: 'Ethereum',
      symbol: 'ETH',
      icon: 'logo-ethereum',
      balance: '0',
      chain: 'ethereum',
    },
    {
      id: 'eth-erc20',
      name: 'Ethereum',
      symbol: 'ETH',
      icon: 'logo-ethereum',
      balance: '0',
      chain: 'ethereum-erc20',
    },
    {
      id: 'polygon',
      name: 'Polygon',
      symbol: 'POL',
      icon: 'logo-usd',
      balance: '0',
      chain: 'polygon',
    },
    {
      id: 'solana',
      name: 'Solana',
      symbol: 'SOL',
      icon: 'logo-usd',
      balance: '0',
      chain: 'solana',
    },
    {
      id: 'sui',
      name: 'Sui',
      symbol: 'SUI',
      icon: 'logo-usd',
      balance: '0',
      chain: 'sui',
    },
  ];

  // 模拟最近使用的地址
  const recentRecipients: Recipient[] = [
    {
      id: '1',
      address: '0x65423AF1Faf6B58B8206E09270499039E711B5ca',
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
      setAmount(selectedToken.balance);
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
      // 模拟交易处理
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 模拟交易成功
      setTransactionHash(
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      );
      setIsSuccess(true);
      setCurrentStep(Step.RESULT);
    } catch (error) {
      console.log(error);
      setIsSuccess(false);
      setCurrentStep(Step.RESULT);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedToken, recipientAddress, amount]);

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

  // 渲染代币选择步骤
  const renderTokenSelectStep = () => {
    return (
      <View>
        {/* 搜索框 */}
        <View className="flex-row items-center bg-gray-100 rounded-lg p-3 mb-6">
          <Icon name="search" size={20} color="#64748b" />
          <TextInput
            className="ml-2 flex-1 text-gray-800"
            placeholder="Search..."
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* 代币列表 */}
        {tokens.map(token => (
          <TouchableOpacity
            key={token.id}
            className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-3"
            onPress={() => handleTokenSelect(token)}
          >
            <View className="flex-row items-center">
              <View
                className={`w-10 h-10 rounded-full flex items-center justify-center mr-3`}
              >
                <Icon name={token.icon as any} size={24} color="#64748b" />
              </View>
              <View>
                <Text className="font-bold text-gray-800">{token.name}</Text>
                <Text className="text-sm text-gray-500">
                  {token.balance} {token.symbol}
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // 渲染接收者输入步骤
  const renderRecipientStep = () => {
    return (
      <View>
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-500 mb-1">
            To: username or address
          </Text>
          <TextInput
            className="bg-gray-100 rounded-lg p-4 text-gray-800"
            placeholder="Enter address or username"
            placeholderTextColor="#94a3b8"
            value={recipientAddress}
            onChangeText={setRecipientAddress}
            autoCapitalize="none"
            autoCorrect={false}
            editable={true}
            selectTextOnFocus={true}
          />
          <TouchableOpacity className="absolute right-3 top-9">
            <Icon name="qr-code-outline" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* 最近使用 */}
        {recentRecipients.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <Icon name="time-outline" size={16} color="#64748b" />
              <Text className="ml-1 text-sm font-medium text-gray-500">
                Recently Used
              </Text>
            </View>
            {recentRecipients.map(recipient => (
              <TouchableOpacity
                key={recipient.id}
                className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-3"
                onPress={() => handleRecipientSelect(recipient)}
              >
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <Icon name="wallet-outline" size={16} color="#64748b" />
                  </View>
                  <View>
                    <Text className="font-medium text-gray-800">
                      {recipient.address}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {recipient.lastUsed}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 地址簿 */}
        {addressBookRecipients.length > 0 && (
          <View>
            <View className="flex-row items-center mb-3">
              <Icon name="book-outline" size={16} color="#64748b" />
              <Text className="ml-1 text-sm font-medium text-gray-500">
                Address Book
              </Text>
            </View>
            {addressBookRecipients.map(recipient => (
              <TouchableOpacity
                key={recipient.id}
                className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-3"
                onPress={() => handleRecipientSelect(recipient)}
              >
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <Text className="font-bold text-gray-600">
                      {recipient.name?.charAt(0) || 'A'}
                    </Text>
                  </View>
                  <View>
                    <Text className="font-medium text-gray-800">
                      {recipient.name || 'Unknown'}
                    </Text>
                    <Text className="text-xs font-mono text-gray-500">
                      {recipient.address}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  // 渲染金额输入步骤
  const renderAmountStep = () => {
    return (
      <View className="flex-1">
        <View className="text-center mb-8">
          <Text className="text-sm text-gray-500 mb-1">
            To: {recipientAddress}
          </Text>
          <TextInput
            className="text-4xl font-bold text-gray-800 text-center"
            placeholder="0"
            placeholderTextColor="#94a3b8"
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="decimal-pad"
          />
          <Text className="text-2xl font-medium text-gray-700">
            {selectedToken?.symbol}
          </Text>
          <Text className="text-gray-500">~${0}</Text>
        </View>

        <View className="flex-row justify-between items-center bg-white rounded-xl p-4 mb-8">
          <Text className="text-gray-500">Available To Send</Text>
          <TouchableOpacity
            className="text-indigo-600 font-medium"
            onPress={handleMaxAmount}
          >
            Max
          </TouchableOpacity>
        </View>

        {/* 数字键盘 */}
        <View className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <TouchableOpacity
              key={num}
              className="bg-gray-100 rounded-lg p-4 text-center"
              onPress={() => handleAmountChange(amount + num)}
            >
              <Text className="text-xl font-medium text-gray-800">{num}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            className="bg-gray-100 rounded-lg p-4 text-center"
            onPress={() => handleAmountChange(amount + '.')}
            disabled={amount.includes('.')}
          >
            <Text className="text-xl font-medium text-gray-800">.</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-gray-100 rounded-lg p-4 text-center"
            onPress={() => handleAmountChange(amount + '0')}
          >
            <Text className="text-xl font-medium text-gray-800">0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-gray-100 rounded-lg p-4 text-center"
            onPress={() => handleAmountChange(amount.slice(0, -1))}
          >
            <Icon name="backspace-outline" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 渲染确认步骤
  const renderConfirmStep = () => {
    return (
      <View className="flex-1 justify-between">
        <View>
          <View className="bg-white rounded-xl p-5 mb-4">
            <Text className="text-sm text-gray-500 mb-1">Token</Text>
            <View className="flex-row items-center">
              <Icon
                name={
                  (selectedToken?.icon ||
                    'swap-horizontal') as 'swap-horizontal'
                }
                size={24}
                color="#64748b"
                style={{ marginRight: 8 }}
              />
              <Text className="font-bold text-lg text-gray-800">
                {selectedToken?.name}
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-xl p-5 mb-4">
            <Text className="text-sm text-gray-500 mb-1">Recipient</Text>
            <Text className="font-medium text-gray-800">
              {recipientAddress}
            </Text>
          </View>

          <View className="bg-white rounded-xl p-5 mb-4">
            <Text className="text-sm text-gray-500 mb-1">Amount</Text>
            <Text className="font-bold text-lg text-gray-800">
              {amount} {selectedToken?.symbol}
            </Text>
            <Text className="text-sm text-gray-500">~${0}</Text>
          </View>

          <View className="bg-white rounded-xl p-5">
            <Text className="text-sm text-gray-500 mb-1">Network Fee</Text>
            <Text className="font-medium text-gray-800">
              ~0.0001 {selectedToken?.symbol}
            </Text>
          </View>
        </View>

        {isProcessing ? (
          <ActivityIndicator size="large" color="#6366f1" className="py-4" />
        ) : null}
      </View>
    );
  };

  // 渲染结果步骤
  const renderResultStep = () => {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <View
          className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}
        >
          <Icon
            name={isSuccess ? 'checkmark' : 'close'}
            size={40}
            color={isSuccess ? '#22c55e' : '#ef4444'}
          />
        </View>

        <Text className="text-2xl font-bold text-gray-800 mb-3">
          {isSuccess ? 'Sent!' : 'Failed'}
        </Text>

        {isSuccess && (
          <Text className="text-center text-gray-600 mb-6">
            {amount} {selectedToken?.symbol} was successfully sent to
            {recipientName ? ` ${recipientName} ` : ' '}({recipientAddress})
          </Text>
        )}

        {!isSuccess && (
          <Text className="text-center text-gray-600 mb-6">
            Transaction failed. Please try again later.
          </Text>
        )}

        {isSuccess && transactionHash && (
          <TouchableOpacity className="text-indigo-600 font-medium mb-12">
            View transaction
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // 渲染当前步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case Step.SELECT_TOKEN:
        return renderTokenSelectStep();
      case Step.ENTER_RECIPIENT:
        return renderRecipientStep();
      case Step.ENTER_AMOUNT:
        return renderAmountStep();
      case Step.CONFIRM:
        return renderConfirmStep();
      case Step.RESULT:
        return renderResultStep();
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
