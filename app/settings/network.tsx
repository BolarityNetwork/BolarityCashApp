import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CommonSafeAreaView } from '@/components/CommonSafeAreaView';

export default function NetworkScreen() {
  const router = useRouter();

  return (
    <CommonSafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 pt-15 bg-white">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          onPress={() => router.back()}
        >
          <Text className="text-2xl text-gray-600 font-bold">‹</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Network</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-8">
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <View className="items-center py-10">
              <Text className="text-6xl mb-4">🌐</Text>
              <Text className="text-xl font-bold text-gray-900 mb-2">
                Network
              </Text>
              <Text className="text-gray-500 text-center leading-6">
                This page is under development.{'\n'}
                You'll be able to manage network settings here.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </CommonSafeAreaView>
  );
}
