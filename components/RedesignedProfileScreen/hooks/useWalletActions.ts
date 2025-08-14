import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useMultiChainWallet } from '../../../hooks/useMultiChainWallet';

export function useWalletActions() {
  const {
    activeWalletType,
    activeWallet,
    signMessage,
    sendTestTransaction,
    signTestTransaction,
  } = useMultiChainWallet();

  const copyToClipboard = useCallback(async (address: string, walletType: string) => {
    try {
      await Clipboard.setStringAsync(address);
      Alert.alert('Copy Success', `${walletType} address copied to clipboard`);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy address');
    }
  }, []);

  const handleSignMessage = useCallback(async (onResult: (message: string) => void) => {
    if (!activeWallet.address) {
      Alert.alert('Error', 'No wallet available');
      return;
    }

    try {
      const message = `Hello from Bolarity! Timestamp: ${Date.now()}`;
      const signature = await signMessage(message);
      const result = `${activeWalletType.toUpperCase()}: ${signature}`;
      onResult(result);
      Alert.alert("Success", `${activeWalletType.toUpperCase()} message signed successfully!`);
    } catch (error: any) {
      Alert.alert("Error", `Failed to sign message: ${error.message}`);
    }
  }, [activeWallet, activeWalletType, signMessage]);

  const handleSendTransaction = useCallback(async (onResult: (tx: string) => void) => {
    if (!activeWallet.address) {
      Alert.alert('Error', 'No wallet available');
      return;
    }

    try {
      const txHash = await sendTestTransaction();
      const result = `${activeWalletType.toUpperCase()} TX: ${txHash}`;
      onResult(result);
      Alert.alert("Success", `${activeWalletType.toUpperCase()} test transaction sent successfully!`);
    } catch (error: any) {
      Alert.alert("Error", `Failed to send transaction: ${error.message}`);
    }
  }, [activeWallet, activeWalletType, sendTestTransaction]);

  const handleSignTransaction = useCallback(async (onResult: (tx: string) => void) => {
    if (!activeWallet.address) {
      Alert.alert('Error', 'No wallet available');
      return;
    }

    try {
      const signedTx = await signTestTransaction();
      const result = `${activeWalletType.toUpperCase()} SIGNED: ${JSON.stringify(signedTx).substring(0, 100)}...`;
      onResult(result);
      Alert.alert("Success", `${activeWalletType.toUpperCase()} test transaction signed successfully!`);
    } catch (error: any) {
      Alert.alert("Error", `Failed to sign transaction: ${error.message}`);
    }
  }, [activeWallet, activeWalletType, signTestTransaction]);

  return {
    copyToClipboard,
    handleSignMessage,
    handleSendTransaction, 
    handleSignTransaction,
    canPerformActions: !!activeWallet.address,
  };
}