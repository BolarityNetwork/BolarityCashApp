import NiceModal, { useModal } from '@ebay/nice-modal-react';
import React, { Pressable } from 'react-native';

import { CommonModal } from './modal';
import { UniversalLoadingFallback } from '../universalLoadingFallback';

export type BackgroundMode = 'dark' | 'light' | 'transparent';

export interface FullscreenLoadingModalProps {
  message?: string;
  onCancel?: () => void;
  cancelable?: boolean;
  backgroundMode?: BackgroundMode;
}

export const FullscreenLoadingModal =
  NiceModal.create<FullscreenLoadingModalProps>(
    ({ cancelable: canClose = false, backgroundMode = 'transparent' }) => {
      const modal = useModal(FullscreenLoadingModal);

      const getBackgroundStyle = () => {
        switch (backgroundMode) {
          case 'dark':
            return 'bg-black';
          case 'light':
            return 'bg-[#F5F5F5]';
          case 'transparent':
            return 'bg-[#F5F5F5]/20 backdrop-blur-sm';
          default:
            return 'bg-[#F5F5F5]';
        }
      };

      return (
        <CommonModal
          onClose={() => {
            if (!canClose) return;
            modal.remove();
          }}
        >
          <Pressable
            className={`w-full h-full flex items-center justify-center ${getBackgroundStyle()}`}
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
