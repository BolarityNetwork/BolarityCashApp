import React, { useState, useEffect } from 'react';
import { View, Text, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { CommonSafeAreaView } from '@/components/CommonSafeAreaView';
import { PageHeader } from '@/components/common/PageHeader';
import { ShadowCard } from '@/components/common/ShadowCard';
import { SettingSection } from '@/components/profile/SettingSection';
import { SettingItem } from '@/components/profile/SettingItem';
import {
  isBiometricEnabled,
  enableBiometric,
  disableBiometric,
  checkBiometricSupport,
  getBiometricTypeName,
  authenticateWithBiometrics,
} from '@/utils/biometrics';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { TakoToast } from '@/components/common/TakoToast';

export default function KeysRecoveryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('Face ID');
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  // Load biometric status on mount
  useEffect(() => {
    const loadBiometricStatus = async () => {
      try {
        const enabled = await isBiometricEnabled();
        setBiometricEnabled(enabled);

        // Get biometric type name
        const { types } = await checkBiometricSupport();
        if (types.length > 0) {
          setBiometricType(getBiometricTypeName(types));
        }
      } catch (error) {
        console.error('Error loading biometric status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBiometricStatus();
  }, []);

  const handleToggleBiometric = async (value: boolean) => {
    if (isToggling) return;

    setIsToggling(true);

    try {
      if (value) {
        // Enabling biometric - require authentication first
        const result = await authenticateWithBiometrics({
          promptMessage: i18n.t('biometrics.enablePrompt'),
          cancelLabel: i18n.t('common.cancel'),
        });

        if (result.success) {
          await enableBiometric();
          setBiometricEnabled(true);
          TakoToast.show({
            type: 'normal',
            status: 'success',
            message: `${biometricType} ${t('biometrics.enabled')}`,
          });
        } else {
          // User cancelled or failed authentication
          TakoToast.show({
            type: 'normal',
            status: 'error',
            message: t('biometrics.enableFailed'),
          });
        }
      } else {
        // Disabling biometric - require authentication first
        const result = await authenticateWithBiometrics({
          promptMessage: i18n.t('biometrics.disablePrompt'),
          cancelLabel: i18n.t('common.cancel'),
        });

        if (result.success) {
          await disableBiometric();
          setBiometricEnabled(false);
          TakoToast.show({
            type: 'normal',
            status: 'success',
            message: `${biometricType} ${t('biometrics.disabled')}`,
          });
        } else {
          // User cancelled or failed authentication
          TakoToast.show({
            type: 'normal',
            status: 'error',
            message: t('biometrics.disableFailed'),
          });
        }
      }
    } catch (error: any) {
      console.error('Error toggling biometric:', error);
      TakoToast.show({
        type: 'normal',
        status: 'error',
        message: error.message || t('common.error'),
      });
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <CommonSafeAreaView className="flex-1 bg-white">
        <PageHeader title={t('appProfile.keysAndRecovery')} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">{t('common.loading')}</Text>
        </View>
      </CommonSafeAreaView>
    );
  }

  return (
    <CommonSafeAreaView className="flex-1 bg-white">
      <PageHeader title={t('appProfile.keysAndRecovery')} />

      <ShadowCard borderRadius={20} className="mt-4 mx-5 mt-5">
        <SettingSection title={t('settings.security')}>
          <View className="flex-row items-center justify-between pl-[1px] pr-[6px] py-[14px]">
            <View className="flex-1">
              <Text className="text-sm text-black">
                {biometricEnabled
                  ? biometricType
                  : t('biometrics.requirePassword')}
              </Text>
              <Text className="text-xs text-[#ACB3BE] mt-1">
                {biometricEnabled
                  ? t('biometrics.enabledDescription')
                  : t('biometrics.disabledDescription')}
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometric}
              disabled={isToggling}
              trackColor={{ false: '#E5E7EB', true: '#000' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E7EB"
            />
          </View>
        </SettingSection>
      </ShadowCard>

      <ShadowCard borderRadius={20} className="mt-4 mx-5">
        <SettingSection title={t('appProfile.exportKeys')}>
          <SettingItem
            title={t('appProfile.exportKeys')}
            subtitle={t('appProfile.exportKeysDescription')}
            onPress={() => router.push('/settings/export-keys')}
            isLast
          />
        </SettingSection>
      </ShadowCard>
    </CommonSafeAreaView>
  );
}
