// hooks/store/useRecommendFollowsStore.ts
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useRecommendFollowsStore = () => {
  const [recommendFollows, setRecommendFollows] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRecommendFollows = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem('recommend-follows');
      if (saved) {
        const parsed = JSON.parse(saved);
        setRecommendFollows(parsed);
      }
    } catch (error) {
      console.error('Failed to load recommend follows:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveRecommendFollows = useCallback(async (follows: number[]) => {
    try {
      await AsyncStorage.setItem('recommend-follows', JSON.stringify(follows));
      setRecommendFollows(follows);
    } catch (error) {
      console.error('Failed to save recommend follows:', error);
    }
  }, []);

  const addRecommendFollow = useCallback(
    async (fid: number) => {
      const updated = [...recommendFollows, fid];
      await saveRecommendFollows(updated);
    },
    [recommendFollows, saveRecommendFollows]
  );

  const removeRecommendFollow = useCallback(
    async (fid: number) => {
      const updated = recommendFollows.filter(id => id !== fid);
      await saveRecommendFollows(updated);
    },
    [recommendFollows, saveRecommendFollows]
  );

  useEffect(() => {
    loadRecommendFollows();
  }, [loadRecommendFollows]);

  return {
    recommendFollows,
    isLoading,
    addRecommendFollow,
    removeRecommendFollow,
    saveRecommendFollows,
  };
};
