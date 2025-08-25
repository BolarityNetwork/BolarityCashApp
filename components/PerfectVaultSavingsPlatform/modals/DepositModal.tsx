// components/PerfectVaultSavingsPlatform/modals/DepositModal.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ethers } from 'ethers';
import ProtocolLogo from '../components/ProtocolLogo';
import VaultLogo from '../components/VaultLogo';
import {
  getProtocolFromVaultName,
  VaultProduct,
  VaultOption,
  TimeVaultOption,
} from '../constants';
import { useMultiChainWallet } from '../../../hooks/useMultiChainWallet';

// AAVE集成类 - 重构版本
class AAVEIntegration {
  private provider: any;
  private signer: any;
  private poolAddress: string;
  private userAddress: string;
  private poolContract: ethers.Contract;
  private usdcContract: ethers.Contract;
  private addressesProvider: string;
  private usdcAddress: string;
  private network: string;
  private chainId: string;

  // 🔧 修复后的完整ABI - 根据官方文档
  private static POOL_ABI = [
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
  ];

  private static ERC20_ABI = [
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function transfer(address to, uint256 amount) returns (bool)',
  ];

  // 🔧 更新的网络配置 - 基于官方文档
  private static NETWORK_CONFIG = {
    mainnet: {
      POOL_ADDRESS: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
      USDC_ADDRESS: '0xA0b86a33E6417c8Aba82fd3B5f1Dc4823442FA1B',
      ADDRESSES_PROVIDER: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e',
      CHAIN_ID: '0x1',
      NAME: 'Ethereum Mainnet',
    },
    polygon: {
      POOL_ADDRESS: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      USDC_ADDRESS: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      ADDRESSES_PROVIDER: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
      CHAIN_ID: '0x89',
      NAME: 'Polygon',
    },
    sepolia: {
      POOL_ADDRESS: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951',
      USDC_ADDRESS: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
      ADDRESSES_PROVIDER: '0x0496275d34753A48320CA58103d5220d394FF77F',
      CHAIN_ID: '0xaa36a7',
      NAME: 'Sepolia Testnet',
    },
    base: {
      POOL_ADDRESS: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
      USDC_ADDRESS: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // 🔧 正确的Base USDC地址
      ADDRESSES_PROVIDER: '0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D',
      CHAIN_ID: '0x2105',
      NAME: 'Base',
    },
  };

  constructor(provider: any, userAddress: string, networkKey: string = 'base') {
    console.log(`🏗️ Initializing AAVEIntegration for ${networkKey}`);

    this.provider = provider;
    this.userAddress = userAddress;
    this.network = networkKey;

    const config = AAVEIntegration.NETWORK_CONFIG[networkKey];
    if (!config) {
      throw new Error(`Unsupported network: ${networkKey}`);
    }

    this.poolAddress = config.POOL_ADDRESS;
    this.addressesProvider = config.ADDRESSES_PROVIDER;
    this.usdcAddress = config.USDC_ADDRESS;
    this.chainId = config.CHAIN_ID;

    // 创建ethers provider和signer
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    this.signer = ethersProvider.getSigner();

    // 初始化合约实例
    this.poolContract = new ethers.Contract(
      this.poolAddress,
      AAVEIntegration.POOL_ABI,
      ethersProvider // 只读操作使用provider
    );

    this.usdcContract = new ethers.Contract(
      this.usdcAddress,
      AAVEIntegration.ERC20_ABI,
      ethersProvider // 只读操作使用provider
    );

    console.log(`✅ AAVEIntegration initialized:`, {
      network: networkKey,
      pool: this.poolAddress,
      usdc: this.usdcAddress,
      user: this.userAddress,
    });
  }

