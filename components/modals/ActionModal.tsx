import React, { useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';

interface ActionModalProps {
  visible: boolean;
  onClose: () => void;
}

const ActionModal: React.FC<ActionModalProps> = ({ visible, onClose }) => {
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClose = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      onClose();
    }, 50);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const actions = [
    {
      id: 'deposit',
      title: 'Deposit',
      icon: 'wallet',
      color: 'bg-black',
      onPress: () => {
        console.log('Deposit pressed');
        handleClose();
      },
    },
    {
      id: 'portfolio',
      title: 'Portfolio',
      icon: 'trending-up',
      color: 'bg-black',
      onPress: () => {
        console.log('Save pressed');
        handleClose();
      },
    },
    {
      id: 'transfer',
      title: 'Transfer',
      icon: 'swap-horizontal',
      color: 'bg-black',
      onPress: () => {
        console.log('Invest pressed');
        handleClose();
      },
    },
    {
      id: 'actions',
      title: 'Actions',
      icon: 'add-circle',
      color: 'bg-black',
      onPress: () => {
        console.log('Transfer pressed');
        handleClose();
      },
    },
    {
      id: 'receive',
      title: 'Receive',
      icon: 'arrow-down',
      color: 'bg-black',
      onPress: () => {
        console.log('receive pressed');
        handleClose();
      },
    },
  ];

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onSwipeComplete={handleClose}
      swipeDirection={['down']}
      style={{
        justifyContent: 'flex-end',
        margin: 0,
      }}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={300}
      animationOutTiming={300}
      avoidKeyboard={true}
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
      propagateSwipe={true}
    >
      <View
        style={{
          backgroundColor: 'white',
          borderTopLeftRadius: 200,
          borderTopRightRadius: 200,
          paddingTop: 40,
          paddingBottom: 40,
          paddingHorizontal: 20,
          minHeight: 280,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 20,
        }}
      >
        {/* Header spacer */}
        <View className="flex-row justify-center mb-8" />

        {/* Action buttons */}
        <View className="px-6">
          {/* First row: Deposit, Portfolio */}
          <View className="flex-row justify-between mb-8">
            {actions.slice(0, 2).map(action => (
              <View key={action.id} className="items-center flex-1">
                <TouchableOpacity
                  className={`w-16 h-16 ${action.color} rounded-full items-center justify-center mb-3`}
                  onPress={action.onPress}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 4,
                    },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <Icon name={action.icon} size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-xs text-gray-600 font-medium text-center">
                  {action.title}
                </Text>
              </View>
            ))}
          </View>

          {/* Second row: Transfer, Actions, Receive */}
          <View className="flex-row justify-center">
            <View className="flex-row justify-between w-full max-w-xs">
              {actions.slice(2, 5).map(action => (
                <View key={action.id} className="items-center">
                  <TouchableOpacity
                    className={`w-16 h-16 ${action.color} rounded-full items-center justify-center mb-3`}
                    onPress={action.onPress}
                    style={{
                      shadowColor: '#000',
                      shadowOffset: {
                        width: 0,
                        height: 4,
                      },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 8,
                    }}
                  >
                    <Icon name={action.icon} size={24} color="white" />
                  </TouchableOpacity>
                  <Text className="text-xs text-gray-600 font-medium text-center">
                    {action.title}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ActionModal;
