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

      // 检查是否有可用更新
      if (update.isAvailable) {
        await Updates.reloadAsync();
      } else {
        // 如果没有可用更新，尝试检查更新
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      }
    } catch (error) {
      console.error('Update failed:', error);
      // 可以在这里显示错误提示
    }
  }, [hideUpdateModal]);

  const checkForUpdates = useCallback(async () => {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        const info: UpdateInfo = {
          version: 'New',
          description:
            'A new version is available with improvements and bug fixes.',
          isMandatory: false, // 可以根据需要设置
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
