import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface CheckboxItemProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
  rightText?: string;
  onRightPress?: () => void;
  bold?: boolean;
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({
  label,
  checked,
  onToggle,
  rightText,
  onRightPress,
  bold = false,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.row} onPress={onToggle}>
        <MaterialIcons
          name={checked ? 'check-box' : 'check-box-outline-blank'}
          size={24}
          color={checked ? '#00CC33' : '#A6A6A6'}
          style={styles.checkboxIcon}
        />
        <Text
          style={[styles.label, bold && styles.labelBold]}
          numberOfLines={2}
        >
          {label}
        </Text>
      </TouchableOpacity>
      {rightText ? (
        <TouchableOpacity onPress={onRightPress}>
          <Text style={styles.rightText}>{rightText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxIcon: {
    marginRight: 10,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  labelBold: {
    fontWeight: '700',
    fontSize: 16,
  },
  rightText: {
    color: '#A6A6A6',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});

export default CheckboxItem;
