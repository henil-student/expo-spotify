import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { colors, gStyle } from '../constants';

const AuthButton = ({
  onPress,
  disabled,
  title,
  variant = 'primary',
  style,
  textStyle,
  testID
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButtonText;
      case 'secondary':
        return styles.secondaryButtonText;
      default:
        return styles.primaryButtonText;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={gStyle.activeOpacity}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.buttonDisabled,
        style
      ]}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text
        style={[
          gStyle.textSpotifyBold16,
          getTextStyle(),
          disabled && styles.textDisabled,
          textStyle
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

AuthButton.propTypes = {
  onPress: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  title: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary']),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  textStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  testID: PropTypes.string
};

AuthButton.defaultProps = {
  disabled: false,
  variant: 'primary',
  style: null,
  textStyle: null,
  testID: 'auth-button'
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginTop: 24,
    minWidth: 200
  },
  primaryButton: {
    backgroundColor: colors.brandPrimary
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.brandPrimary
  },
  buttonDisabled: {
    opacity: 0.6
  },
  primaryButtonText: {
    color: colors.white,
    textAlign: 'center'
  },
  secondaryButtonText: {
    color: colors.brandPrimary,
    textAlign: 'center'
  },
  textDisabled: {
    opacity: 0.8
  }
});

export default AuthButton;
