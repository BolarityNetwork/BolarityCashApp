import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserRewards, getDailyRewards } from '@/api/user';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';
import useAppRefresh from '@/hooks/useAppRefresh';
import { formatCompactNumber } from '@/utils/utils';

interface ChartSectionProps {
  selectedPeriod?: 'daily' | 'monthly' | 'yearly';
}

const ChartSection: React.FC<ChartSectionProps> = ({
  selectedPeriod = 'daily',
}) => {
  const { activeWallet } = useMultiChainWallet();

  const { data: rewardsData, refetch: _refetchRewards } = useUserRewards(
    activeWallet?.address || '',
    selectedPeriod === 'daily'
      ? '7'
      : selectedPeriod === 'monthly'
        ? '30'
        : '365',
    !!activeWallet?.address
  );

  useAppRefresh(() => {
    if (activeWallet?.address && _refetchRewards) {
      _refetchRewards();
    }
  });

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

    // Sort rewards by date (oldest first, newest last)
    const sortedRewards = [...dailyRewards].sort((a, b) => a.date - b.date);

    // Generate 5 days of data (4 days ago to today, plus 1 future day)
    const result = [];
    const today = new Date();

    for (let i = 4; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i - 1);

      // Find matching reward data for this date
      const matchingReward = sortedRewards.find(reward => {
        const rewardDate = new Date(reward.date * 1000);
        return rewardDate.toDateString() === targetDate.toDateString();
      });

      const dateStr = targetDate.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
      });

      const isToday = i === 0;
      const isFuture = i < 0;

      result.push({
        date: dateStr,
        reward: matchingReward ? matchingReward.daily_reward : 0,
        isToday,
        isFuture,
      });
    }

    return result;
  }, [rewardsData]);

  // Calculate Y-axis labels dynamically based on actual reward data
  const yAxisData = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { maxValue: 12000, labels: ['12K', '10K', '8K'] };
    }

    // Get all reward values (excluding future dates)
    const rewards = chartData
      .filter(item => !item.isFuture)
      .map(item => item.reward);

    const maxReward = Math.max(...rewards, 0);

    // If all rewards are 0, use default range
    if (maxReward === 0) {
      return { maxValue: 12000, labels: ['12K', '10K', '8K'] };
    }

    // Calculate a nice rounded max value with some padding
    const calculateNiceMax = (value: number): number => {
      if (value <= 0) return 0.1;

      // For very small values (< 1), use decimal steps
      if (value < 1) {
        // Round up to next nice decimal (0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1.0)
        if (value <= 0.01) return 0.01;
        if (value <= 0.02) return 0.02;
        if (value <= 0.05) return 0.05;
        if (value <= 0.1) return 0.1;
        if (value <= 0.2) return 0.2;
        if (value <= 0.5) return 0.5;
        return 1.0;
      }

      // For values >= 1, use normal rounding
      const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
      const normalized = value / magnitude;

      let niceNormalized;
      if (normalized <= 1) niceNormalized = 1;
      else if (normalized <= 2) niceNormalized = 2;
      else if (normalized <= 5) niceNormalized = 5;
      else niceNormalized = 10;

      // Add 20% padding for better visualization
      const maxValue = niceNormalized * magnitude * 1.2;
      return Math.ceil(maxValue * 100) / 100; // Round to 2 decimal places
    };

    const maxValue = calculateNiceMax(maxReward);

    // Format label based on value size
    const formatLabel = (value: number): string => {
      if (value >= 1000) {
        const kValue = value / 1000;
        if (kValue % 1 === 0) {
          return `${Math.round(kValue)}K`;
        }
        return `${kValue.toFixed(1)}K`;
      } else if (value >= 1) {
        // For values >= 1, show as integer or 1 decimal
        if (value % 1 === 0) {
          return Math.round(value).toString();
        }
        return value.toFixed(1);
      } else {
        // For values < 1, show 2 decimal places
        return value.toFixed(2);
      }
    };

    // Generate 3 labels: top (max), middle, bottom (0)
    const middleValue = maxValue / 2;
    const labels = [
      formatLabel(maxValue), // Top label
      formatLabel(middleValue), // Middle label
      formatLabel(0), // Bottom label
    ];

    // Remove duplicate labels
    const uniqueLabels = Array.from(new Set(labels));
    // Ensure we have 3 labels, fill with calculated values if needed
    if (uniqueLabels.length < 3) {
      // If we have duplicates, recalculate middle value
      const step1 = maxValue * 0.67;
      const step2 = maxValue * 0.33;
      return {
        maxValue,
        labels: [
          formatLabel(maxValue),
          formatLabel(step1),
          formatLabel(step2),
        ].filter((v, i, a) => a.indexOf(v) === i), // Remove duplicates
      };
    }

    return { maxValue, labels: uniqueLabels };
  }, [chartData]);

  // Calculate bar heights based on actual data
  const getBarHeight = (dataPoint: any) => {
    const maxHeight = 160; // Reduced height since period buttons are removed
    if (dataPoint.reward === 0) return 0;
    const heightRatio = dataPoint.reward / yAxisData.maxValue;
    return heightRatio * maxHeight;
  };

  // Get gradient colors for bars - green gradient for most, special for future
  const getBarGradient = (dataPoint: any) => {
    if (dataPoint.isFuture) {
      // Last bar (24 Apr) - orange to purple gradient with border
      return {
        colors: ['#FF4D00', '#FF00D6'] as [string, string],
        borderColor: '#FF4D00',
        borderWidth: 1,
      };
    }
    // Green gradient for other bars
    return {
      colors: ['#12B04A', '#33CD95'] as [string, string],
      borderColor: 'transparent',
      borderWidth: 0,
    };
  };

  return (
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
          {chartData.map((dataPoint, index) => {
            const barHeight = getBarHeight(dataPoint);
            const gradientConfig = getBarGradient(dataPoint);

            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  {/* Background bar (light gray) */}
                  <View
                    style={[
                      styles.backgroundBar,
                      {
                        height: 160,
                        width: 44,
                      },
                    ]}
                  />
                  {/* Actual bar with gradient */}
                  {barHeight > 0 && (
                    <LinearGradient
                      colors={gradientConfig.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          width: 44,
                          borderWidth: gradientConfig.borderWidth,
                          borderColor: gradientConfig.borderColor,
                          position: 'absolute',
                          bottom: 0,
                          // Dynamic border radius: fully rounded only if height is large enough
                          // For small heights, use smaller radius to avoid visual issues
                          borderRadius:
                            barHeight >= 22
                              ? 22
                              : barHeight > 0
                                ? Math.max(barHeight / 2, 4)
                                : 0,
                        },
                      ]}
                    />
                  )}
                  {/* Tooltip - show for all bars with data */}
                  {barHeight > 0 && (
                    <View style={styles.earningsTooltip}>
                      <View style={styles.tooltipContainer}>
                        <Text style={styles.tooltipText}>
                          +${formatCompactNumber(Number(dataPoint.reward))}
                        </Text>
                        <View style={styles.tooltipArrow} />
                      </View>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.barLabel,
                    {
                      color: dataPoint.isToday ? '#000000' : '#ACB3BF',
                    },
                  ]}
                >
                  {dataPoint.date}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingTop: 64,
    paddingBottom: 30,
  },
  chartHeader: {
    height: 180,
    position: 'relative',
    marginBottom: 0,
  },
  chartYAxis: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    justifyContent: 'space-between',
    width: 30,
  },
  yAxisLabel: {
    fontSize: 14,
    color: '#ACB3BF',
    lineHeight: 17,
  },
  chartBars: {
    marginLeft: 38,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    position: 'relative',
    width: 44,
    height: 160,
    alignItems: 'center',
  },
  backgroundBar: {
    backgroundColor: '#F8F8F8',
    borderRadius: 50, // Fully rounded
    position: 'absolute',
    bottom: 0,
  },
  bar: {
    borderRadius: 50,
  },
  earningsTooltip: {
    position: 'absolute',
    top: -30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  tooltipContainer: {
    backgroundColor: '#000000',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    position: 'relative',
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 17,
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -3,
    left: '50%',
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 3,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#000000',
  },
  barLabel: {
    fontSize: 14,
    lineHeight: 17,
    marginTop: 8,
    color: '#ACB3BF',
  },
  chartControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 0,
    paddingTop: 0,
  },
  periodButton: {
    width: 80,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#000000',
    borderWidth: 0,
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 14,
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
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
