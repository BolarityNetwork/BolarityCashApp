import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { CommonSafeAreaView } from '@/components/CommonSafeAreaView';
import BackBlack from '@/assets/icon/nav/back-black.svg';

export default function SettingsScreen() {
  const router = useRouter();

  const SettingItem = ({
    title,
    subtitle,
    onPress,
    rightComponent,
    showArrow = true,
  }: {
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      className="flex-row items-center justify-between px-5 py-4 border-b border-black/5"
      onPress={onPress}
      disabled={!onPress}
    >
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900 mb-0.5">
          {title}
        </Text>
        {subtitle && <Text className="text-sm text-gray-500">{subtitle}</Text>}
      </View>
      <View className="flex-row items-center">
        {rightComponent}
        {showArrow && onPress && (
          <Text className="text-lg text-gray-400 ml-2">›</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <CommonSafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-15">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          onPress={() => router.back()}
        >
          <BackBlack />
        </TouchableOpacity>
        <Text className="text-[17px] font-medium text-gray-900">Settings</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-5 py-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <View className="mb-8">
          <Text className="text-base font-medium text-gray-500 mb-3 px-1">
            Account
          </Text>
          <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <SettingItem
              title="Profile Information"
              subtitle="Manage your personal details"
              onPress={() => {
                // Navigate to profile edit
              }}
            />
            <SettingItem
              title="Security"
              subtitle="Password, 2FA, and security settings"
              onPress={() => {
                // Navigate to security settings
              }}
            />
            <SettingItem
              title="Wallet Settings"
              subtitle="Manage connected wallets"
              onPress={() => {
                // Navigate to wallet settings
              }}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View className="mb-8">
          <Text className="text-base font-medium text-gray-500 mb-3 px-1">
            Preferences
          </Text>
          <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <SettingItem
              title="Notifications"
              subtitle="Push notifications and alerts"
              onPress={() => {
                // Navigate to notification settings
              }}
            />
            <SettingItem
              title="Language"
              subtitle="English"
              onPress={() => {
                // Navigate to language selection
              }}
            />
            <SettingItem
              title="Theme"
              subtitle="Light mode"
              onPress={() => {
                // Navigate to theme selection
              }}
            />
            <SettingItem
              title="Dark Mode"
              rightComponent={
                <Switch
                  value={false}
                  onValueChange={() => {
                    // Handle theme toggle
                  }}
                  trackColor={{ false: '#e5e7eb', true: '#667eea' }}
                  thumbColor="#fff"
                />
              }
              showArrow={false}
            />
          </View>
        </View>

        {/* Privacy & Security Section */}
        <View className="mb-8">
          <Text className="text-base font-medium text-gray-500 mb-3 px-1">
            Privacy & Security
          </Text>
          <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <SettingItem
              title="Privacy Policy"
              onPress={() => {
                // Open privacy policy
              }}
            />
            <SettingItem
              title="Terms of Service"
              onPress={() => {
                // Open terms of service
              }}
            />
            <SettingItem
              title="Data Export"
              subtitle="Download your data"
              onPress={() => {
                // Handle data export
              }}
            />
          </View>
        </View>

        {/* Support Section */}
        <View className="mb-8">
          <Text className="text-base font-medium text-gray-500 mb-3 px-1">
            Support
          </Text>
          <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <SettingItem
              title="Help Center"
              onPress={() => {
                // Open help center
              }}
            />
            <SettingItem
              title="Contact Support"
              onPress={() => {
                // Open contact support
              }}
            />
            <SettingItem
              title="Report a Bug"
              onPress={() => {
                // Open bug report
              }}
            />
          </View>
        </View>

        {/* About Section */}
        <View className="mb-8">
          <Text className="text-base font-medium text-gray-500 mb-3 px-1">
            About
          </Text>
          <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <SettingItem
              title="App Version"
              subtitle="1.0.0"
              showArrow={false}
            />
            <SettingItem
              title="Open Source Licenses"
              onPress={() => {
                // Open licenses
              }}
            />
          </View>
        </View>
      </ScrollView>
    </CommonSafeAreaView>
  );
}
