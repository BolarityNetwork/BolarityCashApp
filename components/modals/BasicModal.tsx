import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import NiceModal, { useModal } from '@ebay/nice-modal-react';

interface BasicModalProps {
  title?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

// 使用 NiceModal.create 方法创建模态框
export const BasicModal = NiceModal.create<BasicModalProps>(props => {
  // 使用 useModal hook 获取模态框实例
  const modal = useModal(BasicModal, { ...props });
  const {
    title = '提示',
    message = '这是一个基础模态框',
    onConfirm,
    onCancel,
    confirmText = '确定',
    cancelText = '取消',
  } = props;

  const handleClose = useCallback(() => {
    modal.remove();
  }, [modal]);

  const handleConfirm = useCallback(() => {
    if (onConfirm) {
      onConfirm();
    }
    handleClose();
  }, [onConfirm, handleClose]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
    handleClose();
  }, [onCancel, handleClose]);

  return (
    <Modal
      visible={modal.visible}
      animationType="fade"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="bg-black/50 justify-center items-center p-4">
        <View className="bg-white rounded-lg w-full max-w-md overflow-hidden">
          {/* 标题 */}
          {title && (
            <View className="p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-center text-gray-800">
                {title}
              </Text>
            </View>
          )}

          {/* 内容 */}
          <View className="p-6">
            <Text className="text-gray-600 text-center">{message}</Text>
          </View>

          {/* 按钮区域 */}
          <View className="flex flex-row border-t border-gray-200">
            <TouchableOpacity
              className="flex-1 p-3 border-r border-gray-200"
              onPress={handleCancel}
            >
              <Text className="text-center text-gray-600 font-medium">
                {cancelText}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 p-3" onPress={handleConfirm}>
              <Text className="text-center text-blue-600 font-medium">
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

// 导出默认的模态框组件
export default BasicModal;
