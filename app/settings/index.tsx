import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CommonSafeAreaView } from '@/components/CommonSafeAreaView';
import BackBlack from '@/assets/icon/nav/back-black.svg';
import { useLanguage } from '@/hooks/useLanguage';

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentLanguageInfo } = useLanguage();

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
        <Text className="text-[17px] font-medium text-gray-900">
          {t('settings.title')}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-5 py-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Preferences Section */}
        <View className="mb-8">
          <Text className="text-base font-medium text-gray-500 mb-3 px-1">
            {t('settings.preferences')}
          </Text>
          <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <SettingItem
              title={t('settings.currency')}
              subtitle="USD"
              onPress={() => {
                // Navigate to currency selection
              }}
            />
            <SettingItem
              title={t('settings.language')}
              subtitle={currentLanguageInfo.name}
              onPress={() => {
                router.push('/settings/language');
              }}
            />
            <SettingItem
              title={t('settings.security')}
              subtitle={t('settings.passwordAndSecurity')}
              onPress={() => {
                // Navigate to security settings
              }}
            />
          </View>
        </View>

        {/* Help & Support Section */}
        <View className="mb-8">
          <Text className="text-base font-medium text-gray-500 mb-3 px-1">
            {t('settings.helpAndSupport')}
          </Text>
          <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <SettingItem
              title={t('settings.about')}
              onPress={() => {
                router.push('/settings/about');
              }}
            />
            <SettingItem
              title={t('settings.reportBug')}
              onPress={() => {
                // Open bug report
              }}
            />
            <SettingItem
              title={t('settings.support')}
              onPress={() => {
                // Open support
              }}
            />
          </View>
        </View>
      </ScrollView>
    </CommonSafeAreaView>
  );
}
