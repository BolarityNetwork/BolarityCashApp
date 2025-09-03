import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { ErrorDisplay } from '@/components/login/ErrorDisplay';
import { styles } from '@/components/login/styles';

export const OAUTH_PROVIDERS = [
  {
    name: 'google',
    label: 'Google',
    colors: ['#4285F4', '#34A853'] as const,
    icon: '🔍',
  },
  {
    name: 'apple',
    label: 'Continue with Apple',
    colors: ['#000', '#333'] as const,
    icon: '🍎',
  },
  {
    name: 'discord',
    label: 'Continue with Discord',
    colors: ['#5865F2', '#7289DA'] as const,
    icon: '🎮',
  },
] as const;

export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number]['name'];

export default function LoginScreen() {
  const {
    isLoading,
    error,
    oauthLoading,
    handleEmailLogin,
    handlePasskeyLogin,
    handleOAuthLogin,
  } = useAuth();

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Header />

          <View style={styles.loginCard}>
            <PrimaryActions
              isLoading={isLoading}
              onEmailLogin={handleEmailLogin}
            />
          </View>

          <View style={styles.divider}>
            <Text style={styles.dividerText}>Other options</Text>
          </View>

          <View style={styles.loginCard}>
            <OAuthSection
              providers={OAUTH_PROVIDERS}
              isLoading={isLoading || oauthLoading}
              onProviderSelect={handleOAuthLogin}
              onPasskeyLogin={handlePasskeyLogin}
            />
          </View>

          <ErrorDisplay error={error} />
        </ScrollView>
      </View>
    </>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Log in or sign up</Text>

      <View style={styles.logoContainer}>
        <View style={styles.logoCircle} />
        <Text style={styles.logoText}>bolarity</Text>
      </View>
    </View>
  );
}

function PrimaryActions({ isLoading, onEmailLogin }: any) {
  return (
    <View style={styles.primaryActions}>
      <TouchableOpacity
        style={[styles.primaryButton, styles.emailButton]}
        onPress={onEmailLogin}
        disabled={isLoading}
      >
        <View style={styles.buttonContent}>
          <View style={styles.emailIcon}>
            <View style={styles.emailEnvelope}>
              <View style={styles.emailFlap} />
            </View>
          </View>
          <Text style={styles.primaryButtonText}>your@email.com</Text>
        </View>
        <Text style={styles.buttonArrow}>Submit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.primaryButton, styles.emailButton]}
        onPress={() => {
          /* SMS function */
        }}
        disabled={isLoading}
      >
        <View style={styles.buttonContent}>
          <View style={styles.phoneIcon}>
            <View style={styles.phoneBody}>
              <View style={styles.phoneScreen} />
              <View style={styles.phoneHomeButton} />
            </View>
          </View>
          <Text style={styles.primaryButtonText}>Continue with SMS</Text>
        </View>
        <Text style={styles.buttonArrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

// Logo Components
function GoogleLogo() {
  return (
    <View style={styles.oauthLogoContainer}>
      <Image
        source={require('@/assets/logos/google.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
    </View>
  );
}

function AppleLogo() {
  return (
    <View style={styles.oauthLogoContainer}>
      <Image
        source={require('@/assets/logos/apple.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
    </View>
  );
}

function DiscordLogo() {
  return (
    <View style={styles.oauthLogoContainer}>
      <Image
        source={require('@/assets/logos/discord.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
    </View>
  );
}

function FingerprintIcon() {
  return (
    <View style={styles.fingerprintIcon}>
      <View style={styles.fingerprintOuter} />
      <View style={styles.fingerprintMiddle} />
      <View style={styles.fingerprintInner} />
      <View style={styles.fingerprintCore} />
    </View>
  );
}

function WalletIcon() {
  return (
    <View style={styles.walletIcon}>
      <View style={styles.walletBody}>
        <View style={styles.walletFlap} />
        <View style={styles.walletCard} />
      </View>
    </View>
  );
}

function OAuthSection({
  providers,
  isLoading,
  onProviderSelect,
  onPasskeyLogin,
}: any) {
  const renderProviderIcon = (providerName: string) => {
    switch (providerName) {
      case 'google':
        return <GoogleLogo />;
      case 'apple':
        return <AppleLogo />;
      case 'discord':
        return <DiscordLogo />;
      default:
        return (
          <Text style={styles.oauthIcon}>
            {providers.find((p: any) => p.name === providerName)?.icon}
          </Text>
        );
    }
  };

  return (
    <View style={styles.oauthContainer}>
      {providers.map((provider: any) => (
        <TouchableOpacity
          key={provider.name}
          style={styles.oauthButton}
          onPress={() => onProviderSelect(provider.name)}
          disabled={isLoading}
        >
          <View style={styles.oauthContent}>
            {renderProviderIcon(provider.name)}
            <Text style={styles.oauthText}>{provider.label}</Text>
          </View>
          {provider.name === 'google' && (
            <View style={styles.recentBadge}>
              <Text style={styles.recentText}>Recent</Text>
            </View>
          )}
          <Text style={styles.buttonArrow}>›</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.oauthButton}
        onPress={onPasskeyLogin}
        disabled={isLoading}
      >
        <View style={styles.oauthContent}>
          <FingerprintIcon />
          <Text style={styles.oauthText}>Continue with Passkey</Text>
        </View>
        <Text style={styles.buttonArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.oauthButton, styles.oauthButtonLast]}>
        <View style={styles.oauthContent}>
          <WalletIcon />
          <Text style={styles.oauthText}>Continue with a wallet</Text>
        </View>
        <Text style={styles.buttonArrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
}
