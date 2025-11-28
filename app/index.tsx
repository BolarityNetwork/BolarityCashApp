import { Redirect } from 'expo-router';
import { usePersistedPrivyUser } from '@/hooks/usePersistedPrivyUser';
import LoginScreen from '@/app/login';

export default function Index() {
  const { user } = usePersistedPrivyUser();
  return user ? <Redirect href="/(tabs)/home" /> : <LoginScreen />;
}
