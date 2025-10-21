import NiceModal, { useModal } from '@ebay/nice-modal-react';
import React, { Pressable } from 'react-native';

import { CommonModal } from './modal';
import { UniversalLoadingFallback } from '../universalLoadingFallback';

export interface FullscreenLoadingModalProps {
  message?: string;
  onCancel?: () => void;
  cancelable?: boolean;
  isLight?: boolean;
}

export const FullscreenLoadingModal =
  NiceModal.create<FullscreenLoadingModalProps>(
    ({ cancelable: canClose = false }) => {
      const modal = useModal(FullscreenLoadingModal);
      return (
        <CommonModal
          onClose={() => {
            if (!canClose) return;
            modal.remove();
          }}
        >
          <Pressable
            className="w-full h-full flex items-center justify-center bg-base-FFF"
            onPress={() => {
              if (!canClose) return;
              modal.remove();
            }}
          >
            <UniversalLoadingFallback></UniversalLoadingFallback>
          </Pressable>
        </CommonModal>
      );
    }
  );
