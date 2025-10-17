import { NiceModalProps } from '@/hooks/useNiceModal';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import React, { useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface ActionModalProps {
  onReceivePress?: () => void;
  onTransferPress?: () => void;
}

const ActionModal: React.FC<ActionModalProps & NiceModalProps> = ({
  onReceivePress,
  onTransferPress,
}) => {
  const modal = useModal();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      modal.hide();
    });
  }, [modal, fadeAnim, scaleAnim]);

  const actions = [
    {
      id: 'deposit',
      title: 'Deposit',
      icon: 'wallet' as const,
      color: 'bg-black',
      onPress: handleClose,
    },
    {
      id: 'portfolio',
      title: 'Portfolio',
      icon: 'trending-up' as const,
      color: 'bg-black',
      onPress: handleClose,
    },
    {
      id: 'actions',
      title: 'Actions',
      icon: 'add-circle' as const,
      color: 'bg-black',
      onPress: handleClose,
    },
    {
      id: 'receive',
      title: 'Receive',
      icon: 'arrow-down' as const,
      color: 'bg-black',
      onPress: () => {
        handleClose();
        setTimeout(() => {
          if (onReceivePress) {
            onReceivePress();
          }
        }, 250);
      },
    },
    {
      id: 'transfer',
      title: 'Transfer',
      icon: 'arrow-up' as const,
      color: 'bg-black',
      onPress: () => {
        handleClose();
        setTimeout(() => {
          if (onTransferPress) {
            onTransferPress();
          }
        }, 250);
      },
    },
  ];

  useEffect(() => {
    if (modal.visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => {
      fadeAnim.stopAnimation();
      scaleAnim.stopAnimation();
    };
  }, [modal.visible, fadeAnim, scaleAnim]);

  return (
    <Modal
      visible={modal.visible}
      animationType="none"
      presentationStyle="overFullScreen"
      transparent={true}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
          opacity: fadeAnim,
        }}
      >
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View
          style={{
            backgroundColor: 'white',
            borderRadius: 300,
            paddingTop: 60,
            paddingBottom: 60,
            paddingHorizontal: 30,
            width: 600,
            height: 600,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 20,
            transform: [{ scale: scaleAnim }],
            overflow: 'hidden',
            alignSelf: 'center',
            marginBottom: -300,
          }}
        >
          <View className="flex-1 items-center px-8">
            <View className="w-full flex-row justify-center items-center mb-8 gap-x-16">
              <View className="items-center">
                <TouchableOpacity
                  className={`w-16 h-16 ${actions.find(a => a.id === 'portfolio')?.color} rounded-full items-center justify-center mb-2`}
                  onPress={actions.find(a => a.id === 'portfolio')?.onPress}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                >
                  <Icon name="trending-up" size={22} color="white" />
                </TouchableOpacity>
                <Text className="text-xs text-gray-600 font-medium text-center">
                  Portfolio
                </Text>
              </View>

              <View className="items-center">
                <TouchableOpacity
                  className={`w-16 h-16 ${actions.find(a => a.id === 'deposit')?.color} rounded-full items-center justify-center mb-2`}
                  onPress={actions.find(a => a.id === 'deposit')?.onPress}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                >
                  <Icon name="wallet" size={22} color="white" />
                </TouchableOpacity>
                <Text className="text-xs text-gray-600 font-medium text-center">
                  Deposit
                </Text>
              </View>
            </View>

            <View className="flex-row justify-center items-center gap-x-16">
              <View className="items-center">
                <TouchableOpacity
                  className="w-16 h-16 bg-black rounded-full items-center justify-center"
                  onPress={actions.find(a => a.id === 'actions')?.onPress}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <Icon name="add" size={22} color="white" />
                </TouchableOpacity>
                <Text className="text-xs text-gray-600 font-medium text-center">
                  Actions
                </Text>
              </View>

              <View className="items-center">
                <TouchableOpacity
                  className={`w-16 h-16 ${actions.find(a => a.id === 'receive')?.color} rounded-full items-center justify-center`}
                  onPress={actions.find(a => a.id === 'receive')?.onPress}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                >
                  <Icon name="arrow-down" size={22} color="white" />
                </TouchableOpacity>
                <Text className="text-xs text-gray-600 font-medium text-center">
                  Receive
                </Text>
              </View>

              <View className="items-center">
                <TouchableOpacity
                  className={`w-16 h-16 ${actions.find(a => a.id === 'transfer')?.color} rounded-full items-center justify-center`}
                  onPress={actions.find(a => a.id === 'transfer')?.onPress}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                >
                  <Icon name="arrow-up" size={22} color="white" />
                </TouchableOpacity>
                <Text className="text-xs text-gray-600 font-medium text-center">
                  Transfer
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default NiceModal.create<ActionModalProps>(ActionModal);
