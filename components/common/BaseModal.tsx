import React from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { TakoToast } from './TakoToast';
import Toast from 'react-native-toast-message';
import { toastConfig } from './ToastConfig';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BaseModal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: '#F9FAFC',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 25,
            paddingVertical: 16,
            backgroundColor: 'transparent',
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#000000',
            }}
          >
            {title || ''}
          </Text>
          <TouchableOpacity
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#F1F5F7',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={onClose}
          >
            <Text
              style={{
                fontSize: 16,
                color: '#000000',
              }}
            >
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{
            flex: 1,
          }}
          contentContainerStyle={{
            paddingBottom: 40,
          }}
        >
          {children}
        </ScrollView>
        <TakoToast.Component />
        <Toast config={toastConfig} />
      </SafeAreaView>
    </Modal>
  );
};
