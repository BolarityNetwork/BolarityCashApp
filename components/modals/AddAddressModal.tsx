import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { BaseModal } from '../common/BaseModal';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { useAddressBookStore } from '@/stores/addressBookStore';

const AddAddressModalComponent: React.FC = () => {
  // Get editing item from global state
  const editItem = useAddressBookStore(state => state.editingItem);
  const modal = useModal();
  const { addAddress, updateAddress, error, clearError } =
    useAddressBookStore();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Fill data when in edit mode
  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setAddress(editItem.address);
    }
  }, [editItem]);

  // Handle error display
  useEffect(() => {
    if (error) {
      Alert.alert('错误', error);
      clearError();
    }
  }, [error, clearError]);

  // Validate Ethereum address
  const validateAddress = (addr: string): boolean => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethAddressRegex.test(addr)) {
      setAddressError('Please enter a valid Ethereum address');
      return false;
    }
    setAddressError('');
    return true;
  };

  const handleSubmit = async () => {
    // 验证输入
    if (!name.trim()) {
      Alert.alert('Notice', 'Please enter address name');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Notice', 'Please enter address');
      return;
    }

    if (!validateAddress(address)) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (editItem) {
        updateAddress(editItem.id, name.trim(), address.trim());
      } else {
        addAddress(name.trim(), address.trim());
      }

      modal.hide();
    } catch (err) {
      console.error('Error adding/updating address:', err);
      Alert.alert('Error', 'Operation failed, please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      visible={modal.visible}
      onClose={() => modal.hide()}
      title={editItem ? 'Edit Address' : 'Add Address'}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ padding: 16 }}>
            {/* 名称输入 */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
                Name
              </Text>
              <TextInput
                style={{
                  backgroundColor: '#f1f5f9',
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: '#1e293b',
                }}
                placeholder="Enter address name"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
                autoCapitalize="none"
              />
            </View>

            {/* 地址输入 */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
                Address
              </Text>
              <TextInput
                style={{
                  backgroundColor: '#f1f5f9',
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 14,
                  color: '#1e293b',
                  fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                }}
                placeholder="0x..."
                placeholderTextColor="#94a3b8"
                value={address}
                onChangeText={text => {
                  setAddress(text);
                  if (addressError && text.trim()) {
                    validateAddress(text);
                  }
                }}
                onBlur={() => validateAddress(address)}
                autoCapitalize="none"
                autoCorrect={false}
                multiline
                numberOfLines={2}
              />
              {addressError ? (
                <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                  {addressError}
                </Text>
              ) : null}
            </View>

            {/* 操作按钮 */}
            <TouchableOpacity
              style={{
                backgroundColor: '#6366f1',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
              }}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                {editItem ? 'Save' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BaseModal>
  );
};

export const AddAddressModal = NiceModal.create(AddAddressModalComponent);
