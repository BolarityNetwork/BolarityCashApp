import { useEffect } from 'react';
import { useCompoundWallet } from './useCompoundWallet';
import { CHAIN_IDS } from '@/utils/blockchain/chainIds';
import { protocolServiceManager } from '@/services/protocolService';
import { CompoundProtocolService } from '@/services/protocols/CompoundProtocolService';

/**
 * Hook to initialize and inject wallet instances into protocol services
 * This ensures that protocol services have access to the necessary wallet functionality
 */
export const useProtocolWallet = () => {
  // Initialize Compound wallet
  const compoundWallet = useCompoundWallet(CHAIN_IDS.BASE);

  // Inject Compound wallet into Compound service
  useEffect(() => {
    const compoundService = protocolServiceManager.getService('compound');
    if (compoundService && compoundService instanceof CompoundProtocolService) {
      compoundService.setCompoundWallet(compoundWallet);
      console.log('✅ Compound wallet injected into Compound service');
    }
  }, [compoundWallet]);

  return {
    compoundWallet,
  };
};

export default useProtocolWallet;
