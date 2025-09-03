import { useState, useCallback } from 'react';
import { ModalType, ProfileState } from '@/interfaces/profile';

const initialState: ProfileState = {
  activeModal: null,
  expandedSection: null,
  signedMessages: [],
  transactionResults: [],
  isLoading: false,
};

export function useProfileState() {
  const [state, setState] = useState<ProfileState>(initialState);

  const openModal = useCallback((modal: ModalType) => {
    setState(prev => ({ ...prev, activeModal: modal }));
  }, []);

  const closeModal = useCallback(() => {
    setState(prev => ({ ...prev, activeModal: null }));
  }, []);

  const toggleSection = useCallback((section: string) => {
    setState(prev => ({
      ...prev,
      expandedSection: prev.expandedSection === section ? null : section,
    }));
  }, []);

  const addSignedMessage = useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      signedMessages: [message, ...prev.signedMessages],
    }));
  }, []);

  const addTransaction = useCallback((tx: string) => {
    setState(prev => ({
      ...prev,
      transactionResults: [tx, ...prev.transactionResults],
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  return {
    ...state,
    openModal,
    closeModal,
    toggleSection,
    addSignedMessage,
    addTransaction,
    setLoading,
  };
}
