// components/PerfectVaultSavingsPlatform/components/ChartSection.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// Removed getBarHeight import - now defined locally
import { useUserRewards, getDailyRewards } from '@/api/user';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';

interface ChartSectionProps {
  selectedPeriod?: 'daily' | 'monthly' | 'yearly';
}

const ChartSection: React.FC<ChartSectionProps> = ({
  selectedPeriod = 'daily',
}) => {
  const { activeWallet } = useMultiChainWallet();
  const [currentPeriod, setCurrentPeriod] = useState<
    'daily' | 'monthly' | 'yearly'
  >('daily');

  // Fetch user rewards data
  const {
    data: rewardsData,
    isLoading,
    isError,
  } = useUserRewards(
    activeWallet?.address || '',
    selectedPeriod === 'daily'
      ? '7'
      : selectedPeriod === 'monthly'
        ? '30'
        : '365',
    !!activeWallet?.address
  );

  // Get daily rewards and format chart data
  const chartData = useMemo(() => {
    const dailyRewards = getDailyRewards(rewardsData);

    // Generate real dates for the last 5 days
    const generateRealDates = () => {
      const dates = [];
      const today = new Date();

      for (let i = 4; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const dateStr = date.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
        });

        const isToday = i === 0;
        const isFuture = i < 0;

        dates.push({
          date: dateStr,
          reward: 0, // Always 0 when no real data
          isToday,
          isFuture,
        });
      }

      return dates;
    };

    if (!dailyRewards || dailyRewards.length === 0) {
      // Return real dates with 0 rewards if no real data
      return generateRealDates();
    }

    // Format real data for chart display
    return dailyRewards.slice(-5).map((reward, index) => {
      const date = new Date(reward.date * 1000);
      const dateStr = date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
      });
      const isToday = index === dailyRewards.length - 1;
      const isFuture = false;

      return {
        date: dateStr,
        reward: reward.daily_reward,
        isToday,
        isFuture,
      };
    });
  }, [rewardsData]);

  // Calculate Y-axis labels and max value based on data
  const yAxisData = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { maxValue: 100, labels: ['100', '75', '50', '25', '0'] };
    }

    const rewards = chartData.map(item => item.reward);
    const maxReward = Math.max(...rewards);

    // If all rewards are 0, use a default range
    if (maxReward === 0) {
      return { maxValue: 100, labels: ['100', '75', '50', '25', '0'] };
    }

    // If there are actual rewards, calculate based on data
    const maxValue = Math.ceil(maxReward * 1.2); // Add 20% padding

    // Generate Y-axis labels
    const labels = [];
    for (let i = 4; i >= 0; i--) {
      const value = Math.round((maxValue * i) / 4);
      labels.push(value.toString());
    }

    return { maxValue, labels };
  }, [chartData]);

  // Calculate bar heights based on actual data
  const getBarHeight = (dataPoint: any) => {
    const maxHeight = 160; // Maximum height in pixels
    const minHeight = 8; // Minimum height for 0 values

    if (dataPoint.reward === 0) return minHeight;

    const heightRatio = dataPoint.reward / yAxisData.maxValue;
    return Math.max(heightRatio * maxHeight, minHeight);
  };

  const handlePeriodChange = (period: 'daily' | 'monthly' | 'yearly') => {
    setCurrentPeriod(period);
  };

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.chartSection}>
        <View style={styles.chartContainer}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading rewards data...</Text>
          </View>
        </View>
      </View>
    );
  }

  // Show error state
  if (isError) {
    return (
      <View style={styles.chartSection}>
        <View style={styles.chartContainer}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load rewards data</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.chartSection}>
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <View style={styles.chartYAxis}>
            {yAxisData.labels.map((label, index) => (
              <Text key={index} style={styles.yAxisLabel}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.chartBars}>
            {chartData.map((dataPoint, index) => (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <LinearGradient
                    colors={
                      dataPoint.isToday
                        ? ['#3b82f6', '#1e40af']
                        : dataPoint.isFuture
                          ? ['transparent', 'transparent']
                          : ['#93c5fd', '#60a5fa']
                    }
                    style={[
                      styles.bar,
                      {
                        height: getBarHeight(dataPoint),
                        borderWidth: dataPoint.isFuture ? 2 : 0,
                        borderColor: dataPoint.isFuture
                          ? '#d1d5db'
                          : 'transparent',
                        borderStyle: dataPoint.isFuture ? 'dashed' : 'solid',
                      },
                    ]}
                  />
                  {dataPoint.isToday && dataPoint.reward > 0 && (
                    <View style={styles.earningsTooltip}>
                      <Text style={styles.tooltipText}>
                        +${dataPoint.reward}
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.barLabel,
                    {
                      color: dataPoint.isToday
                        ? '#111827'
                        : dataPoint.isFuture
                          ? '#9ca3af'
                          : '#6b7280',
                      fontWeight: dataPoint.isToday ? '600' : '400',
                    },
                  ]}
                >
                  {dataPoint.date}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.chartControls}>
          <TouchableOpacity
            style={
              currentPeriod === 'daily'
                ? styles.activeControl
                : styles.inactiveControl
            }
            onPress={() => handlePeriodChange('daily')}
          >
            <Text
              style={
                currentPeriod === 'daily'
                  ? styles.activeControlText
                  : styles.inactiveControlText
              }
            >
              Daily
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              currentPeriod === 'monthly'
                ? styles.activeControl
                : styles.inactiveControl
            }
            onPress={() => handlePeriodChange('monthly')}
          >
            <Text
              style={
                currentPeriod === 'monthly'
                  ? styles.activeControlText
                  : styles.inactiveControlText
              }
            >
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              currentPeriod === 'yearly'
                ? styles.activeControl
                : styles.inactiveControl
            }
            onPress={() => handlePeriodChange('yearly')}
          >
            <Text
              style={
                currentPeriod === 'yearly'
                  ? styles.activeControlText
                  : styles.inactiveControlText
              }
            >
              Yearly
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
    marginTop: 8,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  chartHeader: {
    height: 200,
    marginBottom: 28,
    position: 'relative',
  },
  chartYAxis: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    justifyContent: 'space-between',
  },
  yAxisLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  chartBars: {
    marginLeft: 36,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barContainer: {
    alignItems: 'center',
  },
  barWrapper: {
    position: 'relative',
  },
  bar: {
    width: 52,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  earningsTooltip: {
    position: 'absolute',
    top: -36,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tooltipText: {
    backgroundColor: '#10b981',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  barLabel: {
    fontSize: 12,
    marginTop: 10,
  },
  chartControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 12,
  },
  activeControl: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    maxWidth: 90,
    alignItems: 'center',
  },
  activeControlText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  inactiveControl: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    maxWidth: 90,
    alignItems: 'center',
  },
  inactiveControlText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
  },
  // Loading and error states
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 15,
    color: '#6b7280',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  errorText: {
    fontSize: 15,
    color: '#ef4444',
  },
});

export default ChartSection;
