// components/RedesignedMainNavigation.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PerfectVaultSavingsPlatform from './PerfectVaultSavingsPlatform';
import { RedesignedProfileScreen } from './RedesignedProfileScreen';

type TabType = 'home' | 'actions' | 'profile';

export const RedesignedMainNavigation = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <PerfectVaultSavingsPlatform />;
      case 'actions':
        return <ActionsScreen />;
      case 'profile':
        return <RedesignedProfileScreen />;
      default:
        return <PerfectVaultSavingsPlatform />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Main Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Bottom Navigation */}
      <SafeAreaView style={styles.bottomNavSafeArea}>
        <View style={styles.bottomNavContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,1)']}
            style={styles.bottomNav}
          >
            {/* Home Tab */}
            <TouchableOpacity
              style={[styles.navTab, activeTab === 'home' && styles.activeNavTab]}
              onPress={() => setActiveTab('home')}
              activeOpacity={0.8}
            >
              <View style={[styles.navIconContainer, activeTab === 'home' && styles.activeNavIconContainer]}>
                <Text style={[styles.navIcon, activeTab === 'home' && styles.activeNavIcon]}>🏠</Text>
              </View>
              <Text style={[styles.navText, activeTab === 'home' && styles.activeNavText]}>
                Home
              </Text>
            </TouchableOpacity>

            {/* Actions Tab - 中间的特殊按钮 */}
            <TouchableOpacity
              style={[styles.actionsTab, activeTab === 'actions' && styles.activeActionsTab]}
              onPress={() => setActiveTab('actions')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={activeTab === 'actions' ? ['#667eea', '#764ba2'] : ['#f3f4f6', '#e5e7eb']}
                style={styles.actionsButton}
              >
                <Text style={[styles.actionsIcon, activeTab === 'actions' && styles.activeActionsIcon]}>⚡</Text>
              </LinearGradient>
              <Text style={[styles.navText, activeTab === 'actions' && styles.activeNavText]}>
                Actions
              </Text>
            </TouchableOpacity>

            {/* Profile Tab */}
            <TouchableOpacity
              style={[styles.navTab, activeTab === 'profile' && styles.activeNavTab]}
              onPress={() => setActiveTab('profile')}
              activeOpacity={0.8}
            >
              <View style={[styles.navIconContainer, activeTab === 'profile' && styles.activeNavIconContainer]}>
                <Text style={[styles.navIcon, activeTab === 'profile' && styles.activeNavIcon]}>👤</Text>
              </View>
              <Text style={[styles.navText, activeTab === 'profile' && styles.activeNavText]}>
                Profile
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </SafeAreaView>
    </View>
  );
};

// Actions页面 - 暂时空白
const ActionsScreen = () => {
  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.actionsScreenContainer}
    >
      <SafeAreaView style={styles.actionsScreenContent}>
        <View style={styles.actionsHeader}>
          <View style={styles.actionsLogoContainer}>
            <Text style={styles.actionsLogo}>⚡</Text>
          </View>
          <Text style={styles.actionsTitle}>Quick Actions</Text>
          <Text style={styles.actionsSubtitle}>Coming Soon</Text>
        </View>

        <View style={styles.actionsPlaceholder}>
          <View style={styles.placeholderIcon}>
            <Text style={styles.placeholderIconText}>🚧</Text>
          </View>
          <Text style={styles.placeholderTitle}>Under Construction</Text>
          <Text style={styles.placeholderText}>
            This section is being built with amazing features.{'\n'}
            Stay tuned for updates!
          </Text>
        </View>

        <View style={styles.actionsFeatures}>
          <Text style={styles.featuresTitle}>Coming Features:</Text>
          {[
            '🔄 Cross-chain swaps',
            '⚡ Lightning transfers',
            '🎯 Smart routing',
            '📊 Portfolio analytics',
            '🎨 NFT management',
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
  },
  bottomNavSafeArea: {
    backgroundColor: 'transparent',
  },
  bottomNavContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  navTab: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 70,
  },
  activeNavTab: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  navIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activeNavIconContainer: {
    backgroundColor: '#667eea',
    transform: [{ scale: 1.1 }],
  },
  navIcon: {
    fontSize: 18,
  },
  activeNavIcon: {
    fontSize: 18,
  },
  navText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeNavText: {
    color: '#667eea',
    fontWeight: '600',
  },
  actionsTab: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 10,
  },
  activeActionsTab: {
    transform: [{ scale: 1.05 }],
  },
  actionsButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionsIcon: {
    fontSize: 24,
    color: '#6b7280',
  },
  activeActionsIcon: {
    color: '#fff',
  },
  actionsScreenContainer: {
    flex: 1,
  },
  actionsScreenContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  actionsHeader: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  actionsLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  actionsLogo: {
    fontSize: 40,
  },
  actionsTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  actionsSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  actionsPlaceholder: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 40,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  placeholderIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  placeholderIconText: {
    fontSize: 40,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  actionsFeatures: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fbbf24',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
});