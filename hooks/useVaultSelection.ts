import { useState, useCallback, useMemo } from 'react';
import { useProtocolService } from '@/services/protocolService';
import { VaultOption } from '@/interfaces/home';
import { vaultOptions } from '@/utils/home';
import useMultiChainWallet from './useMultiChainWallet';

interface VaultSelectionData {
  vaultOptions: VaultOption[];

  // Loading Status
  isLoadingProtocols: boolean;

  // Cache Status
  cacheStats: { size: number; keys: string[] };

  // Operation Methods
  loadProtocolData: () => Promise<void>;
}

export const useVaultSelection = (): VaultSelectionData => {
  const { getMultipleProtocolsInfo, aprStore } = useProtocolService();
  const { activeWallet } = useMultiChainWallet();
  // State Management
  const [vaultOptionsWithData, setVaultOptionsWithData] = useState<
    VaultOption[]
  >([]);
  const [isLoadingProtocols, setIsLoadingProtocols] = useState(false);

  // Load Protocol Data
  const loadProtocolData = useCallback(async () => {
    setIsLoadingProtocols(true);
    try {
      // Get All Protocol Data
      const protocolNames = vaultOptions.map(vault => vault.name);
      const protocolData = await getMultipleProtocolsInfo(
        protocolNames,
        activeWallet?.address,
        false
      );
      // Integrate Protocol Data Into vaultOptions, Only Keep Vaults With Protocol Data
      const updatedVaultOptions = vaultOptions
        .map(vault => {
          const protocolInfo = protocolData.find(
            p => p.name.toLowerCase() === vault.name.toLowerCase()
          );

          if (protocolInfo) {
            return {
              ...vault,
              protocolData: {
                apyDisplay: protocolInfo.apyDisplay,
                description: protocolInfo.description,
                tvl: protocolInfo.tvl,
                risk: protocolInfo.risk,
              },
            };
          }

          return null; // Return null if there is no protocol data
        })
        .filter((vault): vault is VaultOption => vault !== null); // Filter Out Null Values

      setVaultOptionsWithData(updatedVaultOptions);
    } catch (error) {
      console.error('Failed to load protocol data:', error);
    } finally {
      setIsLoadingProtocols(false);
    }
  }, [getMultipleProtocolsInfo]);

  const cacheStats = useMemo(() => aprStore.getCacheStats(), [aprStore]);

  return {
    // Vault Options Data (With Protocol Data)
    vaultOptions: vaultOptionsWithData,

    // Loading Status
    isLoadingProtocols,

    // Cache Status
    cacheStats,

    // Operation Methods
    loadProtocolData,
  };
};

export default useVaultSelection;
