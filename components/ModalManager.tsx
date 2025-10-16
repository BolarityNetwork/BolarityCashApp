import React from 'react';
import ActionModal from './modals/ActionModal';
import { ReceiveModal } from './modals/ReceiveModal';
import { TransferModal } from './modals/TransferModal';

interface ModalManagerProps {
  isActionMenuOpen: boolean;
  isReceiveModalOpen: boolean;
  isTransferModalOpen: boolean;
  onActionMenuClose: () => void;
  onReceiveModalClose: () => void;
  onTransferModalClose: () => void;
  onReceivePress: () => void;
}

export const ModalManager: React.FC<ModalManagerProps> = ({
  isActionMenuOpen,
  isReceiveModalOpen,
  isTransferModalOpen,
  onActionMenuClose,
  onReceiveModalClose,
  onTransferModalClose,
  onReceivePress,
}) => {
  return (
    <>
      <ActionModal
        visible={isActionMenuOpen}
        onClose={onActionMenuClose}
        onReceivePress={onReceivePress}
      />
      <ReceiveModal
        visible={isReceiveModalOpen}
        onClose={onReceiveModalClose}
      />
      <TransferModal
        visible={isTransferModalOpen}
        onClose={onTransferModalClose}
      />
    </>
  );
};
