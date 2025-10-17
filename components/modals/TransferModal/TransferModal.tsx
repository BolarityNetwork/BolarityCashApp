import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { BaseModal } from '@/components/common/BaseModal';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { useUserBalances } from '@/api/account';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';
import { useTransferToken } from '@/hooks/transactions/useTransferToken';
import {
  useAddressBookStore,
  AddressBookItem,
} from '@/stores/addressBookStore';
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

  // Address book state management
  const { addresses, recentAddresses, addAddress, addRecentAddress } =
    useAddressBookStore();

  // Get user balance data
  const {
    data: balancesData,
    isLoading,
    isError,
    refetch,
  } = useUserBalances(walletAddress, !!walletAddress);

  // State management
  const [currentStep, setCurrentStep] = useState<Step>(Step.SELECT_TOKEN);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [showAddToAddressBook, setShowAddToAddressBook] =
    useState<boolean>(false);

  // Extract real token list from balance data
  const tokens: Token[] = React.useMemo(() => {
    if (!balancesData?.wallet) return [];

    // Merge assets and stable tokens
    const assets = balancesData.wallet.assets || [];
    const stablecoins = balancesData.wallet.stable || [];
    const allTokens = [...assets, ...stablecoins];
    console.log('allTokens', allTokens);

    // Convert to Token format
    return allTokens.map(token => ({
      id: token.address || token.symbol,
      name: token.symbol,
      symbol: token.symbol,
      icon: token.isStable ? 'logo-usd' : 'logo-ethereum',
      balance: token.amount.toString(),
      chain: 'ethereum', // Assume all tokens are on Ethereum chain
      address: token.address,
      decimals: token.decimals,
      usdValue: token.usdValue,
    }));
  }, [balancesData]);

  // Convert address book data to Recipient format
  const addressBookRecipients: Recipient[] = useMemo(() => {
    return addresses.map((item: AddressBookItem) => ({
      id: item.id,
      name: item.name,
      address: item.address,
      type: 'address_book' as const,
    }));
  }, [addresses]);

  // Convert recent addresses to Recipient format
  const recentRecipients: Recipient[] = useMemo(() => {
    return recentAddresses.map((item, index) => ({
      id: `recent-${index}`,
      name: item.name,
      address: item.address,
      lastUsed: item.lastUsed,
      type: 'recent' as const,
    }));
  }, [recentAddresses]);

  // Handle token selection
  const handleTokenSelect = useCallback((token: Token) => {
    if (!token.balance || parseFloat(token.balance) <= 0) {
      Alert.alert(
        'Insufficient Balance',
        'Please select a token with balance greater than 0'
      );
      return;
    }
    setSelectedToken(token);
    setCurrentStep(Step.ENTER_RECIPIENT);
  }, []);

  // Handle recipient selection
  const handleRecipientSelect = useCallback((recipient: Recipient) => {
    setRecipientAddress(recipient.address);
    setRecipientName(recipient.name || '');
    setCurrentStep(Step.ENTER_AMOUNT);
  }, []);

  // Handle address input completion
  const handleAddressInputComplete = useCallback(() => {
    if (!recipientAddress.trim()) {
      Alert.alert('Error', 'Please enter recipient address');
      return;
    }
    setCurrentStep(Step.ENTER_AMOUNT);
  }, [recipientAddress]);

  // Handle amount input
  const handleAmountChange = useCallback((value: string) => {
    // Only allow numbers and decimal points
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  }, []);

  // Handle max amount
  const handleMaxAmount = useCallback(() => {
    if (selectedToken) {
      // Subtract small amount as fee buffer
      const maxAmount = (parseFloat(selectedToken.balance) * 0.99).toFixed(6);
      setAmount(maxAmount);
    }
  }, [selectedToken]);

  // Handle amount input completion
  const handleAmountInputComplete = useCallback(() => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    setCurrentStep(Step.CONFIRM);
  }, [amount]);

  // Handle transaction confirmation
  const handleConfirm = useCallback(async () => {
    setIsProcessing(true);

    try {
      // Check if amount is valid
      if (!selectedToken || !recipientAddress || !amount) {
        throw new Error('Incomplete transaction parameters');
      }

      const amountFloat = parseFloat(amount);
      const balanceFloat = parseFloat(selectedToken.balance);

      if (amountFloat > balanceFloat) {
        throw new Error('Insufficient Balance');
      }

      // Validate recipient address format
      const addressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!addressRegex.test(recipientAddress)) {
        throw new Error(
          'Please enter a valid Ethereum address (42 characters starting with 0x)'
        );
      }

      // Execute real transfer
      const txHash = await transferToken({
        tokenAddress: selectedToken.address,
        recipient: recipientAddress as `0x${string}`,
        amount: amountFloat,
        decimals: selectedToken.decimals || 18, // Default 18 decimals, USDC uses 6
      });

      // Set transaction hash and success state
      setTransactionHash(txHash);
      setIsSuccess(true);

      // Add to recent addresses
      addRecentAddress(recipientAddress, recipientName);

      // Check if recipient address is already in address book
      const isInAddressBook = addresses.some(
        item => item.address.toLowerCase() === recipientAddress.toLowerCase()
      );

      // If not in address book and user manually entered address, prompt to add to address book
      if (!isInAddressBook && !recipientName) {
        setShowAddToAddressBook(true);
      }

      setCurrentStep(Step.RESULT);
    } catch (error: any) {
      console.error('Transfer Failed:', error);
      Alert.alert(
        'Transfer Failed',
        error?.message ||
          'Please check your network connection and permissions, then try again'
      );
      setIsSuccess(false);
      setCurrentStep(Step.RESULT);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedToken, recipientAddress, amount, transferToken]);

  // Handle going back
  const handleBack = useCallback(() => {
    if (currentStep > Step.SELECT_TOKEN) {
      setCurrentStep(currentStep - 1);
    } else {
      onClose();
    }
  }, [currentStep, onClose]);

  // Handle adding to address book
  const handleAddToAddressBook = useCallback(
    (name: string) => {
      if (name.trim() && recipientAddress) {
        try {
          addAddress(name.trim(), recipientAddress);
          setShowAddToAddressBook(false);
          Alert.alert('Success', 'Address has been added to address book');
        } catch (_error) {
          Alert.alert('Error', 'Failed to add address, please try again');
        }
      }
    },
    [recipientAddress, addAddress]
  );

  // Handle skipping adding to address book
  const handleSkipAddToAddressBook = useCallback(() => {
    setShowAddToAddressBook(false);
  }, []);

  // Handle managing address book
  const handleManageAddressBook = useCallback(() => {
    // Close transfer modal
    onClose();
    // Navigate to address book management page
    router.push('/settings/address-book');
  }, [onClose]);

  // Handle completion and close
  const handleComplete = useCallback(() => {
    // Reset state
    setCurrentStep(Step.SELECT_TOKEN);
    setSelectedToken(null);
    setRecipientAddress('');
    setRecipientName('');
    setAmount('');
    setIsSuccess(null);
    setTransactionHash('');
    setShowAddToAddressBook(false);
    onClose();
  }, [onClose]);

  // Sort tokens by balance in descending order
  const sortedTokens = [...tokens].sort((a, b) => {
    const balanceA = parseFloat(a.balance) || 0;
    const balanceB = parseFloat(b.balance) || 0;
    return balanceB - balanceA;
  });

  // Render current step content
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
            onManageAddressBook={handleManageAddressBook}
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
            showAddToAddressBook={showAddToAddressBook}
            onAddToAddressBook={handleAddToAddressBook}
            onSkipAddToAddressBook={handleSkipAddToAddressBook}
          />
        );
      default:
        return null;
    }
  };

  // Get current step title
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

  // Whether to show next button (not needed for token selection step)
  const showNextButton =
    currentStep > Step.SELECT_TOKEN && currentStep < Step.CONFIRM;
  // Whether to show confirm button
  const showConfirmButton = currentStep === Step.CONFIRM;
  // Whether to show close button
  const showCloseButton = currentStep === Step.RESULT;

  return (
    <BaseModal
      visible={modal.visible}
      onClose={handleBack}
      title={getCurrentStepTitle()}
    >
      {renderStepContent()}

      {/* Bottom action buttons */}
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
