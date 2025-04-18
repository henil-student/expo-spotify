import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { colors, gStyle } from '../constants';
import { LOADING_STATES, LOADING_MESSAGES } from '../constants/loading';
import { apiService } from '../utils/api';
import { validateLoginData } from '../utils/validation';

// components
import FormInput from '../components/FormInput';
import ScreenHeader from '../components/ScreenHeader';
import KeyboardAwareView from '../components/KeyboardAwareView';
import AuthButton from '../components/AuthButton';
import AuthLink from '../components/AuthLink';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const passwordInputRef = useRef();
  const { login } = useAuth();
  const { showToast } = useToast();
  const { loadingState } = useAuth();

  const isProcessing = isLoading || loadingState !== LOADING_STATES.NONE;

  const handleLogin = async () => {
    const validationError = validateLoginData({ email, password });
    if (validationError) {
      showToast(validationError);
      return;
    }

    try {
      setIsLoading(true);
      const data = await apiService.auth.login(email, password);
      await login(data.user, data.token);
    } catch (error) {
      showToast(error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareView>
      <View style={styles.containerHeader}>
        <ScreenHeader title="Login" />
      </View>

      <View style={styles.content}>
        <Text style={[gStyle.textSpotifyBold24, styles.title]}>
          Log in to continue
        </Text>

        <FormInput
          placeholder="Email"
          onChangeText={setEmail}
          value={email}
          keyboardType="email-address"
          autoCompleteType="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          blurOnSubmit={false}
          editable={!isProcessing}
        />

        <FormInput
          ref={passwordInputRef}
          placeholder="Password"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
          autoCompleteType="password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleLogin}
          blurOnSubmit={true}
          editable={!isProcessing}
        />

        <AuthButton
          onPress={handleLogin}
          disabled={isProcessing}
          title={loadingState === LOADING_STATES.LOGIN ? LOADING_MESSAGES.LOGGING_IN : 'Log In'}
        />

        <AuthLink
          onPress={() => navigation.navigate('Signup')}
          disabled={isProcessing}
          text="Don't have an account?"
          linkText="Sign up"
        />
      </View>
    </KeyboardAwareView>
  );
};

const styles = StyleSheet.create({
  containerHeader: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 10
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  title: {
    color: colors.white,
    marginBottom: 32,
    textAlign: 'center'
  }
});

export default Login;
