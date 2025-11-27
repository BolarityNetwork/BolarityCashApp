import { Redirect } from 'expo-router';
import { usePersistedPrivyUser } from '@/hooks/usePersistedPrivyUser';
import LoginScreen from '@/app/login';
import { useShowBiometricModal } from '@/hooks/useShowBiometricModal';

export default function Index() {
  const { user } = usePersistedPrivyUser();

  useShowBiometricModal(user);

  return user ? <Redirect href="/(tabs)/home" /> : <LoginScreen />;
}
