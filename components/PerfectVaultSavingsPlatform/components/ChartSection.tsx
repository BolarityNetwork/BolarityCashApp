// components/PerfectVaultSavingsPlatform/components/ChartSection.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getBarHeight } from '../constants';

const ChartSection: React.FC = () => {
  const dates = ['20 Apr', '21 Apr', '22 Apr', '23 Apr', '24 Apr'];

  return (
    <View style={styles.chartSection}>
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <View style={styles.chartYAxis}>
            <Text style={styles.yAxisLabel}>12k</Text>
            <Text style={styles.yAxisLabel}>10k</Text>
            <Text style={styles.yAxisLabel}>8k</Text>
          </View>
          
          <View style={styles.chartBars}>
            {dates.map((date, index) => (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <LinearGradient
                    colors={index === 3 ? ['#3b82f6', '#1e40af'] : 
                           index === 4 ? ['transparent', 'transparent'] :
                           ['#93c5fd', '#60a5fa']}
                    style={[
                      styles.bar,
                      { 
                        height: getBarHeight(index),
                        borderWidth: index === 4 ? 2 : 0,
                        borderColor: index === 4 ? '#d1d5db' : 'transparent',
                        borderStyle: index === 4 ? 'dashed' : 'solid'
                      }
                    ]}
                  />
                  {index === 3 && (
                    <View style={styles.earningsTooltip}>
                      <Text style={styles.tooltipText}>+$83</Text>
                    </View>
                  )}
                </View>
                <Text style={[
                  styles.barLabel,
                  { 
                    color: index === 3 ? '#111827' : 
                           index === 4 ? '#9ca3af' : '#6b7280',
                    fontWeight: index === 3 ? '600' : '400'
                  }
                ]}>
                  {date}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.chartControls}>
          <TouchableOpacity style={styles.activeControl}>
            <Text style={styles.activeControlText}>Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inactiveControl}>
            <Text style={styles.inactiveControlText}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inactiveControl}>
            <Text style={styles.inactiveControlText}>Yearly</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
    marginTop: 16,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartHeader: {
    height: 192,
    marginBottom: 24,
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
    marginLeft: 32,
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
    width: 48,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  earningsTooltip: {
    position: 'absolute',
    top: -32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tooltipText: {
    backgroundColor: '#10b981',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  barLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  chartControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  activeControl: {
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeControlText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  inactiveControl: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  inactiveControlText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChartSection;