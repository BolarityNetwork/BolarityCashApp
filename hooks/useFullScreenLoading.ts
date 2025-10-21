import { useCallback, useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';

import {
  FullscreenLoadingModal,
  FullscreenLoadingModalProps,
  BackgroundMode,
} from '@/components/common/FullScreenLoadingModal';

export function useFullScreenLoading({
  backgroundMode = 'transparent',
}: {
  backgroundMode?: BackgroundMode;
}) {
  const [loading, setLoading] = useState(false);

  return {
    loading,
    startLoading: useCallback(
      (
        params?: FullscreenLoadingModalProps & {
          backgroundMode?: BackgroundMode;
        }
      ) => {
        setLoading(true);
        NiceModal.show(FullscreenLoadingModal, {
          message: 'Loading...',
          cancelable: true,
          backgroundMode: backgroundMode,
          ...params,
        });
      },
      []
    ),
    endLoading: useCallback(() => {
      setLoading(false);
      NiceModal.remove(FullscreenLoadingModal);
    }, []),
  };
}
