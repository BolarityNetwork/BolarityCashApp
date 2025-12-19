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
  const [webViewKey, setWebViewKey] = useState(0);

  // 清除 WebView 存储的 JavaScript 代码（在内容加载前执行）
  // 当 WebView key 变化时，会重新创建 WebView，此时会执行此脚本清除所有存储
  const clearStorageScript = `
    (function() {
      try {
        // 清除 localStorage
        if (typeof localStorage !== 'undefined') {
          localStorage.clear();
        }
        // 清除 sessionStorage
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.clear();
        }
        // 清除所有 cookies
        if (typeof document !== 'undefined' && document.cookie) {
          document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
          });
        }
        console.log('Storage cleared for new user session');
      } catch (e) {
        console.error('Error clearing storage:', e);
      }
    })();
    true; // 注意：注入的脚本必须返回 true
  `;

  // 监听用户变化，如果用户 ID 改变则清除存储并重新加载
  useEffect(() => {
    const currentUserId = user?.id || null;

    // 如果用户 ID 发生变化（切换账户或登出）
    if (
      previousUserIdRef.current !== null &&
      previousUserIdRef.current !== currentUserId
    ) {
      // 先注入脚本清除存储，然后通过 key 变化强制重新创建 WebView
      // 这样可以确保完全清除所有状态
      setWebViewKey(prev => prev + 1);
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
            key={webViewKey}
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
            injectedJavaScriptBeforeContentLoaded={clearStorageScript}
            sharedCookiesEnabled={false}
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
