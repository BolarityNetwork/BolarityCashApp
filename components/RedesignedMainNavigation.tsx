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
import RedesignedProfileScreen from './RedesignedProfileScreen';

type TabType = 'home' | 'actions' | 'profile';

// 线条图标组件
const LineIcon = ({
  name,
  isActive,
  size = 20,
}: {
  name: string;
  isActive: boolean;
  size?: number;
}) => {
  const iconColor = isActive ? '#fff' : '#6b7280';

  switch (name) {
    case 'home':
      return (
        <View style={[styles.lineIcon, { width: size, height: size }]}>
          {/* 房子图标 */}
          <View
            style={{
              position: 'relative',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* 三角形屋顶 */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderLeftWidth: size * 0.35,
                borderRightWidth: size * 0.35,
                borderBottomWidth: size * 0.3,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: iconColor,
              }}
            />

            {/* 房子主体 */}
            <View
              style={{
                marginTop: size * 0.25,
                width: size * 0.55,
                height: size * 0.45,
                borderColor: iconColor,
                borderWidth: 1.5,
                borderTopWidth: 0,
              }}
            />

            {/* 门 */}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                width: size * 0.18,
                height: size * 0.25,
                borderColor: iconColor,
                borderWidth: 1.5,
                borderTopWidth: 0,
              }}
            />
          </View>
        </View>
      );

    case 'actions':
      return (
        <View style={[styles.lineIcon, { width: size, height: size }]}>
          {/* 闪电图标 */}
          <View
            style={{
              position: 'relative',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* 上半部分闪电 */}
            <View
              style={{
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderTopWidth: size * 0.35,
                borderBottomWidth: 0,
                borderLeftWidth: size * 0.15,
                borderRightWidth: size * 0.25,
                borderTopColor: iconColor,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                marginBottom: -1,
              }}
            />
            {/* 下半部分闪电 */}
            <View
              style={{
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderTopWidth: 0,
                borderBottomWidth: size * 0.35,
                borderLeftWidth: size * 0.25,
                borderRightWidth: size * 0.15,
                borderBottomColor: iconColor,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                marginLeft: size * 0.1,
              }}
            />
          </View>
        </View>
      );

    case 'profile':
      return (
        <View style={[styles.lineIcon, { width: size, height: size }]}>
          {/* 用户图标 */}
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            {/* 头部 */}
            <View
              style={{
                width: size * 0.35,
                height: size * 0.35,
                borderRadius: size * 0.175,
                borderColor: iconColor,
                borderWidth: 1.5,
                marginBottom: 2,
              }}
            />
            {/* 身体 */}
            <View
              style={{
                width: size * 0.65,
                height: size * 0.35,
                borderTopLeftRadius: size * 0.325,
                borderTopRightRadius: size * 0.325,
                borderColor: iconColor,
                borderWidth: 1.5,
                borderBottomWidth: 0,
              }}
            />
          </View>
        </View>
      );

    default:
      return <View style={{ width: size, height: size }} />;
  }
};

const RedesignedMainNavigation = () => {
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
      <View style={styles.content}>{renderContent()}</View>

      {/* Bottom Navigation */}
      <SafeAreaView style={styles.bottomNavSafeArea}>
        <View style={styles.bottomNavContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,1)']}
            style={styles.bottomNav}
          >
            {/* Home Tab */}
            <TouchableOpacity
              style={[
                styles.navTab,
                activeTab === 'home' && styles.activeNavTab,
              ]}
              onPress={() => setActiveTab('home')}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.navIconContainer,
                  activeTab === 'home' && styles.activeNavIconContainer,
                ]}
              >
                <LineIcon
                  name="home"
                  isActive={activeTab === 'home'}
                  size={16}
                />
              </View>
              <Text
                style={[
                  styles.navText,
                  activeTab === 'home' && styles.activeNavText,
                ]}
              >
                Home
              </Text>
            </TouchableOpacity>

            {/* Actions Tab - 中间的特殊按钮 */}
            <TouchableOpacity
              style={[
                styles.actionsTab,
                activeTab === 'actions' && styles.activeActionsTab,
              ]}
              onPress={() => setActiveTab('actions')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  activeTab === 'actions'
                    ? ['#667eea', '#764ba2']
                    : ['#f3f4f6', '#e5e7eb']
                }
                style={styles.actionsButton}
              >
                <LineIcon
                  name="actions"
                  isActive={activeTab === 'actions'}
                  size={20}
                />
              </LinearGradient>
              <Text
                style={[
                  styles.navText,
                  activeTab === 'actions' && styles.activeNavText,
                ]}
              >
                Actions
              </Text>
            </TouchableOpacity>

            {/* Profile Tab */}
            <TouchableOpacity
              style={[
                styles.navTab,
                activeTab === 'profile' && styles.activeNavTab,
              ]}
              onPress={() => setActiveTab('profile')}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.navIconContainer,
                  activeTab === 'profile' && styles.activeNavIconContainer,
                ]}
              >
                <LineIcon
                  name="profile"
                  isActive={activeTab === 'profile'}
                  size={16}
                />
              </View>
              <Text
                style={[
                  styles.navText,
                  activeTab === 'profile' && styles.activeNavText,
                ]}
              >
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
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  navTab: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    minWidth: 60,
  },
  activeNavTab: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  navIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  activeNavIconContainer: {
    backgroundColor: '#667eea',
    transform: [{ scale: 1.1 }],
  },

  // 线条图标样式
  lineIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 14,
  },
  activeNavIcon: {
    fontSize: 14,
  },
  navText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeNavText: {
    color: '#667eea',
    fontWeight: '600',
  },
  actionsTab: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 8,
  },
  activeActionsTab: {
    transform: [{ scale: 1.05 }],
  },
  actionsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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

export { RedesignedMainNavigation };
export default RedesignedMainNavigation;
