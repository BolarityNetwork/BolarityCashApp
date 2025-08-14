import React from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from "./hooks/useAuth";
import { LoginButton } from "./components/LoginButton";
import { OAuthButton } from "./components/OAuthButton";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { ConfigSection } from "./components/ConfigSection";
import { OAUTH_PROVIDERS } from "./constants";
import { styles } from "./styles";

export default function LoginScreen() {
  const { 
    isLoading, 
    error, 
    oauthLoading,
    handleEmailLogin, 
    handlePasskeyLogin, 
    handleOAuthLogin 
  } = useAuth();

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
          <Header />
          
          <View style={styles.loginCard}>
            <PrimaryActions 
              isLoading={isLoading}
              onEmailLogin={handleEmailLogin}
              onPasskeyLogin={handlePasskeyLogin}
            />
            
            <Divider />
            
            <OAuthSection 
              providers={OAUTH_PROVIDERS}
              isLoading={isLoading || oauthLoading}
              onProviderSelect={handleOAuthLogin}
            />
            
            <ErrorDisplay error={error} />
          </View>

          <ConfigSection />
        </ScrollView>
      </LinearGradient>
    </>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>⚡</Text>
      </View>
      <Text style={styles.title}>Welcome to Bolarity</Text>
      <Text style={styles.subtitle}>
        Your gateway to chain abstraction
      </Text>
    </View>
  );
}

function PrimaryActions({ isLoading, onEmailLogin, onPasskeyLogin }: any) {
  return (
    <View style={styles.primaryActions}>
      <LoginButton
        icon="📧"
        text="Continue with Email"
        onPress={onEmailLogin}
        disabled={isLoading}
        loading={isLoading}
        style={styles.emailButton}
      />
      <LoginButton
        icon="🔐"
        text="Use Passkey"
        onPress={onPasskeyLogin}
        disabled={isLoading}
        style={styles.passkeyButton}
      />
    </View>
  );
}

function Divider() {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>or continue with</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

function OAuthSection({ providers, isLoading, onProviderSelect }: any) {
  return (
    <View style={styles.oauthContainer}>
      {providers.map((provider: any, index: number) => (
        <OAuthButton
          key={provider.name}
          provider={provider}
          onPress={() => onProviderSelect(provider.name)}
          disabled={isLoading}
          loading={isLoading}
          isLast={index === providers.length - 1}
        />
      ))}
    </View>
  );
}