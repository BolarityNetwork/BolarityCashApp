// components/PerfectVaultSavingsPlatform/components/BalanceSection.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AnimatedNumber from '../../AnimatedNumber';

interface BalanceSectionProps {
  totalBalance: number;
  todayEarnings: number;
  monthlyEarnings: number;
}

const BalanceSection: React.FC<BalanceSectionProps> = ({
  totalBalance,
  todayEarnings,
  monthlyEarnings,
}) => {
  return (
    <View style={styles.balanceSectionContainer}>
      <View style={styles.balanceSection}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Total Savings Balance</Text>
        </View>
        <View style={styles.balanceContent}>
          <View style={styles.balanceLeft}>
            {/* 🎯 使用 AnimatedNumber 组件替换原来的余额显示 */}
            <AnimatedNumber
              value={totalBalance}
              style={styles.balanceAmount}
              duration={1200}
              formatOptions={{
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                prefix: '$', // ✅ 正确的字符串
              }}
            />
            <View style={styles.earningsRow}>
              <View style={styles.earningsItem}>
                {/* 🎯 今日收益也使用动画 */}
                <AnimatedNumber
                  value={todayEarnings}
                  style={styles.earningsAmount}
                  duration={800}
                  formatOptions={{
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                    prefix: '+$', // ✅ 正确的字符串
                  }}
                />
                <Text style={styles.earningsLabel}>today</Text>
              </View>
              <View style={styles.earningsItem}>
                {/* 🎯 月度收益也使用动画 */}
                <AnimatedNumber
                  value={monthlyEarnings}
                  style={styles.earningsAmount}
                  duration={1000}
                  formatOptions={{
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                    prefix: '+$', // ✅ 正确的字符串
                  }}
                />
                <Text style={styles.earningsLabel}>this month</Text>
              </View>
            </View>
          </View>
          <View style={styles.apyBadge}>
            <Text style={styles.apyText}>Earning 8.4%</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  balanceSectionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 6,
  },
  balanceSection: {
    marginBottom: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  balanceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceLeft: {
    flex: 1,
  },
  balanceAmount: {
    fontSize: 26,
    fontWeight: '300',
    color: '#111827',
    marginBottom: 0,
  },
  earningsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  earningsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  earningsAmount: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  earningsLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  apyBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: -4,
  },
  apyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default BalanceSection;
