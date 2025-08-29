// app/index.tsx
import { SafeAreaView, Text, View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import LoginScreen from '@/components/LoginScreen';
import { usePrivy } from '@privy-io/expo';
import { RedesignedMainNavigation } from '@/components/RedesignedMainNavigation';
import { LinearGradient } from 'expo-linear-gradient';
import { Buffer } from 'buffer';
import { useEffect } from 'react';
import * as Updates from 'expo-updates';
import UpdateModal from '@/components/UpdateModal';
import { useUpdateModal } from '@/hooks/useUpdateModal';
global.Buffer = Buffer;

export default function Index() {
  const { user } = usePrivy();
  const {
    isVisible,
    updateInfo,
    showUpdateModal,
    hideUpdateModal,
    handleUpdate,
  } = useUpdateModal();

  // Check for OTA update and show modal if available
  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          console.log('OTA update available:', update);
          showUpdateModal({
            version: 'New',
            description:
              'A new version is available with the latest features and improvements!',
            isMandatory: false,
          });
        }
      } catch (e) {
        console.log('Failed to check OTA update', e);
      }
    };

    // 延迟检查，避免影响应用启动性能
    const timer = setTimeout(checkUpdate, 3000);
    return () => clearTimeout(timer);
  }, [showUpdateModal]);

  // Check if Privy App ID is valid
  if ((Constants.expoConfig?.extra?.privyAppId as string).length !== 25) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.errorContainer}
      >
        <SafeAreaView style={styles.errorSafeArea}>
          <View style={styles.errorContent}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Configuration Error</Text>
            <Text style={styles.errorText}>
              You have not set a valid `privyAppId` in app.json
            </Text>
            <Text style={styles.errorHint}>
              Please check your app configuration and try again.
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Check if Privy Client ID is valid
  if (
    !(Constants.expoConfig?.extra?.privyClientId as string).startsWith(
      'client-'
    )
  ) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.errorContainer}
      >
        <SafeAreaView style={styles.errorSafeArea}>
          <View style={styles.errorContent}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Configuration Error</Text>
            <Text style={styles.errorText}>
              You have not set a valid `privyClientId` in app.json
            </Text>
            <Text style={styles.errorHint}>
              Please check your app configuration and try again.
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Return appropriate screen based on authentication status
  return (
    <>
      {!user ? <LoginScreen /> : <RedesignedMainNavigation />}

      {/* Update Modal */}
      <UpdateModal
        visible={isVisible}
        updateInfo={updateInfo}
        onUpdate={handleUpdate}
        onClose={hideUpdateModal}
      />
    </>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
  },
  errorSafeArea: {
    flex: 1,
  },
  errorContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  errorHint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
