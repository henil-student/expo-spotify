import React from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, gStyle } from '../constants';

// Default placeholder image
const placeholderImage = require('../assets/images/albums/placeholder.jpg');

const LineItemCategory = ({ bgColor, onPress, title, image }) => {
  // Ensure image is a valid source object or require path
  const imageSource = typeof image === 'string' ? { uri: image } : image || null;

  return (
    <TouchableOpacity
      activeOpacity={gStyle.activeOpacity}
      onPress={onPress}
      style={[styles.container, { backgroundColor: bgColor }]}
    >
      <Text style={styles.title}>{title}</Text>
      {imageSource && (
        <Image source={imageSource} style={styles.image} />
      )}
    </TouchableOpacity>
  );
};

LineItemCategory.defaultProps = {
  bgColor: colors.brandPrimary,
  image: null
};

LineItemCategory.propTypes = {
  // required
  onPress: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,

  // optional
  bgColor: PropTypes.string,
  image: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    height: 98,
    marginBottom: 16,
    overflow: 'hidden',
    paddingLeft: 16,
    paddingTop: 16,
    width: '48%' // Adjust for 2 columns with spacing
  },
  title: {
    ...gStyle.textSpotifyBold16,
    color: colors.white
  },
  image: {
    bottom: -10,
    height: 70,
    position: 'absolute',
    right: -10,
    transform: [{ rotate: '20deg' }],
    width: 70
  }
});

export default LineItemCategory;
