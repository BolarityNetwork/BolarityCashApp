// hooks/global/useGlobalTakoProfile.ts
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TakoProfile {
  fid?: number;
  username?: string;
  displayName?: string;
  avatar?: string;
}

export const useGlobalTakoProfile = () => {
  const [takoFid, setTakoFid] = useState<number | null>(null);
  const [profile, setProfile] = useState<TakoProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('tako-profile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
        setTakoFid(parsedProfile.fid || null);
      }
    } catch (error) {
      console.error('Failed to load Tako profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveProfile = useCallback(async (newProfile: TakoProfile) => {
    try {
      await AsyncStorage.setItem('tako-profile', JSON.stringify(newProfile));
      setProfile(newProfile);
      setTakoFid(newProfile.fid || null);
    } catch (error) {
      console.error('Failed to save Tako profile:', error);
    }
  }, []);

  const clearProfile = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('tako-profile');
      setProfile(null);
      setTakoFid(null);
    } catch (error) {
      console.error('Failed to clear Tako profile:', error);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    takoFid,
    profile,
    isLoading,
    saveProfile,
    clearProfile,
    loadProfile,
  };
};
