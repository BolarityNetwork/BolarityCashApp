import { useEffect, useRef } from 'react';
import { useRegisterUser } from '@/api/user';

export function useUserRegistration(address: string) {
  const registerUser = useRegisterUser();
  const registeredAddresses = useRef<Set<string>>(new Set());

  useEffect(() => {
    const registerUserIfNeeded = async () => {
      if (
        address &&
        !registeredAddresses.current.has(address) &&
        !registerUser.isPending
      ) {
        try {
          await registerUser.mutateAsync(address);
          registeredAddresses.current.add(address);
        } catch (error) {
          console.warn('⚠️ User registration failed:', error);
        }
      }
    };

    if (address) {
      registerUserIfNeeded();
    }
  }, [address, registerUser]);

  return {
    isRegistering: registerUser.isPending,
    registerError: registerUser.error,
  };
}
