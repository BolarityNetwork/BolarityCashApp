// Define token type
export interface Token {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  balance: string;
  chain: string;
  address?: string;
  decimals?: number;
  usdValue?: number;
}

// Define recipient address type
export interface Recipient {
  id: string;
  name?: string;
  address: string;
  lastUsed?: string;
  type: 'recent' | 'address_book';
}

// Define step enum
export enum Step {
  SELECT_TOKEN,
  ENTER_RECIPIENT,
  ENTER_AMOUNT,
  CONFIRM,
  RESULT,
}
