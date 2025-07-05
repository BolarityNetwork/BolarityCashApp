import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  StyleSheet,
} from "react-native";
import { LoginWithOAuthInput, useLoginWithOAuth } from "@privy-io/expo";
import { useLogin } from "@privy-io/expo/ui";
import { useLoginWithPasskey } from "@privy-io/expo/passkey";
import Constants from "expo-constants";
import * as Application from "expo-application";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { loginWithPasskey } = useLoginWithPasskey({
    onError: (err) => {
      console.log(err);
      setError(err.message);
      setIsLoading(false);
    },
  });

  const { login } = useLogin();
  
  const oauth = useLoginWithOAuth({
    onError: (err) => {
      console.log(err);
      setError(err.message);
      setIsLoading(false);
    },
  });

  const providers = [
    { 
      name: "google", 
      label: "Continue with Google", 
      colors: ['#4285F4', '#34A853'],
      icon: "🔍"
    },
    { 
      name: "github", 
      label: "Continue with GitHub", 
      colors: ['#333', '#666'],
      icon: "⚡"
    },
    { 
      name: "discord", 
      label: "Continue with Discord", 
      colors: ['#5865F2', '#7289DA'],
      icon: "🎮"
    },
    { 
      name: "apple", 
      label: "Continue with Apple", 
      colors: ['#000', '#333'],
      icon: "🍎"
    },
  ];

  const handleEmailLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const session = await login({ loginMethods: ["email"] });
      console.log("User logged in", session.user);
    } catch (err: any) {
      setError(err.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setIsLoading(true);
    setError("");
    await loginWithPasskey({
      relyingParty: Constants.expoConfig?.extra?.passkeyAssociatedDomain,
    });
  };

  const handleOAuthLogin = async (provider: string) => {
    setIsLoading(true);
    setError("");
    await oauth.login({ provider } as LoginWithOAuthInput);
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>⚡</Text>
            </View>
            <Text style={styles.title}>Welcome to Bolarity</Text>
            <Text style={styles.subtitle}>
              Your gateway to chain abstraction
            </Text>
          </View>

          {/* Main Login Card */}
          <View style={styles.loginCard}>
            {/* Primary Actions */}
            <View style={styles.primaryActions}>
              <TouchableOpacity
                style={[styles.primaryButton, styles.emailButton]}
                onPress={handleEmailLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonIcon}>📧</Text>
                    <Text style={styles.primaryButtonText}>Continue with Email</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, styles.passkeyButton]}
                onPress={handlePasskeyLogin}
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonIcon}>🔐</Text>
                <Text style={styles.primaryButtonText}>Use Passkey</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* OAuth Providers */}
            <View style={styles.oauthContainer}>
              {providers.map((provider, index) => (
                <TouchableOpacity
                  key={provider.name}
                  style={[
                    styles.oauthButton,
                    { marginBottom: index === providers.length - 1 ? 0 : 12 }
                  ]}
                  onPress={() => handleOAuthLogin(provider.name)}
                  disabled={isLoading || oauth.state.status === "loading"}
                >
                  <LinearGradient
                    colors={provider.colors}
                    style={styles.oauthGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.oauthIcon}>{provider.icon}</Text>
                    <Text style={styles.oauthText}>{provider.label}</Text>
                    {oauth.state.status === "loading" && (
                      <ActivityIndicator color="#fff" size="small" />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            {/* Error Display */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </View>

          {/* Configuration Info */}
          <View style={styles.configSection}>
            <TouchableOpacity style={styles.configToggle}>
              <Text style={styles.configToggleText}>Configuration Details</Text>
              <Text style={styles.configToggleIcon}>ℹ️</Text>
            </TouchableOpacity>
            
            <View style={styles.configDetails}>
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>App ID:</Text>
                <Text style={styles.configValue}>
                  {Constants.expoConfig?.extra?.privyAppId}
                </Text>
              </View>
              
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>Client ID:</Text>
                <Text style={styles.configValue}>
                  {Constants.expoConfig?.extra?.privyClientId}
                </Text>
              </View>
              
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>App Identifier:</Text>
                <Text style={styles.configValue}>
                  {Application.applicationId}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.dashboardLink}
                onPress={() =>
                  Linking.openURL(
                    `https://dashboard.privy.io/apps/${Constants.expoConfig?.extra?.privyAppId}/settings?setting=clients`
                  )
                }
              >
                <Text style={styles.dashboardLinkText}>
                  🔗 Open Privy Dashboard
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  loginCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  primaryActions: {
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  emailButton: {
    backgroundColor: '#667eea',
  },
  passkeyButton: {
    backgroundColor: '#764ba2',
  },
  primaryButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  oauthContainer: {
    marginBottom: 16,
  },
  oauthButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  oauthGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  oauthIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  oauthText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#cc0000',
    fontWeight: '500',
  },
  configSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  configToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  configToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  configToggleIcon: {
    fontSize: 18,
  },
  configDetails: {
    gap: 12,
  },
  configItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  configLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  configValue: {
    fontSize: 11,
    color: '#fff',
    fontFamily: 'monospace',
  },
  dashboardLink: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  dashboardLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});