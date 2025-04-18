import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors, gStyle } from '../constants';

class ErrorBoundary extends React.Component {
  state = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={[gStyle.container, styles.center]}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={this.handleRetry}
            activeOpacity={gStyle.activeOpacity}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  errorTitle: {
    ...gStyle.textSpotifyBold20,
    color: colors.white,
    marginBottom: 16
  },
  errorMessage: {
    ...gStyle.textSpotify16,
    color: colors.greyInactive,
    textAlign: 'center',
    marginBottom: 24
  },
  retryButton: {
    backgroundColor: colors.brandPrimary,
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 12
  },
  retryButtonText: {
    ...gStyle.textSpotifyBold16,
    color: colors.white
  }
});

export default ErrorBoundary;
