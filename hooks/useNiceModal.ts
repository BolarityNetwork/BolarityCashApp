import { FC, useCallback } from 'react';
import NiceModal, { NiceModalHocProps } from '@ebay/nice-modal-react';

export interface NiceModalProps {
  onClose?: () => void;
}
export function useNiceModal<T extends NiceModalProps>(
  modal: FC<T & NiceModalHocProps>,
  props?: Partial<T & NiceModalHocProps>
) {
  const open = useCallback(() => {
    return NiceModal.show(modal, props);
  }, [modal, props]);

  const openWithoutProps = useCallback(
    (props: Partial<T & NiceModalHocProps>) => {
      return NiceModal.show(modal, props);
    },
    [modal]
  );

  const close = useCallback(() => {
    NiceModal.remove(modal);
  }, [modal]);

  return { open, openWithoutProps, close };
}
