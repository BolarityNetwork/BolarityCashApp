import { useEffect } from 'react';
import { useCompoundWallet } from './useCompoundWallet';
import { useAaveWallet } from './useAaveWallet';
import { CHAIN_IDS } from '@/utils/blockchain/chainIds';
import { protocolServiceManager } from '@/services/protocolService';
import { CompoundProtocolService } from '@/services/protocols/CompoundProtocolService';
import { AaveProtocolService } from '@/services/protocols/AaveProtocolService';

/**
 * Hook to initialize and inject wallet instances into protocol services
 * This ensures that protocol services have access to the necessary wallet functionality
 */
export const useProtocolWallet = () => {
  // Initialize Compound wallet
  const compoundWallet = useCompoundWallet(CHAIN_IDS.BASE);

  // Initialize Aave wallet
  const aaveWallet = useAaveWallet('base');

  // Inject Compound wallet into Compound service
  useEffect(() => {
    const compoundService = protocolServiceManager.getService('compound');
    if (compoundService && compoundService instanceof CompoundProtocolService) {
      compoundService.setCompoundWallet(compoundWallet);
      console.log('✅ Compound wallet injected into Compound service');
    }
  }, [compoundWallet]);

  // Inject Aave wallet into Aave service
  useEffect(() => {
    const aaveService = protocolServiceManager.getService('aave');
    if (aaveService && aaveService instanceof AaveProtocolService) {
      aaveService.setAaveWallet(aaveWallet);
      console.log('✅ Aave wallet injected into Aave service');
    }
  }, [aaveWallet]);

  return {
    compoundWallet,
    aaveWallet,
  };
};

export default useProtocolWallet;
