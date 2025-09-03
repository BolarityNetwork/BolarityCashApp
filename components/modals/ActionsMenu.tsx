// components/PerfectVaultSavingsPlatform/modals/ActionsMenu.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import IconComponent from '../home/IconComponent';

interface ActionsMenuProps {
  visible: boolean;
  onClose: () => void;
  opacity: Animated.Value;
  scale: Animated.Value;
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({
  visible,
  onClose,
  opacity,
  scale,
}) => {
  if (!visible) return null;

  return (
    <>
      <Animated.View style={[styles.actionMenuOverlay, { opacity }]} />
      <Animated.View
        style={[
          styles.actionMenuContainer,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <View style={styles.actionMenuBackground}>
          {/* Action buttons arranged in arc */}
          <View style={styles.actionMenuContent}>
            {/* Save - Top Left */}
            <TouchableOpacity
              style={[styles.actionButton, { left: '25%', top: '45%' }]}
              activeOpacity={0.8}
            >
              <View style={styles.actionButtonContainer}>
                <View style={styles.actionButtonIcon}>
                  <IconComponent name="PiggyBank" size={24} color="#fff" />
                </View>
                <Text style={styles.actionButtonLabel}>Save</Text>
              </View>
            </TouchableOpacity>

            {/* Invest - Top Right */}
            <TouchableOpacity
              style={[styles.actionButton, { right: '25%', top: '45%' }]}
              activeOpacity={0.8}
            >
              <View style={styles.actionButtonContainer}>
                <View style={styles.actionButtonIcon}>
                  <IconComponent name="TrendingUp" size={24} color="#fff" />
                </View>
                <Text style={styles.actionButtonLabel}>Invest</Text>
              </View>
            </TouchableOpacity>

            {/* Deposit - Center Top (Larger) */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                { left: '50%', top: '35%', marginLeft: -32 },
              ]}
              activeOpacity={0.8}
            >
              <View style={styles.actionButtonContainer}>
                <View
                  style={[
                    styles.actionButtonIcon,
                    styles.actionButtonIconLarge,
                  ]}
                >
                  <IconComponent name="Plus" size={32} color="#fff" />
                </View>
                <Text style={styles.actionButtonLabel}>Deposit</Text>
              </View>
            </TouchableOpacity>

            {/* Actions - Center Bottom */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                { left: '50%', bottom: '25%', marginLeft: -28 },
              ]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <View style={styles.actionButtonContainer}>
                <View style={styles.actionButtonIcon}>
                  <IconComponent name="Grid3X3" size={24} color="#fff" />
                </View>
                <Text style={styles.actionButtonLabel}>Actions</Text>
              </View>
            </TouchableOpacity>

            {/* Transfer - Bottom Left */}
            <TouchableOpacity
              style={[styles.actionButton, { left: '20%', bottom: '30%' }]}
              activeOpacity={0.8}
            >
              <View style={styles.actionButtonContainer}>
                <View style={styles.actionButtonIcon}>
                  <IconComponent name="DollarSign" size={24} color="#fff" />
                </View>
                <Text style={styles.actionButtonLabel}>Transfer</Text>
              </View>
            </TouchableOpacity>

            {/* Refer a Friend - Bottom Right */}
            <TouchableOpacity
              style={[styles.actionButton, { right: '20%', bottom: '30%' }]}
              activeOpacity={0.8}
            >
              <View style={styles.actionButtonContainer}>
                <View style={styles.actionButtonIcon}>
                  <IconComponent name="Gift" size={24} color="#fff" />
                </View>
                <Text style={styles.actionButtonLabel}>Refer a Friend</Text>
              </View>
            </TouchableOpacity>

            {/* Dots indicator at bottom */}
            <View style={styles.dotsIndicator}>
              <View style={[styles.dot, styles.activeDot]} />
              <View style={[styles.dot, styles.inactiveDot]} />
            </View>
          </View>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  actionMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 30,
  },
  actionMenuContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 31,
  },
  actionMenuBackground: {
    height: 380,
    backgroundColor: '#fff',
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    marginLeft: -50,
    marginRight: -50,
    paddingLeft: 50,
    paddingRight: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
  },
  actionMenuContent: {
    position: 'relative',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    position: 'absolute',
  },
  actionButtonContainer: {
    alignItems: 'center',
  },
  actionButtonIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#000',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  actionButtonLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  dotsIndicator: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#000',
  },
  inactiveDot: {
    backgroundColor: '#d1d5db',
  },
});

export default ActionsMenu;
