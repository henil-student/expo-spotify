import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { colors, gStyle } from '../constants';

const AuthLink = ({
  onPress,
  disabled,
  text,
  linkText,
  style,
  textStyle,
  linkStyle,
  testID
}) => {
  return (
    <TouchableOpacity
      activeOpacity={gStyle.activeOpacity}
      onPress={onPress}
      disabled={disabled}
      style={[styles.container, style]}
      testID={testID}
      accessibilityRole="link"
      accessibilityState={{ disabled }}
      accessibilityLabel={`${text} ${linkText}`}
      accessibilityHint={`Navigate to ${linkText} screen`}
    >
      <Text style={[gStyle.textSpotify16, styles.text, textStyle]}>
        {text}{' '}
        <Text style={[styles.link, linkStyle, disabled && styles.linkDisabled]}>
          {linkText}
        </Text>
      </Text>
    </TouchableOpacity>
  );
};

AuthLink.propTypes = {
  onPress: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  text: PropTypes.string.isRequired,
  linkText: PropTypes.string.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  textStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  linkStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  testID: PropTypes.string
};

AuthLink.defaultProps = {
  disabled: false,
  style: null,
  textStyle: null,
  linkStyle: null,
  testID: 'auth-link'
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 8,
    minWidth: 200
  },
  text: {
    color: colors.greyInactive,
    textAlign: 'center'
  },
  link: {
    color: colors.brandPrimary
  },
  linkDisabled: {
    opacity: 0.6
  }
});

export default AuthLink;
