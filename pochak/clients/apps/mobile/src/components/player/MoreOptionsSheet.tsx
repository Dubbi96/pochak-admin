import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../../theme';
import SpeedSheet from './SpeedSheet';
import CameraViewSheet, {CameraView} from './CameraViewSheet';

interface MoreOptionsSheetProps {
  visible: boolean;
  currentSpeed: number;
  currentCameraViewId: string;
  cameraViews?: CameraView[];
  onSpeedChange: (speed: number) => void;
  onCameraViewChange: (viewId: string) => void;
  onClipCreate: () => void;
  onTimeline?: () => void;
  onShare?: () => void;
  onClose: () => void;
}

interface OptionItem {
  key: string;
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
  disabled?: boolean;
}

const MoreOptionsSheet: React.FC<MoreOptionsSheetProps> = ({
  visible,
  currentSpeed,
  currentCameraViewId,
  cameraViews,
  onSpeedChange,
  onCameraViewChange,
  onClipCreate,
  onTimeline,
  onShare,
  onClose,
}) => {
  const [showSpeedSheet, setShowSpeedSheet] = useState(false);
  const [showCameraSheet, setShowCameraSheet] = useState(false);

  const options: OptionItem[] = [
    {
      key: 'camera',
      icon: 'videocam',
      label: '카메라 뷰',
      value: currentCameraViewId.toUpperCase(),
      onPress: () => {
        onClose();
        setTimeout(() => setShowCameraSheet(true), 300);
      },
    },
    {
      key: 'clip',
      icon: 'content-cut',
      label: '클립 만들기',
      onPress: () => {
        onClipCreate();
        onClose();
      },
    },
    {
      key: 'timeline',
      icon: 'timeline',
      label: '타임라인',
      onPress: () => {
        onClose();
        setTimeout(() => onTimeline?.(), 300);
      },
      disabled: !onTimeline,
    },
    {
      key: 'quality',
      icon: 'high-quality',
      label: '화질 설정',
      value: 'TODO',
      onPress: () => {
        // TODO: Future implementation - QualitySheet
      },
      disabled: true,
    },
    {
      key: 'speed',
      icon: 'speed',
      label: '재생 속도',
      value: currentSpeed === 1 ? '1x' : `${currentSpeed}x`,
      onPress: () => {
        onClose();
        setTimeout(() => setShowSpeedSheet(true), 300);
      },
    },
    {
      key: 'sound',
      icon: 'volume-up',
      label: '소리 설정',
      value: 'TODO',
      onPress: () => {
        // TODO: Future implementation - volume slider control
      },
      disabled: true,
    },
    {
      key: 'share',
      icon: 'share',
      label: '공유하기',
      onPress: () => {
        onClose();
        setTimeout(() => onShare?.(), 300);
      },
      disabled: !onShare,
    },
    {
      key: 'report',
      icon: 'flag',
      label: '신고하기',
      value: 'TODO',
      onPress: () => {
        // TODO: Future implementation - report functionality
      },
      disabled: true,
    },
  ];

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title}>더보기</Text>
            {options.map(option => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionRow,
                  option.disabled && styles.optionDisabled,
                ]}
                onPress={option.onPress}
                activeOpacity={0.7}
                disabled={option.disabled}>
                <View style={styles.optionLeft}>
                  <MaterialIcons
                    name={option.icon as any}
                    size={22}
                    color={
                      option.disabled ? colors.gray : colors.grayLight
                    }
                  />
                  <Text
                    style={[
                      styles.optionLabel,
                      option.disabled && styles.optionLabelDisabled,
                    ]}>
                    {option.label}
                  </Text>
                </View>
                <View style={styles.optionRight}>
                  {option.value && (
                    <Text
                      style={[
                        styles.optionValue,
                        option.disabled && styles.optionValueDisabled,
                      ]}>
                      {option.value}
                    </Text>
                  )}
                  {!option.disabled && (
                    <MaterialIcons
                      name="chevron-right"
                      size={20}
                      color={colors.gray}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <SpeedSheet
        visible={showSpeedSheet}
        currentSpeed={currentSpeed}
        onSelect={onSpeedChange}
        onClose={() => setShowSpeedSheet(false)}
      />

      <CameraViewSheet
        visible={showCameraSheet}
        cameraViews={cameraViews}
        currentViewId={currentCameraViewId}
        onSelect={onCameraViewChange}
        onClose={() => setShowCameraSheet(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34,
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
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionLabel: {
    color: colors.white,
    fontSize: 15,
  },
  optionLabelDisabled: {
    color: colors.gray,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  optionValue: {
    color: colors.grayLight,
    fontSize: 13,
  },
  optionValueDisabled: {
    color: colors.gray,
  },
});

export default MoreOptionsSheet;
