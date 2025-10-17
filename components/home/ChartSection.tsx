import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserRewards, getDailyRewards } from '@/api/user';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';

interface ChartSectionProps {
  selectedPeriod?: 'daily' | 'monthly' | 'yearly';
}

const ChartSection: React.FC<ChartSectionProps> = ({
  selectedPeriod = 'daily',
}) => {
  const { activeWallet } = useMultiChainWallet();

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

  const chartData = useMemo(() => {
    const dailyRewards = getDailyRewards(rewardsData);

    const generateRealDates = () => {
      const dates = [];
      const today = new Date();

      for (let i = 4; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i - 1);

        const dateStr = date.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
        });

        const isToday = i === 0;
        const isFuture = i < 0;

        dates.push({
          date: dateStr,
          reward: 0,
          isToday,
          isFuture,
        });
      }

      return dates;
    };

    if (!dailyRewards || dailyRewards.length === 0) {
      return generateRealDates();
    }

    // Format real data for chart display
    return dailyRewards.slice(-5).map((reward, index) => {
      const date = new Date(reward.date * 1000);
      date.setDate(date.getDate() - 1); // Subtract 1 day from each date
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

  // Calculate Y-axis labels and max value based on data with better adaptability
  const yAxisData = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { maxValue: 100, labels: ['100', '75', '50', '25', '0'] };
    }

    const rewards = chartData.map(item => item.reward);
    const maxReward = Math.max(...rewards);
    const nonZeroRewards = rewards.filter(r => r > 0);
    const avgReward =
      nonZeroRewards.length > 0
        ? nonZeroRewards.reduce((sum, r) => sum + r, 0) / nonZeroRewards.length
        : 0;

    // If all rewards are 0, use a default range
    if (maxReward === 0) {
      return { maxValue: 100, labels: ['100', '75', '50', '25', '0'] };
    }

    // Improved adaptive max value calculation
    let maxValue;
    if (avgReward > 0) {
      // For more adaptive scaling
      maxValue = Math.ceil(Math.max(maxReward * 1.1, avgReward * 2));
    } else {
      maxValue = Math.ceil(maxReward * 1.2); // Add 20% padding
    }

    // Generate Y-axis labels with better scaling
    const labels = [];
    // Adjust step size based on maxValue to avoid too many digits
    const stepSize = Math.ceil(maxValue / 4);
    for (let i = 4; i >= 0; i--) {
      const value = i * stepSize;
      labels.push(value.toString());
    }

    return { maxValue, labels };
  }, [chartData]);

  // Calculate bar heights based on actual data with better visual scaling
  const getBarHeight = (dataPoint: any) => {
    const maxHeight = 160; // Maximum height in pixels
    const minHeight = 8; // Minimum height for 0 values

    if (dataPoint.reward === 0) return minHeight;

    // Use a slightly logarithmic scaling for better visual representation
    const heightRatio = dataPoint.reward / yAxisData.maxValue;
    // Ensure bars don't get too small compared to each other
    const adjustedHeight = heightRatio * maxHeight;
    return Math.max(adjustedHeight, minHeight);
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
                        ? ['#2563eb', '#1e40af'] // Darker and more vibrant blue for today
                        : dataPoint.isFuture
                          ? ['transparent', 'transparent']
                          : ['#bfdbfe', '#93c5fd'] // Lighter and more subtle blue for other days
                    }
                    style={[
                      styles.bar,
                      {
                        height: getBarHeight(dataPoint),
                        width: dataPoint.isToday ? 60 : 52, // Make today's bar wider
                        borderWidth: dataPoint.isFuture ? 2 : 0,
                        borderColor: dataPoint.isFuture
                          ? '#d1d5db'
                          : 'transparent',
                        borderStyle: dataPoint.isFuture ? 'dashed' : 'solid',
                        opacity: dataPoint.isToday ? 1 : 0.6, // Make other days less prominent
                      },
                    ]}
                  />
                  {/* Always show the value on top of each bar, including when reward is 0 */}
                  <View style={styles.earningsTooltip}>
                    <Text
                      style={[
                        styles.tooltipText,
                        {
                          opacity: dataPoint.isToday ? 1 : 0.8, // Make other days' tooltips less prominent
                          fontWeight: dataPoint.isToday ? '600' : '500',
                          fontSize: dataPoint.isToday ? 11 : 10, // Slightly larger font for today
                        },
                      ]}
                    >
                      +${dataPoint.reward}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.barLabel,
                    {
                      color: dataPoint.isToday
                        ? '#0369a1' // More vibrant color for today's label
                        : dataPoint.isFuture
                          ? '#9ca3af'
                          : '#94a3b8', // Lighter color for other day labels
                      fontWeight: dataPoint.isToday ? '700' : '400',
                      fontSize: dataPoint.isToday ? 13 : 12, // Slightly larger font for today
                      opacity: dataPoint.isToday ? 1 : 0.7, // Make other day labels less prominent
                    },
                  ]}
                >
                  {dataPoint.date}
                </Text>
              </View>
            ))}
          </View>
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
    top: -28,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tooltipText: {
    backgroundColor: 'rgba(16, 185, 129, 0.8)', // More transparent
    color: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: '500',
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
