import React from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import Constants from "expo-constants";
import * as Application from "expo-application";
import { styles } from "../styles";

export function ConfigSection() {
  const appId = Constants.expoConfig?.extra?.privyAppId;
  const clientId = Constants.expoConfig?.extra?.privyClientId;
  
  const openDashboard = () => {
    Linking.openURL(
      `https://dashboard.privy.io/apps/${appId}/settings?setting=clients`
    );
  };

  return (
    <View style={styles.configSection}>
      <TouchableOpacity style={styles.configToggle}>
        <Text style={styles.configToggleText}>Configuration Details</Text>
        <Text style={styles.configToggleIcon}>ℹ️</Text>
      </TouchableOpacity>
      
      <View style={styles.configDetails}>
        <ConfigItem label="App ID:" value={appId} />
        <ConfigItem label="Client ID:" value={clientId} />
        <ConfigItem label="App Identifier:" value={Application.applicationId} />
        
        <TouchableOpacity style={styles.dashboardLink} onPress={openDashboard}>
          <Text style={styles.dashboardLinkText}>
            🔗 Open Privy Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ConfigItem({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.configItem}>
      <Text style={styles.configLabel}>{label}</Text>
      <Text style={styles.configValue}>{value}</Text>
    </View>
  );
}