import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { colors, gStyle } from '../constants';
import { LOADING_STATES, LOADING_MESSAGES } from '../constants/loading';
import { apiService } from '../utils/api';
import { validateSignupData } from '../utils/validation';

// components
import FormInput from '../components/FormInput';
import ScreenHeader from '../components/ScreenHeader';
import KeyboardAwareView from '../components/KeyboardAwareView';
import AuthButton from '../components/AuthButton';
import AuthLink from '../components/AuthLink';

const Signup = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const emailInputRef = useRef();
  const passwordInputRef = useRef();

  const { login } = useAuth();
  const { showToast } = useToast();
  const { loadingState } = useAuth();

  const isProcessing = isLoading || loadingState !== LOADING_STATES.NONE;

  const handleSignup = async () => {
    const validationError = validateSignupData({ name, email, password });
    if (validationError) {
      showToast(validationError);
      return;
    }

    try {
      setIsLoading(true);
      const data = await apiService.auth.signup(name, email, password);
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
        <ScreenHeader title="Sign Up" />
      </View>

      <View style={styles.content}>
        <Text style={[gStyle.textSpotifyBold24, styles.title]}>
          Create your account
        </Text>

        <FormInput
          placeholder="Name"
          onChangeText={setName}
          value={name}
          autoCapitalize="words"
          returnKeyType="next"
          onSubmitEditing={() => emailInputRef.current?.focus()}
          blurOnSubmit={false}
          editable={!isProcessing}
        />

        <FormInput
          ref={emailInputRef}
          placeholder="Email"
          onChangeText={setEmail}
          value={email}
          keyboardType="email-address"
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
          returnKeyType="go"
          onSubmitEditing={handleSignup}
          blurOnSubmit={true}
          editable={!isProcessing}
        />

        <AuthButton
          onPress={handleSignup}
          disabled={isProcessing}
          title={loadingState === LOADING_STATES.SIGNUP ? LOADING_MESSAGES.SIGNING_UP : 'Sign Up'}
        />

        <AuthLink
          onPress={() => navigation.navigate('Login')}
          disabled={isProcessing}
          text="Already have an account?"
          linkText="Log in"
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

export default Signup;
