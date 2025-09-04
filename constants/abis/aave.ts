// AAVE 相关 ABI 常量

// AAVE Pool 合约 ABI
export const AAVE_POOL_ABI = [
  // 核心方法
  'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
  'function withdraw(address asset, uint256 amount, address to) returns (uint256)',

  // 查询方法
  'function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)',
  'function getReserveData(address asset) external view returns (uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt)',
  'function getReserveAToken(address asset) external view returns (address)',

  // 配置方法
  'function getConfiguration(address asset) external view returns (uint256)',
  'function getAddressesProvider() external view returns (address)',
] as const;

// ERC20 代币 ABI
export const AAVE_ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)',
] as const;

// AAVE 事件 ABI
export const AAVE_EVENTS = {
  DEPOSIT:
    'event Deposit(address indexed reserve, address indexed user, address indexed onBehalfOf, uint256 amount, uint16 referral)',
  WITHDRAW:
    'event Withdraw(address indexed reserve, address indexed user, address indexed to, uint256 amount)',
  BORROW:
    'event Borrow(address indexed reserve, address indexed user, address indexed onBehalfOf, uint256 amount, uint256 borrowRate, uint16 referral)',
  REPAY:
    'event Repay(address indexed reserve, address indexed user, address indexed repayer, uint256 amount)',
} as const;

// AAVE 函数选择器
export const AAVE_FUNCTION_SELECTORS = {
  SUPPLY: '0x617ba037',
  WITHDRAW: '0x69328dec',
  GET_USER_ACCOUNT_DATA: '0x35ea6a75',
  GET_RESERVE_DATA: '0x35ea6a75',
  GET_RESERVE_ATOKEN: '0x35ea6a75',
  GET_CONFIGURATION: '0x35ea6a75',
  GET_ADDRESSES_PROVIDER: '0x35ea6a75',
} as const;
