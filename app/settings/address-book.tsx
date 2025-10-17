import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { CommonSafeAreaView } from '@/components/CommonSafeAreaView';
import { PageHeader } from '@/components/common/PageHeader';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  useAddressBookStore,
  AddressBookItem,
} from '@/stores/addressBookStore';
import { AddAddressModal } from '@/components/modals/AddAddressModal';
import { useNiceModal } from '@/hooks/useNiceModal';

import * as Clipboard from 'expo-clipboard';

export default function AddressBookScreen() {
  const { addresses, deleteAddress } = useAddressBookStore();
  const addAddressModal = useNiceModal(AddAddressModal);

  // Open add address modal
  const handleAddAddress = () => {
    // Clear editing state
    const { setEditingItem } = useAddressBookStore.getState();
    setEditingItem(null);
    addAddressModal.open();
  };

  // Open edit address modal
  const handleEditAddress = (item: AddressBookItem) => {
    // Save editing item to global state
    const { setEditingItem } = useAddressBookStore.getState();
    setEditingItem(item);
    addAddressModal.open();
  };

  // Delete address
  const handleDeleteAddress = (item: AddressBookItem) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete address "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteAddress(item.id);
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Copy address to clipboard
  const handleCopyAddress = async (address: string) => {
    await Clipboard.setStringAsync(address);
    Alert.alert('Success', 'Address copied to clipboard');
  };

  // Share address
  const handleShareAddress = async (item: AddressBookItem) => {
    try {
      await Share.share({
        message: `${item.name}: ${item.address}`,
        title: `Share Address: ${item.name}`,
      });
    } catch (error) {
      console.error('Error sharing address:', error);
      Alert.alert('Error', 'Sharing failed', [{ text: 'OK', style: 'cancel' }]);
    }
  };

  // Render empty state
  const renderEmptyState = () => (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
      }}
    >
      <Icon name="person-add-outline" size={64} color="#94a3b8" />
      <Text
        style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1e293b',
          marginTop: 16,
        }}
      >
        Address Book is Empty
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: '#64748b',
          textAlign: 'center',
          marginTop: 8,
          paddingHorizontal: 40,
        }}
      >
        Add frequently used addresses for quick transfers
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: '#6366f1',
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 12,
          marginTop: 24,
        }}
        onPress={handleAddAddress}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
          Add Address
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render address item
  const renderAddressItem = (item: AddressBookItem) => (
    <View
      key={item.id}
      style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>
            {item.name}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#64748b',
              fontFamily: 'monospace',
              marginTop: 4,
              marginBottom: 8,
            }}
            numberOfLines={1}
          >
            {item.address}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={{ padding: 8 }}
            onPress={() => handleCopyAddress(item.address)}
          >
            <Icon name="copy-outline" size={20} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ padding: 8 }}
            onPress={() => handleShareAddress(item)}
          >
            <Icon name="share-outline" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          onPress={() => handleEditAddress(item)}
        >
          <Icon name="pencil-outline" size={16} color="#6366f1" />
          <Text style={{ fontSize: 14, color: '#6366f1' }}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          onPress={() => handleDeleteAddress(item)}
        >
          <Icon name="trash-outline" size={16} color="#ef4444" />
          <Text style={{ fontSize: 14, color: '#ef4444' }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <CommonSafeAreaView style={{ flex: 1 }} className="bg-white">
      <PageHeader title="Address Book" />

      <ScrollView
        style={{ flex: 1, padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {addresses.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={{ marginBottom: 100 }}>
            {addresses.map(renderAddressItem)}
          </View>
        )}
      </ScrollView>

      {/* 添加按钮 */}
      <View style={{ position: 'absolute', bottom: 24, right: 24 }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#6366f1',
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
          onPress={handleAddAddress}
        >
          <Icon name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <AddAddressModal id="add-address-modal" />
    </CommonSafeAreaView>
  );
}
