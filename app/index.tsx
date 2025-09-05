// app/index.tsx
import { usePrivy } from '@privy-io/expo';
import { Redirect } from 'expo-router';
import LoginScreen from '@/app/login';

export default function Index() {
  const { user } = usePrivy();

  return user ? <Redirect href="/(tabs)/home" /> : <LoginScreen />;
}