  // 🔧 验证网络连接
  async validateNetwork(): Promise<boolean> {
    try {
      const currentChainId = await this.provider.request({
        method: 'eth_chainId',
      });
      console.log(
        `🔍 Current chainId: ${currentChainId}, Expected: ${this.chainId}`
      );

      if (currentChainId !== this.chainId) {
        console.warn(
          `⚠️ Chain mismatch! Current: ${currentChainId}, Expected: ${this.chainId}`
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to validate network:', error);
      return false;
    }
  }

  // 🔧 获取用户USDC余额
  async getUSDCBalance(): Promise<string> {
    try {
      console.log('💰 Getting USDC balance...');
      const balance = await this.usdcContract.balanceOf(this.userAddress);
      const formattedBalance = ethers.utils.formatUnits(balance, 6);
      console.log(`💰 USDC Balance: ${formattedBalance}`);
      return formattedBalance;
    } catch (error) {
      console.error('❌ Failed to get USDC balance:', error);
      throw new Error(`Failed to get USDC balance: ${error.message}`);
    }
  }

  // 🔧 获取用户在AAVE的存款余额（改进版本）
  async getUserDeposits(): Promise<{
    totalCollateralUSD: string;
    aTokenBalance: string;
  }> {
    try {
      console.log('🔍 Getting user AAVE deposits...');

      // 🎯 策略1: 获取用户账户总览数据
      const userData = await this.poolContract.getUserAccountData(
        this.userAddress
      );
      const totalCollateralUSD = ethers.utils.formatUnits(
        userData.totalCollateralBase,
        8
      ); // AAVE使用8位小数精度

      console.log(`📊 Total Collateral: ${totalCollateralUSD} USD`);

      // 🎯 策略2: 获取aToken余额（更精确）
      let aTokenBalance = '0';
      try {
        const reserveData = await this.poolContract.getReserveData(
          this.usdcAddress
        );
        const aTokenAddress = reserveData.aTokenAddress;

        console.log(`🪙 aUSDC Address: ${aTokenAddress}`);

        // 创建aToken合约实例
        const aTokenContract = new ethers.Contract(
          aTokenAddress,
          AAVEIntegration.ERC20_ABI,
          this.poolContract.provider
        );

        const aBalance = await aTokenContract.balanceOf(this.userAddress);
        aTokenBalance = ethers.utils.formatUnits(aBalance, 6);

        console.log(`💎 aUSDC Balance: ${aTokenBalance}`);
      } catch (aTokenError) {
        console.warn(
          '⚠️ Failed to get aToken balance, using total collateral:',
          aTokenError.message
        );
        aTokenBalance = totalCollateralUSD;
      }

      return {
        totalCollateralUSD,
        aTokenBalance,
      };
    } catch (error) {
      console.error('❌ Failed to get user deposits:', error);

      // 友好的错误处理
      if (error.message.includes('timeout')) {
        throw new Error(
          'Network timeout. Please check your connection and try again.'
        );
      }

      if (error.message.includes('CALL_EXCEPTION')) {
        throw new Error(
          'Unable to connect to AAVE contracts. Please ensure you are on the correct network.'
        );
      }

      throw new Error(`Failed to load account data: ${error.message}`);
    }
  }

  // 🔧 存款到AAVE（改进版本）
  async deposit(
    amount: string
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      console.log(`💰 Starting deposit: ${amount} USDC`);

      // 验证网络
      const isValidNetwork = await this.validateNetwork();
      if (!isValidNetwork) {
        throw new Error('Please switch to the correct network');
      }

      // 转换金额
      const weiAmount = ethers.utils.parseUnits(amount, 6);
      console.log(`🔢 Wei amount: ${weiAmount.toString()}`);

      // 检查USDC余额
      const usdcBalance = await this.usdcContract.balanceOf(this.userAddress);
      console.log(
        `💰 Current USDC balance: ${ethers.utils.formatUnits(usdcBalance, 6)}`
      );

      if (usdcBalance.lt(weiAmount)) {
        throw new Error(
          `Insufficient USDC balance. You need ${amount} USDC but only have ${ethers.utils.formatUnits(usdcBalance, 6)} USDC`
        );
      }

      // 检查和设置授权
      const currentAllowance = await this.usdcContract.allowance(
        this.userAddress,
        this.poolAddress
      );
      console.log(
        `🔐 Current allowance: ${ethers.utils.formatUnits(currentAllowance, 6)}`
      );

      if (currentAllowance.lt(weiAmount)) {
        console.log('🔐 Approving USDC...');
        const usdcWithSigner = this.usdcContract.connect(this.signer);
        const approveTx = await usdcWithSigner.approve(
          this.poolAddress,
          weiAmount
        );
        console.log(`🔐 Approve TX: ${approveTx.hash}`);

        const approveReceipt = await approveTx.wait();
        console.log(
          `✅ Approve confirmed in block: ${approveReceipt.blockNumber}`
        );
      }

      // 执行存款
      console.log('💰 Executing supply...');
      const poolWithSigner = this.poolContract.connect(this.signer);

      const supplyTx = await poolWithSigner.supply(
        this.usdcAddress, // asset
        weiAmount, // amount
        this.userAddress, // onBehalfOf
        0 // referralCode
      );

      console.log(`💰 Supply TX: ${supplyTx.hash}`);

      const receipt = await supplyTx.wait();
      console.log(`✅ Supply confirmed in block: ${receipt.blockNumber}`);

      return {
        success: true,
        transactionHash: receipt.transactionHash,
      };
    } catch (error) {
      console.error('❌ Deposit failed:', error);

      let errorMessage = error.message;

      // 用户友好的错误信息
      if (error.message.includes('User rejected')) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas fees';
      } else if (error.message.includes('execution reverted')) {
        errorMessage =
          'Transaction failed. Please check your balance and try again.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // 🔧 从AAVE提取（改进版本）
  async withdraw(
    amount: string
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      console.log(`💸 Starting withdrawal: ${amount} USDC`);

      // 验证网络
      const isValidNetwork = await this.validateNetwork();
      if (!isValidNetwork) {
        throw new Error('Please switch to the correct network');
      }

      // 转换金额（支持"all"）
      const weiAmount =
        amount === 'all'
          ? ethers.constants.MaxUint256
          : ethers.utils.parseUnits(amount, 6);

      console.log(
        `🔢 Withdrawal amount: ${amount === 'all' ? 'MAX' : weiAmount.toString()}`
      );

      // 执行提取
      console.log('💸 Executing withdraw...');
      const poolWithSigner = this.poolContract.connect(this.signer);

      const withdrawTx = await poolWithSigner.withdraw(
        this.usdcAddress, // asset
        weiAmount, // amount
        this.userAddress // to
      );

      console.log(`💸 Withdraw TX: ${withdrawTx.hash}`);

      const receipt = await withdrawTx.wait();
      console.log(`✅ Withdrawal confirmed in block: ${receipt.blockNumber}`);

      return {
        success: true,
        transactionHash: receipt.transactionHash,
      };
    } catch (error) {
      console.error('❌ Withdrawal failed:', error);

      let errorMessage = error.message;

      // 用户友好的错误信息
      if (error.message.includes('User rejected')) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas fees';
      } else if (error.message.includes('execution reverted')) {
        errorMessage =
          'Withdrawal failed. Please check your deposited balance.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // 静态辅助方法
  static getNetworkConfig(networkKey: string) {
    return AAVEIntegration.NETWORK_CONFIG[networkKey] || null;
  }

  static getSupportedNetworks(): string[] {
    return Object.keys(AAVEIntegration.NETWORK_CONFIG);
  }
}

interface DepositModalProps {
  visible: boolean;
  selectedVault: VaultProduct | null;
  selectedSpecificVault: VaultOption | TimeVaultOption | null;
  onClose: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({
  visible,
  selectedVault,
  selectedSpecificVault,
  onClose,
}) => {
  // 状态管理
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentDeposits, setCurrentDeposits] = useState<string>('0');
  const [usdcBalance, setUsdcBalance] = useState<string>('0');
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [networkError, setNetworkError] = useState<string>('');

  // 钱包Hook
  const {
    hasEthereumWallet,
    activeWallet,
    getEthereumProvider,
    getCurrentNetworkKey,
  } = useMultiChainWallet();

  // AAVE实例管理
  const [aaveInstance, setAaveInstance] = useState<AAVEIntegration | null>(
    null
  );
  const initializationRef = useRef<boolean>(false);
  const lastNetworkRef = useRef<string>('');
  const lastAddressRef = useRef<string>('');
  const balancesCacheRef = useRef<{
    usdcBalance: string;
    deposits: string;
    timestamp: number;
  } | null>(null);

  // 🔧 防抖和缓存机制
  const CACHE_DURATION = 30000; // 30秒缓存
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 🔧 检查缓存是否有效
  const isCacheValid = useCallback(() => {
    if (!balancesCacheRef.current) return false;
    const now = Date.now();
    return now - balancesCacheRef.current.timestamp < CACHE_DURATION;
  }, []);

  // 🔧 修复后的初始化逻辑 - 防止无限循环
  const initializeAAVE = useCallback(async () => {
    // 防止重复初始化
    if (initializationRef.current) {
      console.log('🔄 AAVE initialization already in progress, skipping...');
      return;
    }

    if (!hasEthereumWallet || !activeWallet?.address) {
      console.log('❌ No Ethereum wallet available');
      setNetworkError('Please connect an Ethereum wallet');
      return;
    }

    // 检查是否真的需要重新初始化
    const currentNetwork = getCurrentNetworkKey();
    const currentAddress = activeWallet?.address || '';

    if (
      aaveInstance &&
      lastNetworkRef.current === currentNetwork &&
      lastAddressRef.current === currentAddress
    ) {
      console.log(
        '🎯 AAVE already initialized for current network/address, skipping...'
      );
      // 如果有有效缓存，直接使用
      if (isCacheValid()) {
        console.log('📋 Using cached balances...');
        const cache = balancesCacheRef.current!;
        setUsdcBalance(cache.usdcBalance);
        setCurrentDeposits(cache.deposits);
        return;
      }
      // 否则只刷新余额
      loadBalances();
      return;
    }

    initializationRef.current = true;
    setLoadingBalance(true);
    setNetworkError('');

    try {
      console.log('🚀 Initializing AAVE integration...');

      const provider = await getEthereumProvider();
      const networkKey = getCurrentNetworkKey();

      console.log(
        `🌐 Network: ${networkKey}, Address: ${activeWallet.address}`
      );

      // 验证网络支持
      const networkConfig = AAVEIntegration.getNetworkConfig(networkKey);
      if (!networkConfig) {
        const supportedNetworks = AAVEIntegration.getSupportedNetworks();
        throw new Error(
          `Unsupported network: ${networkKey}. Supported networks: ${supportedNetworks.join(', ')}`
        );
      }

      // 验证当前链ID
      const currentChainId = await provider.request({ method: 'eth_chainId' });
      if (currentChainId !== networkConfig.CHAIN_ID) {
        throw new Error(
          `Network mismatch. Please switch to ${networkConfig.NAME} (${networkConfig.CHAIN_ID})`
        );
      }

      // 创建AAVE实例
      const aave = new AAVEIntegration(
        provider,
        activeWallet.address,
        networkKey
      );

      // 验证网络连接
      const isValidNetwork = await aave.validateNetwork();
      if (!isValidNetwork) {
        throw new Error(`Please switch to ${networkConfig.NAME} network`);
      }

      setAaveInstance(aave);

      // 直接加载余额
      await loadBalancesForInstance(aave);
    } catch (error) {
      console.error('❌ Failed to initialize AAVE:', error);
      setNetworkError(error.message);
      setCurrentDeposits('0');
      setUsdcBalance('0');
    } finally {
      setLoadingBalance(false);
      initializationRef.current = false;
    }
  }, [
    hasEthereumWallet,
    activeWallet?.address,
    getEthereumProvider,
    getCurrentNetworkKey,
    aaveInstance,
    isCacheValid,
  ]);

  // 🔧 直接为特定实例加载余额
  const loadBalancesForInstance = useCallback(async (aave: AAVEIntegration) => {
    try {
      console.log('💰 Loading balances for new instance...');

      // 并行加载USDC余额和AAVE存款
      const [usdcBal, deposits] = await Promise.all([
        aave.getUSDCBalance(),
        aave.getUserDeposits(),
      ]);

      const formattedUsdcBalance = parseFloat(usdcBal).toFixed(2);
      const depositAmount = parseFloat(deposits.aTokenBalance);
      const formattedDeposits =
        depositAmount > 0 ? depositAmount.toFixed(2) : '0';

      // 更新缓存
      balancesCacheRef.current = {
        usdcBalance: formattedUsdcBalance,
        deposits: formattedDeposits,
        timestamp: Date.now(),
      };

      setUsdcBalance(formattedUsdcBalance);
      setCurrentDeposits(formattedDeposits);

      console.log(
        `✅ Balances loaded and cached for new instance - USDC: ${formattedUsdcBalance}, Deposits: ${formattedDeposits}`
      );
    } catch (error) {
      console.error('❌ Failed to load balances for instance:', error);
      setNetworkError(`Failed to load balances: ${error.message}`);
    }
  }, []);

  // 🔧 加载余额的单独函数 - 带缓存和防抖
  const loadBalances = useCallback(
    async (aaveInstanceToUse?: AAVEIntegration) => {
      const aave = aaveInstanceToUse || aaveInstance;
      if (!aave) return;

      // 如果传入了特定实例，直接加载
      if (aaveInstanceToUse) {
        await loadBalancesForInstance(aaveInstanceToUse);
        return;
      }

      // 清除之前的防抖定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 检查缓存
      if (isCacheValid()) {
        console.log('📋 Using cached balances (loadBalances)...');
        const cache = balancesCacheRef.current!;
        setUsdcBalance(cache.usdcBalance);
        setCurrentDeposits(cache.deposits);
        return;
      }

      // 防抖：延迟执行
      debounceTimerRef.current = setTimeout(async () => {
        await loadBalancesForInstance(aave);
      }, 500); // 500ms 防抖
    },
    [aaveInstance, isCacheValid, loadBalancesForInstance]
  );

  // 🔧 使用useEffect但限制触发条件
  const currentNetworkKey = getCurrentNetworkKey();
  const currentAddress = activeWallet?.address;

  useEffect(() => {
    if (visible && hasEthereumWallet && currentAddress) {
      console.log('🎯 Modal opened, checking AAVE initialization...');
      initializeAAVE();
    }
  }, [visible, hasEthereumWallet, currentAddress, initializeAAVE]);

  // 🔧 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 🔧 网络或地址变化时重置状态
  useEffect(() => {
    if (
      visible &&
      (lastNetworkRef.current !== currentNetworkKey ||
        lastAddressRef.current !== currentAddress)
    ) {
      console.log(
        `🔄 Network/Address changed from ${lastNetworkRef.current}/${lastAddressRef.current} to ${currentNetworkKey}/${currentAddress}`
      );

      // 清理现有状态
      setAaveInstance(null);
      initializationRef.current = false;
      balancesCacheRef.current = null;

      // 更新refs
      lastNetworkRef.current = currentNetworkKey;
      lastAddressRef.current = currentAddress || '';

      // 重新初始化
      if (currentAddress) {
        initializeAAVE();
      }
    }
  }, [visible, currentNetworkKey, currentAddress, initializeAAVE]);

  // 🔧 处理存款 - 全英文版本
  const handleDeposit = useCallback(async () => {
    if (!aaveInstance || !depositAmount || parseFloat(depositAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid deposit amount');
      return;
    }

    const amount = parseFloat(depositAmount);
    const availableBalance = parseFloat(usdcBalance);

    if (amount > availableBalance) {
      Alert.alert(
        'Insufficient Balance',
        `You only have ${usdcBalance} USDC, cannot deposit ${depositAmount} USDC`
      );
      return;
    }

    setIsLoading(true);
    try {
      console.log(`💰 Depositing ${depositAmount} USDC...`);

      const result = await aaveInstance.deposit(depositAmount);

      if (result.success) {
        Alert.alert(
          'Deposit Successful!',
          `Successfully deposited ${depositAmount} USDC to AAVE\n\nTransaction Hash: ${result.transactionHash?.substring(0, 10)}...`,
          [
            {
              text: 'View Transaction',
              onPress: () => {
                const explorerUrl = `https://basescan.org/tx/${result.transactionHash}`;
                console.log(`🔗 Opening explorer: ${explorerUrl}`);
              },
            },
            { text: 'OK' },
          ]
        );

        setDepositAmount('');

        // 清除缓存并刷新余额
        balancesCacheRef.current = null;
        await loadBalances();
      } else {
        Alert.alert('Deposit Failed', result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Deposit error:', error);
      Alert.alert('Deposit Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [aaveInstance, depositAmount, usdcBalance, loadBalances]);

  // 🔧 处理提取 - 全英文版本
  const handleWithdraw = useCallback(async () => {
    if (!aaveInstance || !depositAmount || parseFloat(depositAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid withdrawal amount');
      return;
    }

    const amount = parseFloat(depositAmount);
    const availableDeposits = parseFloat(currentDeposits);

    if (amount > availableDeposits) {
      Alert.alert(
        'Insufficient Deposits',
        `You only have ${currentDeposits} USDC deposited, cannot withdraw ${depositAmount} USDC`
      );
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `Are you sure you want to withdraw ${depositAmount} USDC?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setIsLoading(true);
            try {
              console.log(`💸 Withdrawing ${depositAmount} USDC...`);

              const result = await aaveInstance.withdraw(depositAmount);

              if (result.success) {
                Alert.alert(
                  'Withdrawal Successful!',
                  `Successfully withdrew ${depositAmount} USDC\n\nTransaction Hash: ${result.transactionHash?.substring(0, 10)}...`,
                  [
                    {
                      text: 'View Transaction',
                      onPress: () => {
                        const explorerUrl = `https://basescan.org/tx/${result.transactionHash}`;
                        console.log(`🔗 Opening explorer: ${explorerUrl}`);
                      },
                    },
                    { text: 'OK' },
                  ]
                );

                setDepositAmount('');

                // 清除缓存并刷新余额
                balancesCacheRef.current = null;
                await loadBalances();
              } else {
                Alert.alert(
                  'Withdrawal Failed',
                  result.error || 'Unknown error'
                );
              }
            } catch (error) {
              console.error('❌ Withdrawal error:', error);
              Alert.alert('Withdrawal Failed', error.message);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  }, [aaveInstance, depositAmount, currentDeposits, loadBalances]);

  if (!visible || (!selectedVault && !selectedSpecificVault)) {
    return null;
  }

  const displayVault = selectedSpecificVault || selectedVault;
  const isSpecificVault = !!selectedSpecificVault;
  const isTimeVault = displayVault && 'lockPeriod' in displayVault;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {isTimeVault
              ? `Open ${displayVault.name}`
              : isSpecificVault
                ? `Open ${displayVault.name} Vault`
                : `Open ${displayVault.name}`}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Vault Header - 保持原有样式 */}
          {isTimeVault ? (
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.depositVaultHeader}
            >
              <View style={styles.depositVaultInfo}>
                <ProtocolLogo
                  protocol={getProtocolFromVaultName(displayVault.name)}
                  size={48}
                />
                <View style={styles.depositVaultText}>
                  <Text style={styles.depositVaultName}>
                    {displayVault.name}
                  </Text>
                  <Text style={styles.depositVaultDesc}>
                    {displayVault.description}
                  </Text>
                </View>
              </View>
              <View style={styles.depositVaultStats}>
                <View style={styles.depositStatItem}>
                  <Text style={styles.depositStatLabel}>APY Rate</Text>
                  <Text style={styles.depositStatValue}>
                    {displayVault.apy}
                  </Text>
                </View>
                <View style={styles.depositStatItem}>
                  <Text style={styles.depositStatLabel}>Lock Period</Text>
                  <Text style={styles.depositStatValue}>
                    {(displayVault as TimeVaultOption).lockPeriod}
                  </Text>
                </View>
              </View>
              <View style={styles.depositProtocol}>
                <Text style={styles.depositStatLabel}>Protocol</Text>
                <Text style={styles.depositStatValue}>
                  {(displayVault as TimeVaultOption).protocol}
                </Text>
              </View>
            </LinearGradient>
          ) : isSpecificVault ? (
            <LinearGradient
              colors={['#764ba2', '#c084fc']}
              style={styles.depositVaultHeader}
            >
              <View style={styles.depositVaultInfo}>
                <ProtocolLogo protocol={displayVault.name} size={48} />
                <View style={styles.depositVaultText}>
                  <Text style={styles.depositVaultName}>
                    {displayVault.name}
                  </Text>
                  <Text style={styles.depositVaultDesc}>
                    {displayVault.description}
                  </Text>
                </View>
              </View>
              <View style={styles.depositVaultStats}>
                <View style={styles.depositStatItem}>
                  <Text style={styles.depositStatLabel}>APY Rate</Text>
                  <Text style={styles.depositStatValue}>
                    {displayVault.apy}
                  </Text>
                </View>
                <View style={styles.depositStatItem}>
                  <Text style={styles.depositStatLabel}>TVL</Text>
                  <Text style={styles.depositStatValue}>
                    {(displayVault as VaultOption).tvl}
                  </Text>
                </View>
              </View>
              <View style={styles.depositProtocol}>
                <Text style={styles.depositStatLabel}>Risk Level</Text>
                <Text style={styles.depositStatValue}>
                  {(displayVault as VaultOption).risk}
                </Text>
              </View>
            </LinearGradient>
          ) : (
            <LinearGradient
              colors={(displayVault as VaultProduct).gradientColors}
              style={styles.depositVaultHeader}
            >
              <View style={styles.depositVaultHeaderContent}>
                <Text style={styles.depositVaultName}>{displayVault.name}</Text>
                <VaultLogo vaultName={displayVault.name} size={24} />
              </View>
              <View style={styles.depositVaultStats}>
                <View style={styles.depositStatItem}>
                  <Text style={styles.depositStatLabel}>APY Rate</Text>
                  <Text style={styles.depositStatValue}>
                    {displayVault.apy}
                  </Text>
                </View>
                <View style={styles.depositStatItem}>
                  <Text style={styles.depositStatLabel}>Minimum</Text>
                  <Text style={styles.depositStatValue}>
                    {(displayVault as VaultProduct).minimum}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          )}

          {/* 恢复原本的功能描述 */}
          <View style={styles.depositFeatures}>
            <Text style={styles.depositFeaturesTitle}>
              {isTimeVault
                ? 'Vault Features:'
                : isSpecificVault
                  ? 'Protocol Features:'
                  : 'Key Features:'}
            </Text>
            {isTimeVault
              ? [
                  'Fixed-term guaranteed returns',
                  'No early withdrawal penalty',
                  'Automated yield optimization',
                  'Institutional-grade security',
                ].map((feature, index) => (
                  <View key={index} style={styles.depositFeatureItem}>
                    <View
                      style={[
                        styles.depositFeatureDot,
                        { backgroundColor: '#667eea' },
                      ]}
                    />
                    <Text style={styles.depositFeatureText}>{feature}</Text>
                  </View>
                ))
              : isSpecificVault
                ? [
                    'Flexible access anytime',
                    'Auto-compounding rewards',
                    'Audited smart contracts',
                    '24/7 yield optimization',
                  ].map((feature, index) => (
                    <View key={index} style={styles.depositFeatureItem}>
                      <View
                        style={[
                          styles.depositFeatureDot,
                          { backgroundColor: '#764ba2' },
                        ]}
                      />
                      <Text style={styles.depositFeatureText}>{feature}</Text>
                    </View>
                  ))
                : (displayVault as VaultProduct).features.map(
                    (feature, index) => (
                      <View key={index} style={styles.depositFeatureItem}>
                        <View
                          style={[
                            styles.depositFeatureDot,
                            { backgroundColor: '#c084fc' },
                          ]}
                        />
                        <Text style={styles.depositFeatureText}>{feature}</Text>
                      </View>
                    )
                  )}
          </View>

          {/* 原本的余额和输入区域 */}
          <View style={styles.depositSummary}>
            <View style={styles.depositSummaryRow}>
              <Text style={styles.depositSummaryLabel}>
                USDC Wallet Balance
              </Text>
              <View style={styles.depositAmountContainer}>
                {loadingBalance ? (
                  <ActivityIndicator size="small" color="#111827" />
                ) : (
                  <Text style={styles.depositSummaryAmount}>
                    ${usdcBalance}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.depositSummaryRow}>
              <Text style={styles.depositSummaryLabel}>
                AAVE Deposit Amount
              </Text>
              <View style={styles.depositAmountContainer}>
                {loadingBalance ? (
                  <ActivityIndicator size="small" color="#111827" />
                ) : networkError ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.depositSummaryAmount}>$0</Text>
                    <Text style={styles.errorText}>⚠️ Network issue</Text>
                  </View>
                ) : (
                  <Text style={styles.depositSummaryAmount}>
                    ${currentDeposits}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* 输入框 */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.amountInput}
              value={depositAmount}
              onChangeText={setDepositAmount}
              placeholder="Enter USDC amount"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* 🔧 改进的错误提示 */}
          {networkError && (
            <View style={styles.networkErrorContainer}>
              <Text style={styles.networkErrorText}>{networkError}</Text>
            </View>
          )}

          <View style={styles.depositActions}>
            <TouchableOpacity
              style={[
                styles.learnMoreButton,
                (isLoading || networkError) && styles.disabledButton,
              ]}
              onPress={handleWithdraw}
              disabled={isLoading || !!networkError}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#374151" />
              ) : (
                <Text style={styles.learnMoreText}>Withdraw</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.startSavingButton,
                (isLoading || networkError) && styles.disabledButton,
              ]}
              onPress={handleDeposit}
              disabled={isLoading || !!networkError}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.startSavingText}>Start Saving</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6b7280',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },

  // Vault Header Styles (保持原有样式)
  depositVaultHeader: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  depositVaultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  depositVaultText: {
    marginLeft: 12,
    flex: 1,
  },
  depositVaultName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  depositVaultDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  depositVaultHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  depositVaultStats: {
    flexDirection: 'row',
    gap: 16,
  },
  depositStatItem: {
    flex: 1,
  },
  depositStatLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  depositStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  depositProtocol: {
    marginTop: 12,
  },

  // 功能描述样式
  depositFeatures: {
    marginBottom: 24,
  },
  depositFeaturesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  depositFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  depositFeatureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
    marginRight: 12,
  },
  depositFeatureText: {
    fontSize: 14,
    color: '#374151',
  },

  // 原本的存款汇总样式
  depositSummary: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  depositSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  depositSummaryLabel: {
    fontSize: 14,
    color: '#374151',
  },
  depositSummaryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  depositSummaryMaturity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  depositSummaryReturn: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  depositAmountContainer: {
    alignItems: 'flex-end',
  },
  errorContainer: {
    alignItems: 'flex-end',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 2,
  },

  // 输入框样式
  inputContainer: {
    marginBottom: 16,
  },
  amountInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#111827',
  },

  // 操作按钮样式
  depositActions: {
    flexDirection: 'row',
    gap: 12,
  },
  learnMoreButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  learnMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  startSavingButton: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startSavingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.6,
  },

  // 🔧 错误提示
  networkErrorContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  networkErrorText: {
    fontSize: 14,
    color: '#dc2626',
    lineHeight: 20,
  },
});

export default DepositModal;
