import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

interface UpdateModalProps {
  visible: boolean;
  onUpdate?: () => void;
  onClose?: () => void;
  updateInfo?: {
    version?: string;
    description?: string;
    isMandatory?: boolean;
  };
}

const { width: screenWidth } = Dimensions.get('window');

export default function UpdateModal({
  visible,
  onUpdate,
  onClose,
  updateInfo,
}: UpdateModalProps) {
  const { t } = useTranslation();
  if (!visible) return null;

  const handleUpdate = () => {
    onUpdate?.();
  };

  const handleClose = () => {
    if (updateInfo?.isMandatory) return; // 强制更新时不允许关闭
    onClose?.();
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.overlayBackground} onPress={handleClose} />
      <View style={styles.container}>
        {/* Header with gradient */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.headerGradient}
        >
          <Text style={styles.updateIcon}>🔄</Text>
          <Text style={styles.updateTitle}>{t('modals.updateAvailable')}</Text>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          {updateInfo?.version && (
            <Text style={styles.versionText}>
              {t('modals.newVersion')} {updateInfo.version}
            </Text>
          )}

          <Text style={styles.desc}>
            {updateInfo?.description || t('modals.newVersionDescription')}
          </Text>

          {updateInfo?.isMandatory && (
            <View style={styles.mandatoryBadge}>
              <Text style={styles.mandatoryText}>
                {t('modals.requiredUpdate')}
              </Text>
            </View>
          )}
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdate}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.gradientButton}
            >
              <Text style={styles.updateButtonText}>
                {t('modals.updateNow')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {!updateInfo?.isMandatory && (
            <TouchableOpacity
              style={styles.laterButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.laterButtonText}>{t('modals.later')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {updateInfo?.isMandatory
              ? t('modals.requiredToContinue')
              : t('modals.canUpdateLater')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    maxWidth: Math.min(screenWidth - 40, 320),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  updateIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  updateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    color: '#2c3e50',
  },
  desc: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
    color: '#7f8c8d',
  },
  mandatoryBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  mandatoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
  },
  updateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  laterButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  laterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
    color: '#999',
  },
});
