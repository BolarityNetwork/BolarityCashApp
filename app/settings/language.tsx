import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CommonSafeAreaView } from '@/components/CommonSafeAreaView';
import BackBlack from '@/assets/icon/nav/back-black.svg';
import { useLanguage } from '@/hooks/useLanguage';
import { Language } from '@/i18n';

export default function LanguageScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentLanguage, supportedLanguages, changeLanguage } = useLanguage();

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === currentLanguage) {
      return;
    }

    const success = await changeLanguage(languageCode);
    if (success) {
      router.back();
    }
  };

  return (
    <CommonSafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-5 pt-15">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          onPress={() => router.back()}
        >
          <BackBlack />
        </TouchableOpacity>
        <Text className="text-[17px] font-medium text-gray-900">
          {t('settings.language')}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-5 py-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-4">
          <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            {supportedLanguages.map((lang, index) => {
              const isSelected = lang.code === currentLanguage;
              const isLast = index === supportedLanguages.length - 1;

              return (
                <TouchableOpacity
                  key={lang.code}
                  className={`flex-row items-center justify-between px-5 py-4 ${
                    !isLast ? 'border-b border-black/5' : ''
                  }`}
                  onPress={() => handleLanguageChange(lang.code)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center flex-1">
                    <View className="flex-1">
                      <Text className="text-base font-medium text-gray-900">
                        {lang.name}
                      </Text>
                      {lang.code === Language.EN && (
                        <Text className="text-sm text-gray-500">English</Text>
                      )}
                      {lang.code === Language.CN && (
                        <Text className="text-sm text-gray-500">简体中文</Text>
                      )}
                    </View>
                  </View>
                  {isSelected && (
                    <View className="w-5 h-5 rounded-full bg-blue-500 items-center justify-center">
                      <View className="w-2 h-2 rounded-full bg-white" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </CommonSafeAreaView>
  );
}
