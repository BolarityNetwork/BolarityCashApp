import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { CommonSafeAreaView } from '@/components/CommonSafeAreaView';
import { PageHeader } from '@/components/common/PageHeader';
import { useTranslation } from 'react-i18next';
import { usePersistedPrivyUser } from '@/hooks/usePersistedPrivyUser';

export default function ExportKeysScreen() {
  const { t } = useTranslation();
  const { user } = usePersistedPrivyUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);
  const previousUserIdRef = useRef<string | null>(null);

  // 监听用户变化，如果用户 ID 改变则重新加载
  useEffect(() => {
    const currentUserId = user?.id || null;

    // 如果用户 ID 发生变化（切换账户或登出）
    if (
      previousUserIdRef.current !== null &&
      previousUserIdRef.current !== currentUserId
    ) {
      // 重新加载 WebView 以同步新的用户状态
      webViewRef.current?.reload();
      setLoading(true);
    }

    previousUserIdRef.current = currentUserId;
  }, [user?.id]);

  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    setLoading(false);
    setError(nativeEvent?.description || t('common.error'));
    console.error('WebView error:', nativeEvent);
  };

  return (
    <CommonSafeAreaView className="flex-1 bg-white">
      <PageHeader title={t('appProfile.exportKeys')} />

      {error ? (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-red-500 text-center mb-2">{error}</Text>
          <Text className="text-gray-500 text-center text-sm">
            {t('appProfile.exportKeysError')}
          </Text>
        </View>
      ) : (
        <View className="flex-1">
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000" />
              <Text className="text-gray-500 mt-2">{t('common.loading')}</Text>
            </View>
          )}
          <WebView
            ref={webViewRef}
            source={{ uri: 'https://privy-export-web.vercel.app/' }}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            mixedContentMode="always"
            cacheEnabled={false}
          />
        </View>
      )}
    </CommonSafeAreaView>
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    zIndex: 1,
  },
});
