import { Hex } from 'viem';

export function splitSignature(signature: `0x${string}`) {
  if (!signature || signature.length < 130)
    throw new Error('Invalid signature from Privy');

  let normalized = signature.startsWith('0x') ? signature : `0x${signature}`;
  if (normalized.length === 130) normalized = `${normalized}1b`;

  const r = `0x${normalized.slice(2, 66)}` as Hex;
  const s = `0x${normalized.slice(66, 130)}` as Hex;
  const v = BigInt(`0x${normalized.slice(130, 132)}`);

  return { r, s, v };
}
