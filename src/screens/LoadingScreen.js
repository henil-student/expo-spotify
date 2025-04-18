import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
import { colors, gStyle } from '../constants';

const LoadingScreen = ({ message = 'Loading...' }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={[gStyle.container, styles.center]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <ActivityIndicator 
          size="large" 
          color={colors.brandPrimary} 
          style={styles.spinner}
        />
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    backgroundColor: colors.grey,
    borderRadius: 12,
    padding: 24,
    minWidth: 200,
  },
  spinner: {
    marginBottom: 16,
  },
  text: {
    ...gStyle.textSpotify16,
    color: colors.white,
    textAlign: 'center',
  },
});

export default LoadingScreen;
