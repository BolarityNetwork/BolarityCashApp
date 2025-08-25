import React from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ModalType } from '../types';
import { styles } from '../styles';

interface ModalManagerProps {
  activeModal: ModalType;
  onClose: () => void;
  children: React.ReactNode;
}

export function ModalManager({
  activeModal,
  onClose,
  children,
}: ModalManagerProps) {
  if (!activeModal) return null;

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>{children}</SafeAreaView>
    </Modal>
  );
}

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
}

export function ModalHeader({ title, onClose }: ModalHeaderProps) {
  return (
    <View style={styles.modalHeader}>
      <Text style={styles.modalTitle}>{title}</Text>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

interface ModalContentProps {
  children: React.ReactNode;
  description?: string;
}

export function ModalContent({ children, description }: ModalContentProps) {
  return (
    <ScrollView style={styles.modalContent}>
      {description && (
        <Text style={styles.modalDescription}>{description}</Text>
      )}
      {children}
    </ScrollView>
  );
}
