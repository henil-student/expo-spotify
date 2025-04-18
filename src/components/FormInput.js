import React, { forwardRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { colors, gStyle } from '../constants';

const FormInput = forwardRef(({ 
  placeholder, 
  secureTextEntry, 
  onChangeText, 
  value,
  keyboardType = 'default',
  returnKeyType = 'next',
  onSubmitEditing,
  blurOnSubmit = false,
  autoCapitalize = 'none',
  autoCompleteType,
  textContentType,
  editable = true
}, ref) => {
  return (
    <View style={[
      styles.container,
      !editable && styles.disabled
    ]}>
      <TextInput
        ref={ref}
        placeholder={placeholder}
        placeholderTextColor={colors.greyInactive}
        secureTextEntry={secureTextEntry}
        style={[
          gStyle.textSpotify16,
          styles.input,
          !editable && styles.disabledText
        ]}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={blurOnSubmit}
        autoCompleteType={autoCompleteType}
        textContentType={textContentType}
        onChangeText={onChangeText}
        value={value}
        editable={editable}
        accessibilityLabel={placeholder}
        accessibilityHint={`Enter your ${placeholder.toLowerCase()}`}
        importantForAutofill="yes"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.grey,
    borderRadius: 4,
    marginBottom: 16
  },
  disabled: {
    opacity: 0.6
  },
  input: {
    color: colors.white,
    height: 48,
    paddingHorizontal: 16,
    width: '100%'
  },
  disabledText: {
    color: colors.greyInactive
  }
});

FormInput.displayName = 'FormInput';

export default FormInput;
