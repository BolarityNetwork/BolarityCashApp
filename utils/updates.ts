import { isDevice } from 'expo-device';
import { channel, checkForUpdateAsync } from 'expo-updates';

export const checkForUpdate = async () => {
  if (channel && channel !== 'development' && isDevice) {
    return checkForUpdateAsync();
  }
};
