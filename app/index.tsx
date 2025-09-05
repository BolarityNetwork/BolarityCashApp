// app/index.tsx
import { usePrivy } from '@privy-io/expo';
import LoginScreen from '@/app/login';
import { RedesignedMainNavigation } from '@/components/RedesignedMainNavigation';

export default function Index() {
  const { user } = usePrivy();

  return user ? <RedesignedMainNavigation /> : <LoginScreen />;
}
