import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CommonSafeAreaView } from '@/components/CommonSafeAreaView';
import { useVaultDetails, VaultItem } from '@/api/vault';
import { useUserBalances } from '@/api/account';
import useMultiChainWallet from '@/hooks/useMultiChainWallet';
import { PageHeader } from '@/components/common/PageHeader';
import { UniversalLoadingFallback } from '@/components/universalLoadingFallback';

const getLevel1Categories = (t: (key: string) => string) =>
  [
    { id: 'flexi', label: t('portfolio.flexi') },
    { id: 'time', label: t('portfolio.time') },
  ] as const;

function groupByProtocol(vaults: VaultItem[]): Record<string, VaultItem[]> {
  return vaults.reduce(
    (acc, v) => {
      const key = v.protocol || 'Others';
      if (!acc[key]) acc[key] = [];
      acc[key].push(v);
      return acc;
    },
    {} as Record<string, VaultItem[]>
  );
}

const PortfolioScreen: React.FC = () => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const { activeWallet } = useMultiChainWallet();

  const { data: balancesData, isLoading: isBalancesLoading } = useUserBalances(
    activeWallet?.address || '',
    !!activeWallet?.address
  );
  console.log('balancesData', balancesData);
  const {
    data: allVaults = [],
    isLoading,
    isError,
    refetch,
  } = useVaultDetails();

  const toggleProtocol = (key: string) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleVaultPress = (vaultId: string) => {
    // 预留跳转逻辑，后续接入 Vault 详情页
    Alert.alert('Coming soon', `Vault: ${vaultId}`);
  };

  return (
    <CommonSafeAreaView className="flex-1 bg-white" isIncludeBottomBar={true}>
      <PageHeader
        title={t('navigation.portfolio', { defaultValue: 'Portfolio' })}
      />
      <View className="px-6 pt-6 pb-4">
        {!isBalancesLoading && balancesData && (
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
              {t('portfolio.totalInvestment', {
                defaultValue: 'Total Investment',
              })}
            </Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>
              ${balancesData.totals?.depositsUsd?.toFixed(3) || '0.00'}
            </Text>
          </View>
        )}
      </View>

      {/* 内容区 */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
      >
        {(isLoading || isBalancesLoading) && (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <UniversalLoadingFallback style={{ width: 72, height: 72 }} />
          </View>
        )}

        {isError && !isLoading && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Text style={{ color: '#dc2626', marginBottom: 8 }}>
              {t('home.failedToLoadVaults', { defaultValue: 'Failed to load' })}
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              style={{
                backgroundColor: '#dc2626',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>
                {t('home.retry', { defaultValue: 'Retry' })}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !isBalancesLoading && !isError && (
          <>
            {getLevel1Categories(t).map(cat => {
              // 从 balancesData.protocols 中提取有资金的协议及其 breakdown（vault 名称 -> 金额信息）
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
                  // breakdown 的 key 是 symbol（如 "USDE-BASE 11 DEC 2025"），需要与 allVaults 中的 id 或 market 匹配

                  // 提取核心 symbol（去掉日期和协议前缀），用于匹配
                  const extractCoreSymbol = (str: string) => {
                    const normalized = str
                      .toLowerCase()
                      .replace(/\s+/g, '')
                      .replace(/[^\w]/g, '');
                    // 尝试提取常见的 symbol 核心部分（如 "usdebase"）
                    // 如果是 "usdebase11dec2025" 或 "usdebase20251211"，提取 "usdebase"
                    // 如果是 "pendleusde20251211base"，尝试提取中间的 "usdebase"
                    const commonPatterns = ['usdebase', 'usdtbase', 'usdcbase'];
                    for (const pattern of commonPatterns) {
                      if (normalized.includes(pattern)) {
                        return pattern;
                      }
                    }
                    // 如果没有匹配到常见模式，提取第一个字母序列
                    const match = normalized.match(/^([a-z]+)/);
                    return match ? match[1] : normalized;
                  };

                  const vaultKeyCore = extractCoreSymbol(vaultKey);

                  // 在 allVaults 中查找匹配的 vault
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

                    // 匹配策略：
                    // 1. 核心 symbol 必须匹配（双向包含）
                    // 2. 如果核心匹配，就认为匹配成功（日期格式差异可以忽略）
                    return (
                      marketCore.includes(vaultKeyCore) ||
                      vaultKeyCore.includes(marketCore) ||
                      idCore.includes(vaultKeyCore) ||
                      vaultKeyCore.includes(idCore) ||
                      // 也尝试直接包含匹配（处理复杂格式）
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

              return (
                <View key={cat.id} style={{ marginBottom: 24 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '800',
                      color: '#111827',
                      marginBottom: 12,
                    }}
                  >
                    {cat.label}
                  </Text>

                  {protocols.map(protocol => {
                    // 计算该协议下的总投资额
                    const protocolTotal = grouped[protocol].reduce(
                      (sum, v) =>
                        sum +
                        ('balanceUsdValue' in v
                          ? (v.balanceUsdValue as number)
                          : 0),
                      0
                    );

                    return (
                      <View
                        key={`${cat.id}-${protocol}`}
                        style={{ marginBottom: 20 }}
                      >
                        <TouchableOpacity
                          onPress={() =>
                            toggleProtocol(`${cat.id}-${protocol}`)
                          }
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 12,
                            paddingBottom: 8,
                            borderBottomWidth: 1,
                            borderBottomColor: '#f3f4f6',
                          }}
                        >
                          <View>
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: '700',
                                color: '#111827',
                                marginBottom: 4,
                              }}
                            >
                              {protocol}
                            </Text>
                            <Text
                              style={{
                                fontSize: 10,
                                color: '#9ca3af',
                              }}
                            >
                              {grouped[protocol].length} vault
                              {grouped[protocol].length > 1 ? 's' : ''}
                            </Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text
                              style={{
                                fontSize: 20,
                                fontWeight: '800',
                                color: '#059669',
                                marginBottom: 2,
                              }}
                            >
                              ${protocolTotal.toFixed(3)}
                            </Text>
                            <Text
                              style={{
                                fontSize: 9,
                                color: '#d1d5db',
                              }}
                            >
                              {collapsed[`${cat.id}-${protocol}`]
                                ? t('common.expand', { defaultValue: 'Expand' })
                                : t('common.collapse', {
                                    defaultValue: 'Collapse',
                                  })}
                            </Text>
                          </View>
                        </TouchableOpacity>

                        {!collapsed[`${cat.id}-${protocol}`] &&
                          grouped[protocol].map(v => (
                            <TouchableOpacity
                              onPress={() => handleVaultPress(v.id)}
                              key={`${v.id}`}
                              style={{
                                backgroundColor: '#fff',
                                borderRadius: 16,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: '#f3f4f6',
                                marginBottom: 10,
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-start',
                                }}
                              >
                                <View style={{ flex: 1, paddingRight: 12 }}>
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      fontWeight: '700',
                                      color: '#111827',
                                      marginBottom: 6,
                                    }}
                                  >
                                    {v.market || v.id}
                                  </Text>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      flexWrap: 'wrap',
                                    }}
                                  >
                                    <Text
                                      style={{
                                        fontSize: 11,
                                        color: '#9ca3af',
                                        marginRight: 4,
                                      }}
                                    >
                                      {v.chain}
                                    </Text>
                                    <Text
                                      style={{
                                        fontSize: 11,
                                        color: '#9ca3af',
                                        marginRight: 4,
                                      }}
                                    >
                                      •
                                    </Text>
                                    <Text
                                      style={{
                                        fontSize: 11,
                                        color: '#9ca3af',
                                        marginRight: 4,
                                      }}
                                    >
                                      {v.risk}
                                    </Text>
                                    {'balanceUsdValue' in v && (
                                      <>
                                        <Text
                                          style={{
                                            fontSize: 11,
                                            color: '#9ca3af',
                                            marginRight: 4,
                                          }}
                                        >
                                          •
                                        </Text>
                                        <Text
                                          style={{
                                            fontSize: 11,
                                            color: '#6b7280',
                                          }}
                                        >
                                          APY {v.apy}
                                        </Text>
                                      </>
                                    )}
                                  </View>
                                </View>
                                {'balanceUsdValue' in v && (
                                  <View style={{ alignItems: 'flex-end' }}>
                                    <Text
                                      style={{
                                        fontSize: 18,
                                        fontWeight: '500',
                                        color: '#059669',
                                        marginBottom: 2,
                                      }}
                                    >
                                      $
                                      {(v.balanceUsdValue as number).toFixed(3)}
                                    </Text>
                                    <Text
                                      style={{
                                        fontSize: 10,
                                        color: '#9ca3af',
                                      }}
                                    >
                                      USD
                                    </Text>
                                  </View>
                                )}
                              </View>

                              {v.note ? (
                                <Text
                                  style={{
                                    fontSize: 12,
                                    color: '#6b7280',
                                    marginTop: 8,
                                  }}
                                >
                                  {v.note}
                                </Text>
                              ) : null}
                            </TouchableOpacity>
                          ))}
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </CommonSafeAreaView>
  );
};

export default PortfolioScreen;
