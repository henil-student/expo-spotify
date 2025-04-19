import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, device, fonts, gStyle } from '../constants';

const Toast = ({ visible, message, duration, onHide, type = 'info', title = '' }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    } else {
      opacity.setValue(0); // Reset opacity if visibility changes externally
    }
  }, [visible, duration, onHide, opacity]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return colors.brandPrimary; // Using brand color for error
      case 'success':
        return colors.brandGreen;
      case 'warning':
        return colors.brandYellow;
      case 'info':
      default:
        return colors.grey; // Default grey for info
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity, backgroundColor: getBackgroundColor() },
      ]}
    >
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

Toast.propTypes = {
  visible: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  onHide: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['info', 'success', 'error', 'warning']),
  title: PropTypes.string,
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: device.iPhoneX ? 50 : 30, // Adjust top position
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    zIndex: 1000, // Ensure it's above other content
    alignItems: 'center',
  },
  title: {
    ...gStyle.textSpotifyBold14,
    color: colors.white,
    marginBottom: 4,
  },
  message: {
    ...gStyle.textSpotify14,
    color: colors.white,
    textAlign: 'center',
  },
});

export default Toast;
