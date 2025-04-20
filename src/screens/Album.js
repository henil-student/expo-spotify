import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View, Image } from 'react-native';
// Import func to access formatTime
import { colors, device, fonts, gStyle, func } from '../constants';
import { usePlayer } from '../context/PlayerContext'; 
import { api } from '../utils/api'; 

// components
import LineItemSong from '../components/LineItemSong';
import ScreenHeader from '../components/ScreenHeader';

// Default placeholder image
const placeholderImage = require('../assets/images/albums/placeholder.jpg');

const Album = ({ navigation, route }) => {
  const { albumId } = route.params; 

  // Get context functions including the updated loadTrack
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
        
        // Add more robust check for expected data structure
        if (response.data && response.data.id && Array.isArray(response.data.songs)) {
           setAlbumData(response.data);
        } else {
           console.error('Invalid data structure received:', response.data);
           throw new Error('Invalid data structure received from API');
        }

      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch album data';
        console.error('API Error fetching album:', err);
        setError(errorMessage);
        Alert.alert('Error', errorMessage); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbumData();
  }, [albumId]); 

  // Handle song press - pass track, queue, and index to loadTrack
  const handleSongPress = (song, index) => {
    // Ensure albumData and songs exist before proceeding
    if (!albumData || !albumData.songs) {
        console.error("Album data or songs not available for handleSongPress");
        return;
    }

    // Map the entire album song list to the format expected by the context
    const trackQueue = albumData.songs.map(s => ({
      id: s.id,
      title: s.title,
      artist: albumData?.artist?.name || 'Unknown Artist', 
      previewUrl: s.previewUrl, 
      album: albumData?.title || 'Unknown Album',
      artwork: albumData?.coverUrl || null 
    }));

    // Get the specific track object for the pressed song (already mapped)
    const selectedTrack = trackQueue[index]; 

    if (!selectedTrack) {
        console.error(`Could not find selected track at index ${index}`);
        return;
    }

    console.log(`Loading track at index ${index}:`, selectedTrack);
    console.log('Passing queue:', trackQueue);

    // Call the updated context function with track, queue, and index
    loadTrack(selectedTrack, trackQueue, index); 
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
            <Image 
              source={imageSource} 
              style={styles.albumCover} 
              resizeMode="cover" 
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
            imageUri={coverUrl} 
            onPress={() => handleSongPress(item, index)}
            songData={{
              album: title,
              artist: artist?.name || 'Unknown Artist',
              length: func.formatTime(item.duration), // Format the duration before passing
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
    alignItems: 'center', 
  },
  albumCover: {
    width: 200, 
    height: 200,
    marginBottom: 16, 
  },
  containerTitle: {
    ...gStyle.pH16,
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
