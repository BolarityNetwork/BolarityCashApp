import React from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ModalProps } from '../types';

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
          backgroundColor: '#f8fafc',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: '#fff',
            borderBottomWidth: 1,
            borderBottomColor: '#f1f5f9',
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#1e293b',
            }}
          >
            {title}
          </Text>
          <TouchableOpacity
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#f1f5f9',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={onClose}
          >
            <Text
              style={{
                fontSize: 16,
                color: '#64748b',
              }}
            >
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{
            flex: 1,
            padding: 20,
          }}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
