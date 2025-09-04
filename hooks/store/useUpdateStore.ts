import * as Updates from 'expo-updates';
import { create } from 'zustand';

export interface UpdateState {
  expoUpdateCheckResult?: Updates.UpdateCheckResult;
  setExpoUpdateInfo: (updateInfo: Updates.UpdateCheckResult) => void;
}

export const useUpdateStore = create<UpdateState>(set => ({
  expoUpdateCheckResult: undefined,
  setExpoUpdateInfo: (updateInfo: Updates.UpdateCheckResult) => {
    set(state => {
      return { ...state, expoUpdateCheckResult: updateInfo };
    });
  },
}));
