import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, fonts, gStyle } from '../constants';

const placeholderImage = require('../assets/images/albums/placeholder.jpg');

const LineItemSong = ({
  active,
  downloaded,
  explicit,
  imageUri,
  onPress,
  songData: { album, artist, length, title }
}) => {
  const imageSource = imageUri ? { uri: imageUri } : placeholderImage;
  const songColor = active ? colors.brandPrimary : colors.white;

  const explicitIcon = explicit ? (
    <Icon name="alpha-e-box" size={16} color={colors.greyInactive} style={styles.iconExplicit} />
  ) : null;
  const downloadIcon = downloaded ? (
     <Icon name="arrow-down-circle" size={16} color={colors.brandPrimary} style={styles.iconDownloaded} />
  ) : null;

  return (
    <TouchableOpacity
      activeOpacity={gStyle.activeOpacity}
      onPress={onPress}
      style={styles.container}
    >
      <Image source={imageSource} style={styles.image} />

      <View style={styles.containerSong}>
        <Text style={[styles.title, { color: songColor }]} numberOfLines={1}>{title}</Text>
        <View style={gStyle.flexRowCenterAlign}>
          {explicitIcon}{downloadIcon}<Text style={styles.artist} numberOfLines={1}>{artist}</Text>
        </View>
      </View>

      {length && (
        <View style={styles.containerLength}>
          <Text style={styles.length}>{length}</Text>
        </View>
      )}

      <TouchableOpacity
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        onPress={() => { console.log(`More options for ${title}`); }}
        style={styles.containerMore}
      >
        <Icon name="dots-horizontal" size={24} color={colors.greyInactive} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

LineItemSong.propTypes = {
  active: PropTypes.bool,
  downloaded: PropTypes.bool,
  explicit: PropTypes.bool,
  imageUri: PropTypes.string,
  onPress: PropTypes.func.isRequired,
  songData: PropTypes.shape({
    album: PropTypes.string,
    artist: PropTypes.string.isRequired,
    length: PropTypes.string, // Changed from number to string
    title: PropTypes.string.isRequired
  }).isRequired
};

LineItemSong.defaultProps = {
  active: false,
  downloaded: false,
  explicit: false,
  imageUri: null
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '100%',
  },
  image: {
    width: 48,
    height: 48,
    marginRight: 16,
  },
  containerSong: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    ...gStyle.textSpotify16,
    marginBottom: 4,
  },
  artist: {
    ...gStyle.textSpotify12,
    color: colors.greyInactive,
  },
  iconExplicit: {
    marginRight: 4,
  },
  iconDownloaded: {
     marginRight: 4,
  },
  containerLength: {
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  length: {
    ...gStyle.textSpotify12,
    color: colors.greyInactive,
  },
  containerMore: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  }
});

export default LineItemSong;
