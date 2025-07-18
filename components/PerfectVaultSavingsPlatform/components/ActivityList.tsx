// components/PerfectVaultSavingsPlatform/components/ActivityList.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import IconComponent from './IconComponent';
import { Transaction } from '../constants';

interface ActivityListProps {
  transactions: Transaction[];
}

const ActivityList: React.FC<ActivityListProps> = ({ transactions }) => {
  return (
    <View style={styles.activitySection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <TouchableOpacity>
          <Text style={styles.sectionAction}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.activityList}>
        {transactions.map((transaction, index) => (
          <View key={index} style={styles.activityItem}>
            <View style={styles.activityLeft}>
              <View style={styles.activityIcon}>
                <IconComponent 
                  name={transaction.type === 'Interest Earned' ? "Percent" : "DollarSign"} 
                  size={20} 
                  color={transaction.type === 'Interest Earned' ? "#059669" : "#2563eb"} 
                />
              </View>
              <View>
                <Text style={styles.activityType}>{transaction.type}</Text>
                <Text style={styles.activityDetails}>
                  {transaction.vault} • {transaction.date}
                </Text>
              </View>
            </View>
            <Text style={[
              styles.activityAmount,
              { color: transaction.isPositive ? "#059669" : "#2563eb" }
            ]}>
              {transaction.amount}
            </Text>
          </View>
        ))}
      </View>
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
    gap: 12,
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
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  activityDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ActivityList;