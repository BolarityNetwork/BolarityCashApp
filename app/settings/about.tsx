import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Updates from 'expo-updates';
import { getLocales } from 'expo-localization';
import { CommonSafeAreaView } from '@/components/CommonSafeAreaView';
import BackBlack from '@/assets/icon/nav/back-black.svg';
import { TakoToast } from '@/components/common/TakoToast';

interface InfoItemProps {
  label: string;
  value: string;
  showArrow?: boolean;
  onPress?: () => void;
}

const InfoItem: React.FC<InfoItemProps> = ({
  label,
  value,
  showArrow = false,
  onPress,
}) => (
  <View className="flex-row items-center justify-between px-5 py-4 border-b border-black/5">
    <Text className="text-base text-gray-900 flex-1">{label}</Text>
    <View className="flex-row items-center">
      <Text className="text-base text-gray-900 mr-2">{value}</Text>
      {showArrow && onPress && <Text className="text-lg text-gray-400">›</Text>}
    </View>
  </View>
);

const LinkItem: React.FC<{
  title: string;
  onPress?: () => void;
}> = ({ title, onPress }) => (
  <TouchableOpacity
    className="flex-row items-center justify-between px-5 py-4 border-b border-black/5"
    onPress={onPress}
    disabled={!onPress}
  >
    <Text className="text-base text-gray-900 flex-1">{title}</Text>
    {onPress && <Text className="text-lg text-gray-400">›</Text>}
  </TouchableOpacity>
);

