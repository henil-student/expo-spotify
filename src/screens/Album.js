import React, { useState, useEffect } from 'react'; // Removed useContext
import PropTypes from 'prop-types';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { colors, device, fonts, gStyle } from '../constants';
// Import the custom hook instead of PlayerContext directly
import { usePlayer } from '../context/PlayerContext'; 
import { api } from '../utils/api'; 

// components
import LinearGradient from '../components/LinearGradient';
import LineItemSong from '../components/LineItemSong';
import ScreenHeader from '../components/ScreenHeader';
import TouchIcon from '../components/TouchIcon';

const Album = ({ navigation, route }) => {
  const { albumId } = route.params; 

  // Use the custom hook to get context values
  // FIX: Destructure loadTrack instead of handleSongPress
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
        // Base URL is /api, route is /albums/:id
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

  // Handle song press - use the loadTrack function from the context hook
  const handleSongPress = (song) => {
    // Map the API song data to the structure expected by loadTrack (if different)
    // Based on PlayerContext, loadTrack seems to expect the whole track object.
    // Let's ensure the object we pass includes the necessary fields like id, title, previewUrl.
    const trackForContext = {
      id: song.id,
      title: song.title,
      artist: albumData?.artist?.name || 'Unknown Artist', 
      previewUrl: song.previewUrl, // Make sure this field name matches context expectation
      album: albumData?.title || 'Unknown Album',
      artwork: albumData?.coverUrl || null 
    };
    console.log('Loading track:', trackForContext);
    // Call the context function obtained from the hook
    loadTrack(trackForContext); 
    // Note: loadTrack might not automatically play, depending on its implementation.
    // We might need to call play() separately or modify loadTrack.
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

  return (
    <View style={gStyle.container}>
      <ScreenHeader navigation={navigation} title={title} showBack={true} />

      <FlatList
        contentContainerStyle={styles.containerFlatlist}
        data={songs || []} 
        keyExtractor={(item) => item.id.toString()} 
        ListHeaderComponent={
          <View style={styles.containerHeader}>
            <LinearGradient fill={coverUrl} height={200} /> 
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
            // Use currentTrack from the hook (context now uses currentTrack)
            active={currentTrack?.id === item.id} 
            downloaded={false} 
            explicit={false} // TODO: Check API for explicit flag
            imageUri={coverUrl} 
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
    marginBottom: 16
  },
  containerTitle: {
    ...gStyle.pH16,
    marginTop: 16
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
