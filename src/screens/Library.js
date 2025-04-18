import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, gStyle } from '../constants';
import { LOADING_STATES } from '../constants/loading';
import AuthButton from '../components/AuthButton';

const Library = () => {
  const { logout, loadingState } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={[gStyle.container, styles.container]}>
      <Text style={[gStyle.textSpotifyBold24, styles.title]}>
        Library
      </Text>

      <View style={styles.content}>
        <AuthButton
          onPress={handleLogout}
          disabled={loadingState !== LOADING_STATES.NONE}
          title={loadingState === LOADING_STATES.LOGOUT ? 'Logging out...' : 'Logout'}
          variant="secondary"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 24
  },
  title: {
    color: colors.white,
    marginBottom: 32
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  }
});

export default Library;