export default function AboutScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const appInfo = useMemo(() => {
    const appVersion = Constants.expoConfig?.version || '1.0.0';
    const buildNumber =
      Constants.expoConfig?.ios?.buildNumber ||
      Constants.expoConfig?.android?.versionCode ||
      'N/A';
    const deviceModel = Device.modelName || Device.deviceName || 'Unknown';
    const distribution = Platform.OS === 'ios' ? 'App Store' : 'Google Play';
    const environment = __DEV__ ? 'Development' : 'Production';

    // Get runtime version
    // Note: Updates.manifest is empty in development mode
    // In production, use Updates.updateId if available, otherwise use appVersion
    let runtimeVersion = appVersion;
    try {
      // Check if Updates is enabled and we have an updateId
      if (Updates.isEnabled && Updates.updateId) {
        // Use first 8 characters of updateId as runtime version
        runtimeVersion = Updates.updateId.slice(0, 8);
      } else {
        // runtimeVersion config is { policy: "appVersion" }, so use appVersion
        runtimeVersion = appVersion;
      }
    } catch {
      runtimeVersion = appVersion;
    }

    const locale = getLocales()[0];
    const location = locale
      ? `${locale.regionCode || 'undefined'} / ${locale.currencyCode || locale.languageRegionCode || 'N/A'}`
      : 'N/A';
    const osVersion =
      (Platform.OS === 'ios'
        ? Device.osVersion
        : `${Platform.OS} ${Device.osVersion || ''}`) || 'N/A';

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'N/A';

    // Get update channel from config or Updates
    // Note: Updates.channel and Updates.createdAt are only available in production builds
    let updateChannel = 'default';
    let updateCreatedAt = 'N/A';
    try {
      if (Updates.isEnabled) {
        // Try to get channel from Updates first (only available in production)
        if (Updates.channel) {
          updateChannel = Updates.channel;
        } else if (
          Constants.expoConfig?.updates?.requestHeaders?.['expo-channel-name']
        ) {
          // Fallback to config
          updateChannel =
            Constants.expoConfig.updates.requestHeaders['expo-channel-name'];
        }

        // Get update created time (only available in production with OTA update)
        if (Updates.createdAt) {
          updateCreatedAt = new Date(Updates.createdAt).toLocaleString();
        } else if (Constants.expoConfig?.extra?.updateTime) {
          // Fallback to extra.updateTime if available (build time)
          updateCreatedAt = Constants.expoConfig.extra.updateTime;
        }
      } else {
        // Updates not enabled, use config values
        if (
          Constants.expoConfig?.updates?.requestHeaders?.['expo-channel-name']
        ) {
          updateChannel =
            Constants.expoConfig.updates.requestHeaders['expo-channel-name'];
        }
        if (Constants.expoConfig?.extra?.updateTime) {
          updateCreatedAt = Constants.expoConfig.extra.updateTime;
        }
      }
    } catch {
      // Updates may not be available in dev mode
      // Use config as fallback
      if (
        Constants.expoConfig?.updates?.requestHeaders?.['expo-channel-name']
      ) {
        updateChannel =
          Constants.expoConfig.updates.requestHeaders['expo-channel-name'];
      }
    }

    return {
      appVersion: `${appVersion} (${buildNumber})`,
      deviceModel,
      distribution,
      environment,
      runtimeVersion,
      location,
      osVersion,
      timezone,
      updateChannel,
      updateCreatedAt,
    };
  }, []);

  const handlePrivacyStatement = () => {
    // TODO: Navigate to privacy statement page or open URL
    Linking.openURL('https://bolarity.xyz/privacy').catch(err =>
      console.error('Failed to open privacy statement:', err)
    );
  };

  const handleHelpSupport = async () => {
    const email = 'contact@bolarity.xyz';
    try {
      // Try to open mail client
      const canOpen = await Linking.canOpenURL(`mailto:${email}`);
      if (canOpen) {
        await Linking.openURL(`mailto:${email}`);
      } else {
        // If mail client not available, copy email to clipboard
        await Clipboard.setStringAsync(email);
        TakoToast.show({
          type: 'normal',
          status: 'success',
          message: `${t('common.emailCopied') || 'Email copied to clipboard'}: ${email}`,
        });
      }
    } catch (_err) {
      // Fallback: copy email to clipboard if opening fails
      try {
        await Clipboard.setStringAsync(email);
        TakoToast.show({
          type: 'normal',
          status: 'success',
          message: `${t('common.emailCopied') || 'Email copied to clipboard'}: ${email}`,
        });
      } catch (clipboardErr) {
        console.error('Failed to copy email:', clipboardErr);
        TakoToast.show({
          type: 'normal',
          status: 'error',
          message: t('common.failedToCopy') || 'Failed to copy email',
        });
      }
    }
  };

  const handleTermsOfService = () => {
    // TODO: Navigate to terms of service page or open URL
    Linking.openURL('https://bolarity.xyz/terms').catch(err =>
      console.error('Failed to open terms of service:', err)
    );
  };

  const handleWebsite = () => {
    Linking.openURL('https://bolarity.xyz').catch(err =>
      console.error('Failed to open website:', err)
    );
  };

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
          {t('settings.about')}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-5 py-5"
        showsVerticalScrollIndicator={false}
      >
        {/* App Icon and Name */}
        <View className="items-center mb-8 mt-4">
          <Image
            source={require('@/assets/images/adaptive-icon.png')}
            style={{ width: 80, height: 80, borderRadius: 20 }}
            resizeMode="contain"
          />
          <Text className="text-2xl font-bold text-gray-900 mt-4">
            {Constants.expoConfig?.name || 'BolarityCash'}
          </Text>
        </View>

        {/* Links Section */}
        <View className="mb-6">
          <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <LinkItem
              title={t('settings.privacyStatement')}
              onPress={handlePrivacyStatement}
            />
            <LinkItem
              title={t('settings.helpAndSupport')}
              onPress={handleHelpSupport}
            />
            <LinkItem
              title={t('settings.termsOfService')}
              onPress={handleTermsOfService}
            />
            <LinkItem title={t('settings.website')} onPress={handleWebsite} />
          </View>
        </View>

        {/* App Information Section */}
        <View className="mb-6">
          <Text className="text-base font-medium text-gray-500 mb-3 px-1">
            {t('settings.appInformation')}
          </Text>
          <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <InfoItem
              label={t('settings.appVersion')}
              value={appInfo.appVersion}
            />
            <InfoItem
              label={t('settings.deviceModel')}
              value={appInfo.deviceModel}
            />
            <InfoItem
              label={t('settings.distribution')}
              value={appInfo.distribution}
            />
            <InfoItem
              label={t('settings.environment')}
              value={appInfo.environment}
            />
            <InfoItem
              label={t('settings.runtimeVersion')}
              value={appInfo.runtimeVersion}
            />
          </View>
        </View>

        {/* System Information Section */}
        <View className="mb-6">
          <Text className="text-base font-medium text-gray-500 mb-3 px-1">
            {t('settings.systemInformation')}
          </Text>
          <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <InfoItem label={t('settings.location')} value={appInfo.location} />
            <InfoItem
              label={t('settings.osVersion')}
              value={appInfo.osVersion}
            />
            <InfoItem label={t('settings.timezone')} value={appInfo.timezone} />
          </View>
        </View>

        {/* Update Information Section */}
        <View className="mb-6">
          <Text className="text-base font-medium text-gray-500 mb-3 px-1">
            {t('settings.updateInformation')}
          </Text>
          <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <InfoItem
              label={t('settings.updateChannel')}
              value={appInfo.updateChannel}
            />
            <InfoItem
              label={t('settings.updateCreatedAt')}
              value={appInfo.updateCreatedAt}
            />
          </View>
        </View>
      </ScrollView>
    </CommonSafeAreaView>
  );
}
