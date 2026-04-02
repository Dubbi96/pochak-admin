import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';

interface InputFieldProps extends TextInputProps {
  label?: string;
  rightElement?: React.ReactNode;
  rightText?: string;
  onRightPress?: () => void;
  containerStyle?: ViewStyle;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  rightElement,
  rightText,
  onRightPress,
  containerStyle,
  error,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? '#E51728'
    : isFocused
      ? '#00CC33'
      : '#4D4D4D';

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrapper, {borderColor}]}>
        <TextInput
          style={styles.input}
          placeholderTextColor="#A6A6A6"
          onFocus={e => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={e => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
          {...textInputProps}
        />
        {rightElement}
        {rightText ? (
          <TouchableOpacity onPress={onRightPress} style={styles.rightButton}>
            <Text style={styles.rightText}>{rightText}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    color: '#A6A6A6',
    fontSize: 13,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262626',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4D4D4D',
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    padding: 0,
  },
  rightButton: {
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  rightText: {
    color: '#00CC33',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#E51728',
    fontSize: 12,
    marginTop: 4,
  },
});

export default InputField;
