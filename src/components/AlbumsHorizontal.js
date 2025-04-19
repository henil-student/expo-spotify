import React from 'react';
import PropTypes from 'prop-types';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, gStyle } from '../constants';

// Default placeholder image
const placeholderImage = require('../assets/images/albums/placeholder.jpg');

const AlbumsHorizontal = ({ data, heading, onPress }) => {
  // Filter out items without a valid ID
  const validData = data.filter(item => item && item.id);

  return (
    <View style={styles.container}>
      {heading && <Text style={styles.heading}>{heading}</Text>}

      <FlatList
        contentContainerStyle={styles.containerContent}
        data={validData}
        horizontal
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={gStyle.activeOpacity}
            hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
            onPress={() => onPress(item.id)}
            style={styles.item}
          >
            <Image
              source={item.coverUrl ? { uri: item.coverUrl } : placeholderImage}
              style={styles.image}
            />
            <Text style={styles.title}>{item.title}</Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

AlbumsHorizontal.defaultProps = {
  heading: null
};

AlbumsHorizontal.propTypes = {
  // required
  data: PropTypes.array.isRequired,
  onPress: PropTypes.func.isRequired,

  // optional
  heading: PropTypes.string
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    width: '100%'
  },
  containerContent: {
    paddingLeft: 16
  },
  heading: {
    ...gStyle.textSpotifyBold18,
    color: colors.white,
    paddingBottom: 6,
    marginLeft: 16,
    marginBottom: 6,
  },
  item: {
    marginRight: 16,
    width: 148
  },
  image: {
    backgroundColor: colors.greyLight,
    height: 148,
    width: 148,
    marginBottom: 8,
  },
  title: {
    ...gStyle.textSpotifyBold12,
    color: colors.white,
    textAlign: 'center'
  }
});

export default AlbumsHorizontal;
