import { useState, useCallback } from 'react';
import * as Updates from 'expo-updates';

interface UpdateInfo {
  version?: string;
  description?: string;
  isMandatory?: boolean;
}

export const useUpdateModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({});

  const showUpdateModal = useCallback((info?: UpdateInfo) => {
    setUpdateInfo(info || {});
    setIsVisible(true);
  }, []);

  const hideUpdateModal = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleUpdate = useCallback(async () => {
    try {
      hideUpdateModal();
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.reloadAsync();
      } else {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
  }, [hideUpdateModal]);

  const checkForUpdates = useCallback(async () => {
    try {
      if (__DEV__) return false;
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        const info: UpdateInfo = {
          version: 'New',
          description:
            'A new version is available with improvements and bug fixes.',
          isMandatory: false,
        };

        showUpdateModal(info);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return false;
    }
  }, [showUpdateModal]);

  return {
    isVisible,
    updateInfo,
    showUpdateModal,
    hideUpdateModal,
    handleUpdate,
    checkForUpdates,
  };
};
