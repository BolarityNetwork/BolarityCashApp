import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CommonSafeAreaView } from '@/components/CommonSafeAreaView';
import { useVaultDetails, VaultItem } from '@/api/vault';
import { useUserBalances, WalletToken } from '@/api/account';
import useMultiChainWallet from '@/hooks/useMultiChainWallet';
import { useRouter } from 'expo-router';
import BackWhite from '@/assets/icon/nav/back-white.svg';
import { ShadowCard } from '@/components/common/ShadowCard';
import Skeleton from '@/components/common/Skeleton';

const getLevel1Categories = (t: (key: string) => string) =>
  [
    { id: 'directlyAvailable', label: t('portfolio.directlyAvailable') },
    { id: 'flexi', label: t('portfolio.flexi') },
    { id: 'time', label: t('portfolio.time') },
  ] as const;

function groupByProtocol<T extends VaultItem>(
  vaults: T[]
): Record<string, T[]> {
  return vaults.reduce(
    (acc, v) => {
      const key = v.protocol || 'Others';
      if (!acc[key]) acc[key] = [];
      acc[key].push(v);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

const PortfolioScreen: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [categoryCollapsed, setCategoryCollapsed] = useState<
    Record<string, boolean>
  >({});
  const { activeWallet } = useMultiChainWallet();

  const { data: balancesData, isLoading: isBalancesLoading } = useUserBalances(
    activeWallet?.address || '',
    !!activeWallet?.address
  );

  console.log(11122, balancesData);

  const {
    data: allVaults = [],
    isLoading,
    isError,
    // refetch,
  } = useVaultDetails();

  const toggleCategory = (key: string) => {
    setCategoryCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleVaultPress = (vaultId: string) => {
    // 预留跳转逻辑，后续接入 Vault 详情页
    Alert.alert('Coming soon', `Vault: ${vaultId}`);
  };

  const totalAssets = balancesData?.totals?.depositsUsd || 0;

  return (
    <CommonSafeAreaView
      className="flex-1 bg-black"
      isIncludeBottomBar={true}
      isIncludeStatusBar={true}
    >
      {/* Custom Header with Total Assets */}
      <View className="bg-black pt-[57px] pb-5">
        {/* Header Bar */}
        <View className="px-5 pb-[13px] flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8 h-8 items-center justify-center mr-3"
          >
            <BackWhite />
          </TouchableOpacity>
          <Text className="text-center text-white text-[17px] font-normal">
            {t('portfolio.title', { defaultValue: '账号总览' })}
          </Text>
          <View className="w-8"></View>
        </View>

        {/* Total Assets Card */}
        {isBalancesLoading ? (
          <View className="bg-white rounded-[20px] p-5 py-4 mx-5 mt-5">
            <Skeleton width={60} height={14} borderRadius={4} />
            <View className="mt-[5px]">
              <Skeleton width={170} height={28} borderRadius={4} />
            </View>
            <View className="mt-[7px]">
              <Skeleton width={80} height={32} borderRadius={6} />
            </View>
          </View>
        ) : (
          balancesData && (
            <View className="bg-white rounded-[20px] p-5 py-4 mx-5 mt-5">
              <Text className="text-[12px] font-[600] text-black">
                {t('portfolio.totalAssets', { defaultValue: '总资产' })}
              </Text>
              <View className="mt-[5px]">
                <Text className="text-[20px] font-[600] text-black leading-[28px] w-[170px]">
                  ${totalAssets.toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity
                className="bg-black rounded-[6px] px-5 py-[9px] self-start mt-[7px]"
                onPress={() => router.replace('/home')}
              >
                <Text className="text-[12px] font-[600] text-white leading-[14px]">
                  {t('portfolio.viewEarnings', { defaultValue: '查看收益' })}
                </Text>
              </TouchableOpacity>
            </View>
          )
        )}
      </View>

      <ScrollView
        className="flex-1 bg-white rounded-[20px] px-5 pt-[10px]"
        showsVerticalScrollIndicator={false}
      >
        {isLoading || isBalancesLoading ? (
          <PortfolioSkeleton />
        ) : !isError ? (
          <View>
            {getLevel1Categories(t).map(cat => {
              // Handle "directlyAvailable" category separately
              if (cat.id === 'directlyAvailable') {
                const walletData = balancesData?.wallet;
                const stableTokens = walletData?.stable || [];
                const assetTokens = walletData?.assets || [];

                // Only show if there are tokens
                if (stableTokens.length === 0 && assetTokens.length === 0) {
                  return null;
                }

                const isCategoryCollapsed = categoryCollapsed[cat.id];

                return (
                  <ShadowCard key={cat.id} className="mb-4">
                    {/* Category Card */}
                    <View className="bg-white rounded-[20px] p-5">
                      {/* Category Header */}
                      <TouchableOpacity
                        onPress={() => toggleCategory(cat.id)}
                        className={`flex-row items-center justify-between ${isCategoryCollapsed ? 'mb-0' : 'mb-4'}`}
                      >
                        <Text className="text-[18px] font-[600] text-black">
                          {cat.label}
                        </Text>
                      </TouchableOpacity>

                      {/* Wallet Token Items */}
                      {!isCategoryCollapsed && (
                        <WalletTokenItems
                          stableTokens={stableTokens}
                          assetTokens={assetTokens}
                          t={t}
                        />
                      )}
                    </View>
                  </ShadowCard>
                );
              }

              // 从 balancesData.protocols 中提取有资金的协议及其 breakdown
              const protocolsWithBalance = (balancesData?.protocols || [])
                .filter(p => (p?.totals?.usd || 0) > 0)
                .map(p => ({
                  protocolName: (p?.protocol || '').toLowerCase(),
                  protocolOriginal: p?.protocol || '',
                  totalsUsd: p?.totals?.usd || 0,
                  breakdown: p?.totals?.breakdown || {},
                }));

              // 从 allVaults 中匹配 vault，并附加 breakdown 中的金额信息
              const vaultsWithBalance: Array<
                VaultItem & { balanceAmount: number; balanceUsdValue: number }
              > = [];

              protocolsWithBalance.forEach(protocolData => {
                Object.keys(protocolData.breakdown).forEach(vaultKey => {
                  const breakdownInfo = protocolData.breakdown[vaultKey];

                  const extractCoreSymbol = (str: string) => {
                    const normalized = str
                      .toLowerCase()
                      .replace(/\s+/g, '')
                      .replace(/[^\w]/g, '');
                    const commonPatterns = ['usdebase', 'usdtbase', 'usdcbase'];
                    for (const pattern of commonPatterns) {
                      if (normalized.includes(pattern)) {
                        return pattern;
                      }
                    }
                    const match = normalized.match(/^([a-z]+)/);
                    return match ? match[1] : normalized;
                  };

                  const vaultKeyCore = extractCoreSymbol(vaultKey);

                  const matchedVault = (allVaults || []).find(v => {
                    if (
                      (v.protocol || '').toLowerCase() !==
                      protocolData.protocolName
                    ) {
                      return false;
                    }
                    if (v.category !== cat.id) return false;

                    const marketLower = (v.market || '').toLowerCase();
                    const idLower = (v.id || '').toLowerCase();

                    const marketCore = extractCoreSymbol(marketLower);
                    const idCore = extractCoreSymbol(idLower);

                    return (
                      marketCore.includes(vaultKeyCore) ||
                      vaultKeyCore.includes(marketCore) ||
                      idCore.includes(vaultKeyCore) ||
                      vaultKeyCore.includes(idCore) ||
                      marketLower.includes(vaultKeyCore) ||
                      vaultKeyCore.includes(marketLower) ||
                      idLower.includes(vaultKeyCore) ||
                      vaultKeyCore.includes(idLower)
                    );
                  });

                  if (matchedVault) {
                    vaultsWithBalance.push({
                      ...matchedVault,
                      balanceAmount: breakdownInfo.amount || 0,
                      balanceUsdValue: breakdownInfo.usdValue || 0,
                    });
                  }
                });
              });

              const grouped = groupByProtocol(vaultsWithBalance);
              const protocols = Object.keys(grouped);

              if (protocols.length === 0) return null;

              const isCategoryCollapsed = categoryCollapsed[cat.id];

              return (
                <ShadowCard key={cat.id} className="mb-4">
                  {/* Category Card */}
                  <View className="bg-white rounded-[20px] p-5">
                    {/* Category Header */}
                    <TouchableOpacity
                      onPress={() => toggleCategory(cat.id)}
                      className={`flex-row items-center justify-between ${isCategoryCollapsed ? 'mb-0' : 'mb-4'}`}
                    >
                      <Text className="text-[18px] font-[600] text-black">
                        {cat.label}
                      </Text>
                    </TouchableOpacity>

                    {/* Vault Items */}
                    {!isCategoryCollapsed && (
                      <VaultItems
                        protocols={protocols}
                        grouped={grouped}
                        onVaultPress={handleVaultPress}
                        categoryId={cat.id}
                        t={t}
                      />
                    )}
                  </View>
                </ShadowCard>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </CommonSafeAreaView>
  );
};

interface VaultItemsProps {
  protocols: string[];
  grouped: Record<
    string,
    Array<VaultItem & { balanceAmount: number; balanceUsdValue: number }>
  >;
  onVaultPress: (vaultId: string) => void;
  categoryId: string;
  t: (key: string, options?: { defaultValue?: string }) => string;
}

const VaultItems: React.FC<VaultItemsProps> = ({
  protocols,
  grouped,
  onVaultPress,
  categoryId,
}) => {
  return (
    <>
      {protocols.map(protocol => {
        const protocolVaults = grouped[protocol];

        return (
          <View key={`${categoryId}-${protocol}`}>
            {protocolVaults.map(v => {
              console.log(33333, v);
              const vaultUsdValue =
                'balanceUsdValue' in v ? (v.balanceUsdValue as number) : 0;

              return (
                <TouchableOpacity
                  key={`${v.id}`}
                  onPress={() => onVaultPress(v.id)}
                  className="flex-row items-center justify-between py-[11px]"
                >
                  <View className="flex-1">
                    <Text className="text-[14px] font-[600] text-black mb-1">
                      {v.id || v.market}
                    </Text>
                  </View>
                  <View className="items-end mr-2">
                    <Text className="text-[20px] font-[600] text-black mb-1">
                      ${vaultUsdValue.toFixed(2)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}
    </>
  );
};

interface WalletTokenItemsProps {
  stableTokens: WalletToken[];
  assetTokens: WalletToken[];
  t: (key: string, options?: { defaultValue?: string }) => string;
}

const WalletTokenItems: React.FC<WalletTokenItemsProps> = ({
  stableTokens,
  assetTokens,
}) => {
  const allTokens = [...stableTokens, ...assetTokens];

  if (allTokens.length === 0) {
    return null;
  }

  return (
    <View>
      {allTokens.map((token, index) => {
        return (
          <TouchableOpacity
            key={`${token.symbol}-${token.address || index}`}
            className="flex-row items-center justify-between py-[15px] pb-1 px-0"
          >
            <View className="flex-1">
              <Text className="text-[14px] font-[600] text-black mb-1">
                {token.symbol}
              </Text>
            </View>
            <View className="items-end mr-2">
              <Text className="text-[20px] font-[600] text-black mb-1">
                ${token.usdValue.toFixed(2)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const PortfolioSkeleton: React.FC = () => {
  return (
    <View>
      {/* 直接可用分类骨架屏 */}
      <ShadowCard className="mb-4">
        <View className="bg-white rounded-[20px] p-5">
          <Skeleton width={100} height={22} borderRadius={4} />
          <View className="mt-4">
            {[1, 2].map(index => (
              <View
                key={index}
                className="flex-row items-center justify-between py-[15px] pb-1"
              >
                <Skeleton width={60} height={20} borderRadius={4} />
                <Skeleton width={100} height={24} borderRadius={4} />
              </View>
            ))}
          </View>
        </View>
      </ShadowCard>

      {/* 活期分类骨架屏 */}
      <ShadowCard className="mb-4">
        <View className="bg-white rounded-[20px] p-5">
          <Skeleton width={80} height={22} borderRadius={4} />
          <View className="mt-4">
            {[1, 2].map(index => (
              <View
                key={index}
                className="flex-row items-center justify-between py-[11px]"
              >
                <Skeleton width={120} height={20} borderRadius={4} />
                <Skeleton width={100} height={24} borderRadius={4} />
              </View>
            ))}
          </View>
        </View>
      </ShadowCard>

      {/* 定期分类骨架屏 */}
      <ShadowCard className="mb-4">
        <View className="bg-white rounded-[20px] p-5">
          <Skeleton width={80} height={22} borderRadius={4} />
          <View className="mt-4">
            {[1, 2].map(index => (
              <View
                key={index}
                className="flex-row items-center justify-between py-[11px]"
              >
                <Skeleton width={120} height={20} borderRadius={4} />
                <Skeleton width={100} height={24} borderRadius={4} />
              </View>
            ))}
          </View>
        </View>
      </ShadowCard>
    </View>
  );
};

export default PortfolioScreen;
