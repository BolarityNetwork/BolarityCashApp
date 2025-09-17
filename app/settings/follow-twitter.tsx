import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { CommonSafeAreaView } from '@/components/CommonSafeAreaView';
import { PageHeader } from '@/components/common/PageHeader';

export default function FollowTwitterScreen() {
  return (
    <CommonSafeAreaView className="flex-1 bg-white">
      <PageHeader title="Follow @bolaritywallet" />

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-8">
          <View className="bg-white rounded-2xl p-6">
            <View className="items-center py-10">
              <Text className="text-6xl mb-4">🐦</Text>
              <Text className="text-xl font-bold text-gray-900 mb-2">
                Follow @bolaritywallet
              </Text>
              <Text className="text-gray-500 text-center leading-6">
                This page is under development.{'\n'}
                You'll be able to follow us on Twitter/X here.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </CommonSafeAreaView>
  );
}
