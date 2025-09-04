// app/index.tsx
import { SafeAreaView, Text, View } from 'react-native';
import Constants from 'expo-constants';
import LoginScreen from '@/app/login';
import { usePrivy } from '@privy-io/expo';
import { RedesignedMainNavigation } from '@/components/RedesignedMainNavigation';
import { LinearGradient } from 'expo-linear-gradient';
import { Buffer } from 'buffer';
import { useEffect } from 'react';
import * as Updates from 'expo-updates';
import UpdateModal from '@/components/modals/UpdateModal';
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
      <LinearGradient colors={['#667eea', '#764ba2']} className="flex-1">
        <SafeAreaView className="flex-1">
          <View className="flex-1 items-center justify-center px-10">
            <Text className="text-6xl mb-5">⚠️</Text>
            <Text className="text-2xl font-bold text-white text-center mb-4">
              Configuration Error
            </Text>
            <Text className="text-base text-white/90 text-center leading-6 mb-3">
              You have not set a valid `privyAppId` in app.json
            </Text>
            <Text className="text-sm text-white/70 text-center italic">
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
      <LinearGradient colors={['#667eea', '#764ba2']} className="flex-1">
        <SafeAreaView className="flex-1">
          <View className="flex-1 items-center justify-center px-10">
            <Text className="text-6xl mb-5">⚠️</Text>
            <Text className="text-2xl font-bold text-white text-center mb-4">
              Configuration Error
            </Text>
            <Text className="text-base text-white/90 text-center leading-6 mb-3">
              You have not set a valid `privyClientId` in app.json
            </Text>
            <Text className="text-sm text-white/70 text-center italic">
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
