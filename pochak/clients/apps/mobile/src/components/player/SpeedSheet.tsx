import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import {colors} from '../../theme';

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

interface SpeedSheetProps {
  visible: boolean;
  currentSpeed: number;
  onSelect: (speed: number) => void;
  onClose: () => void;
}

const SpeedSheet: React.FC<SpeedSheetProps> = ({
  visible,
  currentSpeed,
  onSelect,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>재생 속도</Text>
          {SPEED_OPTIONS.map(speed => {
            const isActive = speed === currentSpeed;
            return (
              <TouchableOpacity
                key={speed}
                style={[styles.option, isActive && styles.optionActive]}
                onPress={() => {
                  onSelect(speed);
                  onClose();
                }}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.optionText,
                    isActive && styles.optionTextActive,
                  ]}>
                  {speed === 1 ? '1x (기본)' : `${speed}x`}
                </Text>
                {isActive && (
                  <View style={styles.checkMark}>
                    <Text style={styles.checkMarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface, // #262626
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34, // safe area
    paddingHorizontal: 16,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  optionActive: {
    backgroundColor: 'rgba(0,200,83,0.1)',
  },
  optionText: {
    color: colors.grayLight,
    fontSize: 15,
  },
  optionTextActive: {
    color: colors.green,
    fontWeight: '600',
  },
  checkMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMarkText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default SpeedSheet;
