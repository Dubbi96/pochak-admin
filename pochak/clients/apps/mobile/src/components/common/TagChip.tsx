import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface TagChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

const TagChip: React.FC<TagChipProps> = ({
  label,
  selected = false,
  onPress,
  removable = false,
  onRemove,
}) => {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        #{label}
      </Text>
      {removable ? (
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialIcons name="close" size={14} color="#A6A6A6" style={styles.removeIcon} />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A6A6A6',
    backgroundColor: '#262626',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    borderColor: '#00CC33',
    backgroundColor: 'rgba(0, 200, 83, 0.1)',
  },
  label: {
    color: '#A6A6A6',
    fontSize: 14,
  },
  labelSelected: {
    color: '#00CC33',
  },
  removeIcon: {
    marginLeft: 4,
  },
});

export default TagChip;
