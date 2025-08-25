// components/MultiChainWalletProvider.tsx
import React from 'react';
import {
  MultiChainWalletContext,
  useMultiChainWalletState,
} from '@/hooks/useMultiChainWallet';

interface MultiChainWalletProviderProps {
  children: React.ReactNode;
}

export function MultiChainWalletProvider({
  children,
}: MultiChainWalletProviderProps) {
  const walletState = useMultiChainWalletState();

  return (
    <MultiChainWalletContext.Provider value={walletState}>
      {children}
    </MultiChainWalletContext.Provider>
  );
}
