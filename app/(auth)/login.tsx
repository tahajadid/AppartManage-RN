import Input from '@/components/Input';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { createRTLStyles } from '@/utils/rtlStyles';
import { useLoginViewModel } from '@/viewmodels/useLoginViewModel';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform, Pressable, ScrollView,
  StyleSheet,
  View
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

  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const rtlStyles = createRTLStyles(isRTL);


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

              <Typo 
                size={26}
                color={colors.text}
                style={styles.title}
              >
                {t('welcome')}
              </Typo>
              <Typo 
                size={16}
                color={colors.text}
                style={styles.subtitle}
              >
                {t('signInToContinue')}
              </Typo>

            <View style={[styles.formContainer, {backgroundColor: colors.loginBackground}]}>
            
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Typo 
                  size={14}
                  color={colors.text}
                  fontWeight="600"
                  style={styles.label}
                >
                  {t('email')}
                </Typo>
                <Input
                  containerStyle={{ borderColor: colors.neutral200 }}
                  inputStyle={rtlStyles.input()}
                  placeholderTextColor={colors.neutral400}
                  placeholder={t('enterEmail')} 
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
                <Typo 
                  size={14}
                  color={colors.text}
                  style={styles.label}
                >
                  {t('password')}
                </Typo>
                <Input
                  containerStyle={{ borderColor: colors.neutral200 }}
                  inputStyle={rtlStyles.input()}
                  placeholder={t('enterPassword')}
                  value={password}
                  placeholderTextColor={colors.neutral400}
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
                  <Typo 
                    size={14}
                    color={colors.redClose}
                    style={styles.errorText}
                  >
                    {error}
                  </Typo>
                </View>
              )}

            {/* Login Button */}
            <PrimaryButton 
              style={styles.loginButton}
              backgroundColor={colors.primary}
              onPress={handleEmailLogin}
              loading={loading}
              disabled={loading}
            >
              <Typo 
                  size={16}
                  color={colors.screenBackground}
                  fontWeight="600">
                  {loading ? t('signingIn') : t('signIn')}
              </Typo>
            </PrimaryButton>

            {/* go to register button  */}
            <View style={styles.footer}>
                <Typo 
                  size={14}
                  color={colors.text}
                  style={styles.footerText}
                >
                    {t('haveAnAccount')}
                </Typo>
                <Pressable onPress={() => router.push("/(auth)/register")}>
                    <Typo 
                      size={14}
                      color={colors.primary}
                      style={styles.underlinedText}
                    >
                        {t("go_register")}
                    </Typo>
                </Pressable>
            </View>

          </View>

            {/* Divider */}
            <View style={[styles.dividerContainer, { backgroundColor: colors.neutral600 }]}>
            </View>

            <Typo 
                  size={14}
                  color={colors.text}
                  style={styles.registerWithGoogle}
                >
                    {t('loginWithGooglrAccount')}
                </Typo>

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

export default login;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacingX._20,
  },
  formContainer:{
    padding: spacingX._20,
    elevation: 1,
    borderRadius: radius._10,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    marginBottom: spacingY._10,
    textAlign: 'left',
  },
  subtitle: {
    marginBottom: spacingY._32,
    opacity: 0.7,
    textAlign: 'left',
  },
  inputContainer: {
    marginBottom: spacingY._16,
  },
  label: {
    marginBottom: spacingY._10,
    textAlign: 'left',
  },
  errorContainer: {
    marginBottom: spacingY._8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'left',
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
    height: 60,
  },
  buttonText: {
    // Typo component handles color, fontSize, and fontWeight
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
    marginTop: spacingY._16,
    },
  footerText: {
      textAlign:"center",
  },
  registerWithGoogle: {
    marginBottom: spacingY._16,
    textAlign:"left",
  },
  underlinedText: {
    textDecorationLine: "underline",
  },
});

