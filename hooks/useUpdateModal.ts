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
  const [isDownloading, setIsDownloading] = useState(false);

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
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Failed to reload app:', error);
    }
  }, [hideUpdateModal]);

  const checkForUpdates = useCallback(async () => {
    try {
      if (__DEV__) return false;

      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        console.log('Update available, downloading...');
        setIsDownloading(true);

        await Updates.fetchUpdateAsync();

        setIsDownloading(false);

        const info: UpdateInfo = {
          version: 'New',
          description:
            'A new version has been downloaded. Restart to apply it.',
          isMandatory: false,
        };

        showUpdateModal(info);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      setIsDownloading(false);
      return false;
    }
  }, [showUpdateModal]);

  return {
    isVisible,
    updateInfo,
    isDownloading,
    showUpdateModal,
    hideUpdateModal,
    handleUpdate,
    checkForUpdates,
  };
};
