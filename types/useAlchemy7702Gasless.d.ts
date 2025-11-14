import type { Chain } from 'viem';
import type { Authorization } from 'viem/experimental';
import type { SmartAccountSigner } from '@aa-sdk/core';
import type { createModularAccountV2Client } from '@account-kit/smart-contracts';
import type { hashAuthorization } from 'viem/utils';

export type ModularAccountClient = Awaited<
  ReturnType<typeof createModularAccountV2Client>
>;

export type AuthorizationInput = Parameters<typeof hashAuthorization>[0];

export type AuthorizationCapableSigner = SmartAccountSigner & {
  signAuthorization: (
    unsignedAuth: AuthorizationInput
  ) => Promise<Authorization<number, true>>;
};

export type GaslessCall = {
  to: `0x${string}`;
  data?: `0x${string}`;
  value?: bigint;
};

export interface UseAlchemy7702GaslessOptions {
  chain: Chain;
  apiKey: string;
  policyId: string;
  implementationAddress: `0x${string}`;
}

export interface UseAlchemy7702GaslessReturn {
  isInitializing: boolean;
  isSending: boolean;
  error: string | null;
  authorization: Authorization<number, true> | null;
  smartAccountAddress: `0x${string}` | null;
  sendGaslessTransaction: (calls: GaslessCall[]) => Promise<`0x${string}`>;
  // refreshAuthorization: () => Promise<Authorization<number, true>>;
}
