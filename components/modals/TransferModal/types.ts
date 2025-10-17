// 定义代币类型
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

// 定义接收地址类型
export interface Recipient {
  id: string;
  name?: string;
  address: string;
  lastUsed?: string;
  type: 'recent' | 'address_book';
}

// 定义步骤枚举
export enum Step {
  SELECT_TOKEN,
  ENTER_RECIPIENT,
  ENTER_AMOUNT,
  CONFIRM,
  RESULT,
}
