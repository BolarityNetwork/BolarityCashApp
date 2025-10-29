// components/PerfectVaultSavingsPlatform/components/ActivityList.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import SentIcon from '@/assets/icon/transaction/sent.png';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

interface ActivityListProps {}

const ActivityList: React.FC<ActivityListProps> = () => {
  const { t } = useTranslation();
  const {
    formattedTransactions,
    isLoading,
    error,
    refreshTransactions,
    loadMoreTransactions,
    hasMore,
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
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refreshTransactions}
          >
            <Text style={styles.retryButtonText}>{t('home.tryAgain')}</Text>
          </TouchableOpacity>
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
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>
            {t('home.loadingTransactions')}
          </Text>
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
        <ScrollView
          style={styles.activityList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refreshTransactions}
              colors={['#059669']}
              tintColor="#059669"
            />
          }
        >
          {formattedTransactions.map((transaction, index) => {
            return (
              <View
                key={`${transaction.hash || index}`}
                style={styles.activityItem}
              >
                <View style={styles.activityLeft}>
                  <Image source={SentIcon} style={{ width: 48, height: 48 }} />
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityType}>{transaction.type}</Text>
                    <Text style={styles.activityDetails}>
                      {transaction.vault}
                    </Text>
                    {transaction.hash && (
                      <Text style={styles.activityHash}>
                        {transaction.hash.substring(0, 8)}...
                        {transaction.hash.substring(
                          transaction.hash.length - 6
                        )}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.activityRight}>
                  <Text
                    style={[
                      styles.activityAmount,
                      { color: transaction.isPositive ? '#059669' : '#2563eb' },
                    ]}
                  >
                    {transaction.amount}
                  </Text>
                  {transaction.token && (
                    <Text style={styles.activityToken}>
                      {transaction.token}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}

          {/* 加载更多按钮 */}
          {hasMore && (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={loadMoreTransactions}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#059669" />
              ) : (
                <Text style={styles.loadMoreText}>{t('home.loadMore')}</Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  activitySection: {
    paddingHorizontal: 24,
    marginBottom: 32,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  sectionAction: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  activityList: {
    maxHeight: 400, // 限制高度，使其可滚动
  },
  activityItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 12,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
    minWidth: 0, // Allow text to wrap properly
    marginLeft: 12,
  },
  activityType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flexShrink: 1,
    flexWrap: 'nowrap',
  },
  activityDetails: {
    fontSize: 14,
    color: '#6b7280',
    flexShrink: 1,
    flexWrap: 'nowrap',
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activityToken: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  activityHash: {
    fontSize: 11,
    color: '#9ca3af',
    fontFamily: 'monospace',
    marginTop: 2,
  },

  // 状态样式
  loadingState: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
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
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
