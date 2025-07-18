// app/index.tsx
import { SafeAreaView, Text, View, StyleSheet } from "react-native";
import Constants from "expo-constants";
import LoginScreen from "@/components/LoginScreen";
import { usePrivy } from "@privy-io/expo";
import { RedesignedMainNavigation } from "@/components/RedesignedMainNavigation";
import { LinearGradient } from 'expo-linear-gradient';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

export default function Index() {
  const { user } = usePrivy();

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
      "client-"
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
  return !user ? <LoginScreen /> : <RedesignedMainNavigation />;
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