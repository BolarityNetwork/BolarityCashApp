// components/PerfectVaultSavingsPlatform/components/ActivityList.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import SentIcon from '@/assets/icon/transaction/sent.png';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import Skeleton from '../common/Skeleton';

interface ActivityListProps {}

const ActivityList: React.FC<ActivityListProps> = () => {
  const { t } = useTranslation();
  const {
    formattedTransactions,
    isLoading,
    error,
    refreshTransactions,
    currentAddress,
  } = useTransactionHistory();

  // 如果没有连接钱包
  if (!currentAddress) {
    return (
      <View style={styles.activitySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.recentActivity')}</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {t('home.connectWalletToView')}
          </Text>
        </View>
      </View>
    );
  }

  // 错误状态
  if (error && formattedTransactions.length === 0) {
    return (
      <View style={styles.activitySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.recentActivity')}</Text>
          <TouchableOpacity onPress={refreshTransactions}>
            <Text style={styles.sectionAction}>{t('home.retry')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.activitySection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('home.recentActivity')}</Text>
        <TouchableOpacity onPress={refreshTransactions}>
          <Text style={styles.sectionAction}>
            {isLoading ? t('home.loadingTransactions') : t('home.refresh')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 加载状态 */}
      {isLoading && formattedTransactions.length === 0 ? (
        <View style={styles.activityContainer}>
          {[1, 2, 3].map(index => (
            <React.Fragment key={index}>
              <View style={styles.activityItem}>
                <View style={styles.activityLeft}>
                  <Skeleton width={44} height={44} borderRadius={16} />
                  <View style={styles.activityInfo}>
                    <Skeleton width={80} height={16} borderRadius={8} />
                    <View style={{ marginTop: 4 }}>
                      <Skeleton width={120} height={12} borderRadius={6} />
                    </View>
                    <View style={{ marginTop: 4 }}>
                      <Skeleton width={100} height={12} borderRadius={6} />
                    </View>
                  </View>
                </View>
                <View style={styles.activityRight}>
                  <Skeleton width={60} height={16} borderRadius={8} />
                  <View style={{ marginTop: 4 }}>
                    <Skeleton width={40} height={12} borderRadius={6} />
                  </View>
                </View>
              </View>
            </React.Fragment>
          ))}
        </View>
      ) : formattedTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {t('home.noTransactionsFound')}
          </Text>
          <Text style={styles.emptyStateSubtext}>
            {t('home.startUsingDefi')}
          </Text>
        </View>
      ) : (
        <View style={styles.activityContainer}>
          {formattedTransactions.map((transaction, index) => {
            // Format transaction hash for display
            const displayHash = transaction.hash
              ? transaction.hash.length > 20
                ? `${transaction.hash.slice(0, 6)}...${transaction.hash.slice(-6)}`
                : transaction.hash
              : '';

            return (
              <React.Fragment key={index}>
                <View style={styles.activityItem}>
                  <View style={styles.activityLeft}>
                    {/* Gradient Icon */}
                    <Image
                      source={SentIcon}
                      style={{ width: 44, height: 44 }}
                      contentFit="contain"
                    />
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityType}>
                        {transaction.type.charAt(0).toUpperCase() +
                          transaction.type.slice(1)}
                      </Text>
                      {transaction.date && (
                        <Text style={styles.activityDetails}>
                          Ethereum . {transaction.date}
                        </Text>
                      )}
                      {displayHash && (
                        <Text style={styles.activityHash}>{displayHash}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.activityRight}>
                    <Text style={styles.activityAmount}>
                      {transaction.amount}
                    </Text>
                    {transaction.token && (
                      <Text style={styles.activityToken}>
                        {transaction.token}
                      </Text>
                    )}
                  </View>
                </View>
              </React.Fragment>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  activitySection: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
    marginTop: 2,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  sectionAction: {
    fontSize: 14,
    color: '#ACB3BF', // Exact color from design
    fontWeight: '600',
  },
  activityContainer: {
    // Container is now part of activitySection
  },
  activityItem: {
    paddingVertical: 16,
    paddingHorizontal: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },
  activityType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 20,
    marginBottom: 0,
  },
  activityDetails: {
    fontSize: 12,
    color: '#ACB3BF',
    lineHeight: 17,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00C87F',
  },
  activityToken: {
    fontSize: 12,
    color: '#ACB3BF',
  },
  activityHash: {
    fontSize: 12,
    color: '#505C5C',
    lineHeight: 17,
  },
  activitySeparator: {
    height: 1,
    backgroundColor: '#DADADA',
    marginVertical: 0,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  errorState: {
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#ef4444',
    textAlign: 'center',
  },
  loadMoreButton: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    marginHorizontal: 4,
  },
  loadMoreText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
});

export default ActivityList;
