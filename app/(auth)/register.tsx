import LanguageSwitcher from '@/components/LanguageSwitcher';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { useFontFamily } from '@/hooks/fonts';
import { createRTLStyles } from '@/utils/rtlStyles';
import { useLoginViewModel } from '@/viewmodels/useLoginViewModel';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const register = () => {
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

  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const rtlStyles = createRTLStyles(isRTL);
  const fontFamily = useFontFamily();

  const textColor = colors.neutral300;
  const tintColor = colors.neutral100;

  return (
    <ScreenWrapper style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { direction: isRTL ? 'rtl' : 'ltr' }]}
            keyboardShouldPersistTaps="handled"
          >
            <View 
              style={[styles.content, { direction: isRTL ? 'rtl' : 'ltr' }]}
            >
              {/* Language Switcher */}
              <LanguageSwitcher />

              <Text style={[styles.title, { 
                textAlign: 'left',
                color: textColor,
                width: '100%',
                fontFamily
              }]}>
                {t('welcome')}
              </Text>
              <Text style={[styles.subtitle, { 
                textAlign: 'left',
                color: textColor,
                width: '100%',
                fontFamily
              }]}>
                {t('signInToContinue')}
              </Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { 
                  textAlign: 'left',
                  color: textColor,
                  width: '100%',
                  fontFamily
                }]}>
                  {t('email')}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    rtlStyles.input(),
                    { color: textColor, borderColor: tintColor, fontFamily }
                  ]}
                  placeholder={t('enterEmail')}
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
                <Text style={[styles.label, { 
                  textAlign: 'left',
                  color: textColor,
                  width: '100%',
                  fontFamily
                }]}>
                  {t('password')}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    rtlStyles.input(),
                    { color: textColor, borderColor: tintColor, fontFamily }
                  ]}
                  placeholder={t('enterPassword')}
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
                  {loading ? t('signingIn') : t('signIn')}
                </Typo>
              </TouchableOpacity>



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
      </View>

    </ScreenWrapper>
  );
}

export default register;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacingX._20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    marginBottom: spacingY._10,
  },
  subtitle: {
    marginBottom: spacingY._32,
    opacity: 0.7,
  },
  inputContainer: {
    marginBottom: spacingY._16,
  },
  label: {
    marginBottom: spacingY._10,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderWidth: spacingX._1,
    borderRadius: radius._8,
    paddingHorizontal: spacingX._16,
    fontSize: 16,
  },
  errorContainer: {
    marginTop: spacingY._8,
    marginBottom: spacingY._16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    height: 50,
    borderRadius: radius._8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacingY._12,
  },
  loginButton: {
    marginTop: 8,
  },
  googleButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacingY._12,
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
    height: spacingX._1,
    marginVertical: spacingY._24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacingX._16,
    fontSize: 14,
    opacity: 0.6,
  },
  footer: { 
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    alignItems: "center",
    },
    footerText: {
        textAlign:"center",
        fontSize: 16
    },
    underlinedText: {
        textDecorationLine: "underline",
        fontSize: 16
    },
});

