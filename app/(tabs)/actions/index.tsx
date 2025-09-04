import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ActionsScreen() {
  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      className="flex-1"
    >
      <SafeAreaView className="flex-1 px-5">
        <View className="items-center pt-15 pb-10">
          <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-5 shadow-lg">
            <Text className="text-4xl">⚡</Text>
          </View>
          <Text className="text-3xl font-bold text-white text-center mb-2 shadow-sm">
            Quick Actions
          </Text>
          <Text className="text-base text-white/80 text-center">
            Coming Soon
          </Text>
        </View>

        <View className="items-center bg-white/95 rounded-3xl p-10 mb-8 shadow-lg">
          <View className="w-20 h-20 rounded-full bg-yellow-100 items-center justify-center mb-5">
            <Text className="text-4xl">🚧</Text>
          </View>
          <Text className="text-2xl font-bold text-slate-800 text-center mb-3">
            Under Construction
          </Text>
          <Text className="text-base text-slate-500 text-center leading-6">
            This section is being built with amazing features.{'\n'}
            Stay tuned for updates!
          </Text>
        </View>

        <View className="bg-white/10 rounded-2xl p-6 border border-white/20">
          <Text className="text-lg font-bold text-white mb-4">
            Coming Features:
          </Text>
          {[
            '🔄 Cross-chain swaps',
            '⚡ Lightning transfers',
            '🎯 Smart routing',
            '📊 Portfolio analytics',
            '🎨 NFT management',
          ].map((feature, index) => (
            <View key={index} className="flex-row items-center mb-3">
              <View className="w-2 h-2 rounded-full bg-yellow-400 mr-3" />
              <Text className="text-base text-white/90 font-medium">
                {feature}
              </Text>
            </View>
          ))}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
