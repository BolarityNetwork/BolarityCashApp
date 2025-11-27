import { useCallback, useMemo, useRef, useState } from 'react';
import { useEmbeddedEthereumWallet } from '@privy-io/expo';
import { Hex, createWalletClient, custom } from 'viem';
import { hashAuthorization, parseEther } from 'viem/utils';
import type { Authorization } from 'viem/experimental';
import { WalletClientSigner } from '@aa-sdk/core';
import { createModularAccountV2Client } from '@account-kit/smart-contracts';
import { alchemy } from '@account-kit/infra';
import type {
  AuthorizationCapableSigner,
  AuthorizationInput,
  GaslessCall,
  ModularAccountClient,
  UseAlchemy7702GaslessOptions,
  UseAlchemy7702GaslessReturn,
} from '@/types/useAlchemy7702Gasless';
import { splitSignature } from '@/utils/blockchain/signature';
import { ensureBiometricsBeforeTx } from '@/utils/ensureBiometricsBeforeTx';

export const useAlchemy7702Gasless = ({
  chain,
  apiKey,
  policyId,
  implementationAddress,
}: UseAlchemy7702GaslessOptions): UseAlchemy7702GaslessReturn => {
  const { wallets } = useEmbeddedEthereumWallet();

  const [authorization, setAuthorization] = useState<Authorization<
    number,
    true
  > | null>(null);

  const [smartAccountAddress, setSmartAccountAddress] = useState<
    `0x${string}` | null
  >(null);

  const [isInitializing, setIsInitializing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletRef = useMemo(() => wallets?.[0], [wallets]);

  const signerRef = useRef<AuthorizationCapableSigner | null>(null);
  const modularClientRef = useRef<ModularAccountClient | null>(null);

  // ----------------------------------------------------------
  // STEP 1: 创建 7702 signer
  // ----------------------------------------------------------
  const ensureSigner =
    useCallback(async (): Promise<AuthorizationCapableSigner> => {
      if (signerRef.current) return signerRef.current;
      if (!walletRef) throw new Error('No embedded wallet');

      const provider = await walletRef.getProvider();

      const walletClient = createWalletClient({
        account: walletRef.address as Hex,
        chain,
        transport: custom(provider),
      });

      const baseSigner = new WalletClientSigner(walletClient, 'privy');

      const signAuthorization = async (
        unsignedAuth: AuthorizationInput
      ): Promise<Authorization<number, true>> => {
        const target =
          (unsignedAuth as any).address ||
          (unsignedAuth as any).contractAddress;

        if (!target) throw new Error('Missing authorization target');

        const request = {
          address: target,
          chainId: unsignedAuth.chainId,
          nonce: unsignedAuth.nonce,
        };

        const signature = (await provider.request({
          method: 'secp256k1_sign',
          params: [hashAuthorization(request)],
        })) as `0x${string}`;

        const { r, s, v } = splitSignature(signature);

        return { ...request, r, s, v };
      };

      const signer: AuthorizationCapableSigner = {
        ...baseSigner,
        signAuthorization,
      };

      signerRef.current = signer;
      return signer;
    }, [walletRef, chain]);

  // ----------------------------------------------------------
  // STEP 2: 创建 7702 Authorization
  // ----------------------------------------------------------
  const ensureAuthorization = useCallback(
    async (force = false) => {
      if (authorization && !force) return authorization;
      if (!walletRef) throw new Error('No embedded wallet');

      const provider = await walletRef.getProvider();

      const walletClient = createWalletClient({
        account: walletRef.address as Hex,
        chain,
        transport: custom(provider),
      });

      const unsignedAuth = await walletClient.prepareAuthorization({
        account: walletRef.address as `0x${string}`,
        contractAddress: implementationAddress,
        chainId: chain.id,
      });

      const signer = await ensureSigner();
      const signed = await signer.signAuthorization(unsignedAuth);

      setAuthorization(signed);
      return signed;
    },
    [authorization, walletRef, chain, implementationAddress, ensureSigner]
  );

  // ----------------------------------------------------------
  // STEP 3: 创建 Modular Account V2 Client (mode: 7702)
  // ----------------------------------------------------------
  const ensureModularClient = useCallback(async () => {
    if (modularClientRef.current) return modularClientRef.current;

    setIsInitializing(true);
    setError(null);

    try {
      const signer = await ensureSigner();
      await ensureAuthorization();

      const client = await createModularAccountV2Client({
        chain,
        signer,
        transport: alchemy({ apiKey }),
        mode: '7702',
        policyId,
      });

      const accountAddress = await signer.getAddress();
      setSmartAccountAddress(accountAddress as `0x${string}`);

      modularClientRef.current = client;
      return client;
    } catch (err: any) {
      console.error(99999, { err });
      setError(err.message || 'Failed to initialize 7702 client');
      throw err;
    } finally {
      setIsInitializing(false);
    }
  }, [apiKey, chain, ensureAuthorization, ensureSigner, policyId]);

  // ----------------------------------------------------------
  // STEP 4: 发送 gasless UserOperation
  // ----------------------------------------------------------
  const sendGaslessTransaction = useCallback(
    async (calls: GaslessCall[]) => {
      if (!calls.length) throw new Error('Missing calls');

      setIsSending(true);
      setError(null);

      try {
        // Require biometric authentication before transaction
        await ensureBiometricsBeforeTx();

        const client = await ensureModularClient();
        const operation = await client.sendUserOperation({
          uo: {
            target: calls[0].to,
            data: calls[0].data ?? '0x',
            value: parseEther(calls[0].value?.toString() ?? '0'),
          },
        });
        console.log(77777, { operation });
        return operation.hash;
      } catch (err: any) {
        console.error(88888, { err });
        setError(err.message || 'Failed to send gasless UO');
        throw err;
      } finally {
        setIsSending(false);
      }
    },
    [ensureModularClient]
  );

  return {
    isInitializing,
    isSending,
    error,
    authorization,
    smartAccountAddress,
    sendGaslessTransaction,
    // refreshAuthorization: () => ensureAuthorization(true),
  };
};
