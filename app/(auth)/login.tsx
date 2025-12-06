import Typo from '@/components/Typo';
import useThemeColors from '@/contexts/useThemeColors';
import { useLoginViewModel } from '@/viewmodels/useLoginViewModel';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity, View
} from 'react-native';

const login = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    handleEmailLogin,
    handleGoogleSignIn,
  } = useLoginViewModel();

  const colors = useThemeColors();

  
  const backgroundColor = colors.screenBackground
  const textColor = colors.neutral300
  const tintColor = colors.neutral100

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Typo  style={styles.title}>
            Welcome
          </Typo>
          <Typo style={styles.subtitle}>
            Sign in to continue
          </Typo>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Typo style={styles.label}>Email</Typo>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: tintColor }]}
              placeholder="Enter your email"
              placeholderTextColor={textColor + '80'}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!loading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Typo style={styles.label}>Password</Typo>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: tintColor }]}
              placeholder="Enter your password"
              placeholderTextColor={textColor + '80'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              editable={!loading}
            />
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Typo style={styles.errorText}>
                {error}
              </Typo>
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, styles.loginButton, { backgroundColor: tintColor }]}
            onPress={handleEmailLogin}
            disabled={loading}
          >
            <Typo style={styles.buttonText}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Typo>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
          </View>

          {/* Google Sign-In Button */}
          <View style={styles.googleButtonContainer}>
            <GoogleSigninButton
              style={styles.googleButton}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Light}
              onPress={handleGoogleSignIn}
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2036FF"
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButton: {
    marginTop: 8,
  },
  googleButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  googleButton: {
    width: '100%',
    height: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    opacity: 0.6,
  },
});

