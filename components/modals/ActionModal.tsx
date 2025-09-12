import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Pressable,
  View,
  Modal,
  Animated,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface ActionModalProps {
  visible: boolean;
  onClose: () => void;
  animValue: Animated.Value;
}

const ActionModal: React.FC<ActionModalProps> = ({
  visible,
  onClose,
  animValue,
}) => {
  // internal animation value for the modal popup effect
  const modalAnimValue = useRef(new Animated.Value(0)).current;
  // control whether the modal content should be displayed
  const [shouldShowContent, setShouldShowContent] = useState(false);

  // useCallback to create an animation completion callback to avoid calling setState in the animation callback
  const handleAnimationComplete = useCallback(() => {
    setTimeout(() => {
      setShouldShowContent(false);
    }, 50);
  }, []);

  // when visible changes, start the popup animation
  useEffect(() => {
    if (visible) {
      // stop any ongoing animations
      modalAnimValue.stopAnimation();
      // reset the animation value
      modalAnimValue.setValue(0);
      // immediately display the content
      setShouldShowContent(true);
    } else {
      // stop any ongoing animations
      modalAnimValue.stopAnimation();
      // start the disappearing animation, and hide the content after the animation is complete
      Animated.timing(modalAnimValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(handleAnimationComplete);
    }
  }, [visible, modalAnimValue, handleAnimationComplete]);

  // handle the animation startup separately
  useEffect(() => {
    if (visible && shouldShowContent) {
      // use requestAnimationFrame to ensure the animation is executed in the next frame
      requestAnimationFrame(() => {
        Animated.timing(modalAnimValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [visible, shouldShowContent, modalAnimValue]);

  const actions = [
    {
      id: 'deposit',
      title: 'Deposit',
      icon: 'wallet',
      color: 'bg-black',
      onPress: () => {
        console.log('Deposit pressed');
        onClose();
      },
    },
    {
      id: 'portfolio',
      title: 'Portfolio',
      icon: 'trending-up',
      color: 'bg-black',
      onPress: () => {
        console.log('Save pressed');
        onClose();
      },
    },
    {
      id: 'transfer',
      title: 'Transfer',
      icon: 'swap-horizontal',
      color: 'bg-black',
      onPress: () => {
        console.log('Invest pressed');
        onClose();
      },
    },
    {
      id: 'actions',
      title: 'Actions',
      icon: 'add-circle',
      color: 'bg-black',
      onPress: () => {
        console.log('Transfer pressed');
        onClose();
      },
    },
    {
      id: 'receive',
      title: 'Receive',
      icon: 'arrow-down',
      color: 'bg-black',
      onPress: () => {
        console.log('receive pressed');
        onClose();
      },
    },
  ];

  return (
    <Modal
      visible={visible && shouldShowContent}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: animValue,
        }}
      >
        <Pressable className="flex-1" onPress={onClose} />

        <Animated.View
          style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 200,
            borderTopRightRadius: 200,
            paddingTop: 40,
            paddingBottom: 40,
            paddingHorizontal: 20,
            minHeight: 280,
            transform: [
              {
                translateY: modalAnimValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [400, 0],
                }),
              },
              {
                scale: modalAnimValue.interpolate({
                  inputRange: [0, 0.3, 0.6, 1],
                  outputRange: [0.8, 0.95, 1.01, 1],
                }),
              },
            ],
            opacity: modalAnimValue,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -4,
            },
            shadowOpacity: modalAnimValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.25],
            }),
            shadowRadius: modalAnimValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 20],
            }),
            elevation: modalAnimValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 20],
            }),
          }}
        >
          <Animated.View
            className="flex-row justify-center mb-8"
            style={{
              opacity: modalAnimValue.interpolate({
                inputRange: [0, 0.2, 1],
                outputRange: [0, 0.5, 1],
              }),
              transform: [
                {
                  translateY: modalAnimValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
                {
                  scale: modalAnimValue.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [0.8, 0.95, 1],
                  }),
                },
              ],
            }}
          ></Animated.View>

          <View className="px-6">
            <View className="flex-row justify-between mb-8">
              {actions.slice(0, 2).map(action => (
                <Animated.View
                  key={action.id}
                  className="items-center flex-1"
                  style={{
                    opacity: modalAnimValue,
                    transform: [
                      {
                        scale: modalAnimValue.interpolate({
                          inputRange: [0, 0.2, 0.4, 1],
                          outputRange: [0.6, 0.8, 1.03, 1],
                        }),
                      },
                      {
                        translateY: modalAnimValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0],
                        }),
                      },
                    ],
                  }}
                >
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
                  <Animated.Text
                    className="text-xs text-gray-600 font-medium text-center"
                    style={{
                      opacity: modalAnimValue,
                      transform: [
                        {
                          translateY: modalAnimValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [10, 0],
                          }),
                        },
                      ],
                    }}
                  >
                    {action.title}
                  </Animated.Text>
                </Animated.View>
              ))}
            </View>

            {/* second row: Transfer, Deposit, Refer */}
            <View className="flex-row justify-center">
              <View className="flex-row justify-between w-full max-w-xs">
                {actions.slice(2, 5).map(action => (
                  <Animated.View
                    key={action.id}
                    className="items-center"
                    style={{
                      opacity: modalAnimValue,
                      transform: [
                        {
                          scale: modalAnimValue.interpolate({
                            inputRange: [0, 0.2, 0.4, 1],
                            outputRange: [0.6, 0.8, 1.03, 1],
                          }),
                        },
                        {
                          translateY: modalAnimValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [30, 0],
                          }),
                        },
                      ],
                    }}
                  >
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
                    <Animated.Text
                      className="text-xs text-gray-600 font-medium text-center"
                      style={{
                        opacity: modalAnimValue,
                        transform: [
                          {
                            translateY: modalAnimValue.interpolate({
                              inputRange: [0, 1],
                              outputRange: [10, 0],
                            }),
                          },
                        ],
                      }}
                    >
                      {action.title}
                    </Animated.Text>
                  </Animated.View>
                ))}
              </View>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default ActionModal;
