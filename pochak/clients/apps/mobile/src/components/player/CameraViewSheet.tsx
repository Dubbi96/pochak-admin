import React from 'react';
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

// Camera views will come from VPU/CHU integration
export interface CameraView {
  id: string;
  label: string;
  streamUrl: string;
}

const DEFAULT_CAMERA_VIEWS: CameraView[] = [
  {id: 'ai', label: 'AI', streamUrl: ''},
  {id: 'pano', label: 'PANO', streamUrl: ''},
  {id: 'side-a', label: 'SIDE A', streamUrl: ''},
  {id: 'cam', label: 'CAM', streamUrl: ''},
];

interface CameraViewSheetProps {
  visible: boolean;
  /** Available camera views. Falls back to defaults when not provided. */
  cameraViews?: CameraView[];
  currentViewId: string;
  onSelect: (viewId: string) => void;
  onClose: () => void;
}

const CameraViewSheet: React.FC<CameraViewSheetProps> = ({
  visible,
  cameraViews,
  currentViewId,
  onSelect,
  onClose,
}) => {
  const views = cameraViews ?? DEFAULT_CAMERA_VIEWS;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>카메라 뷰</Text>
          <View style={styles.grid}>
            {views.map(view => {
              const isActive = view.id === currentViewId;
              return (
                <TouchableOpacity
                  key={view.id}
                  style={[styles.viewCard, isActive && styles.viewCardActive]}
                  onPress={() => {
                    onSelect(view.id);
                    onClose();
                  }}
                  activeOpacity={0.7}>
                  <MaterialIcons
                    name="videocam"
                    size={28}
                    color={isActive ? colors.green : colors.grayLight}
                  />
                  <Text
                    style={[
                      styles.viewLabel,
                      isActive && styles.viewLabelActive,
                    ]}>
                    {view.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  viewCard: {
    width: '47%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.grayDark,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  viewCardActive: {
    borderColor: colors.green,
  },
  viewLabel: {
    color: colors.grayLight,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  viewLabelActive: {
    color: colors.green,
  },
});

export default CameraViewSheet;
