import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View, Image } from 'react-native'; // Import Image
import { colors, device, fonts, gStyle } from '../constants';
import { usePlayer } from '../context/PlayerContext'; 
import { api } from '../utils/api'; 

// components
// import LinearGradient from '../components/LinearGradient'; // Remove LinearGradient import
import LineItemSong from '../components/LineItemSong';
import ScreenHeader from '../components/ScreenHeader';
// Removed TouchIcon import as it's not used here

// Default placeholder image
const placeholderImage = require('../assets/images/albums/placeholder.jpg');

const Album = ({ navigation, route }) => {
  const { albumId } = route.params; 

  const { currentTrack, loadTrack } = usePlayer(); 

  const [albumData, setAlbumData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlbumData = async () => {
      if (!albumId) {
        setError('Album ID is missing');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      setAlbumData(null); 

      try {
        const response = await api.get(`/albums/${albumId}`); 
        console.log('API Response:', response.data); 
        
        if (response.data && response.data.id && response.data.songs) {
           setAlbumData(response.data);
        } else {
           throw new Error('Invalid data structure received from API');
        }

      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch album data';
        console.error('API Error:', err);
        console.error('API Error Details:', JSON.stringify(err)); 
        setError(errorMessage);
        Alert.alert('Error', errorMessage); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbumData();
  }, [albumId]); 

  const handleSongPress = (song) => {
    const trackForContext = {
      id: song.id,
      title: song.title,
      artist: albumData?.artist?.name || 'Unknown Artist', 
      previewUrl: song.previewUrl, 
      album: albumData?.title || 'Unknown Album',
      artwork: albumData?.coverUrl || null 
    };
    console.log('Loading track:', trackForContext);
    loadTrack(trackForContext); 
  };

  if (isLoading) {
    return (
      <View style={[gStyle.container, gStyle.flexCenter]}>
        <ActivityIndicator color={colors.white} />
      </View>
    );
  }

  if (error || !albumData) {
    return (
      <View style={[gStyle.container, gStyle.flexCenter, { padding: 20 }]}>
         <ScreenHeader navigation={navigation} title="Error" showBack={true} />
         <Text style={{ color: colors.white, textAlign: 'center', marginTop: 20 }}>
           {error || 'Could not load album data.'}
         </Text>
      </View>
    );
  }

  const { title, artist, coverUrl, songs } = albumData; 
  // Determine image source, use placeholder if coverUrl is missing
  const imageSource = coverUrl ? { uri: coverUrl } : placeholderImage;

  return (
    <View style={gStyle.container}>
      <ScreenHeader navigation={navigation} title={title} showBack={true} />

      <FlatList
        contentContainerStyle={styles.containerFlatlist}
        data={songs || []} 
        keyExtractor={(item) => item.id.toString()} 
        ListHeaderComponent={
          <View style={styles.containerHeader}>
            {/* FIX: Replace LinearGradient with Image */}
            <Image 
              source={imageSource} 
              style={styles.albumCover} 
              resizeMode="cover" // Ensure image covers the area
            />
            <View style={styles.containerTitle}>
              <Text ellipsizeMode="tail" numberOfLines={1} style={styles.title}>
                {title} 
              </Text>
            </View>
            <View style={styles.containerArtist}>
              <Text style={styles.artist}>Album by {artist?.name || 'Unknown Artist'}</Text> 
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <LineItemSong
            active={currentTrack?.id === item.id} 
            downloaded={false} 
            explicit={false} 
            // Pass the correct image source for list items
            imageUri={coverUrl} // LineItemSong expects a URI string or null
            onPress={() => handleSongPress(item)} 
            songData={{
              album: title,
              artist: artist?.name || 'Unknown Artist',
              length: item.duration, 
              title: item.title 
            }}
          />
        )}
      />
    </View>
  );
};

Album.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  containerHeader: {
    marginBottom: 16,
    alignItems: 'center', // Center header content horizontally
  },
  albumCover: {
    width: 200, // Define size for the album cover image
    height: 200,
    marginBottom: 16, // Add space below the image
  },
  containerTitle: {
    ...gStyle.pH16,
    // Removed marginTop as spacing is handled by albumCover marginBottom
  },
  title: {
    color: colors.white,
    fontFamily: fonts.spotifyBold,
    fontSize: 24,
    textAlign: 'center'
  },
  containerArtist: {
    ...gStyle.pH16,
    marginBottom: 8,
    marginTop: 4
  },
  artist: {
    color: colors.greyInactive,
    fontFamily: fonts.spotifyRegular,
    fontSize: 16,
    textAlign: 'center'
  },
  containerFlatlist: {
    paddingBottom: device.web ? 0 : 178 
  }
});

export default Album;
