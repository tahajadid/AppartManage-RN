import LanguageSelectionModal from '@/components/appSettings/LanguageSelectionModal';
import Input from '@/components/Input';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useRTL } from '@/contexts/RTLContext';
import { useTheme } from '@/contexts/themeContext';
import useThemeColors from '@/contexts/useThemeColors';
import { createRTLStyles } from '@/utils/rtlStyles';
import { useLoginViewModel } from '@/viewmodels/useLoginViewModel';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';
import { Globe, Moon, Sun } from 'phosphor-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform, Pressable, ScrollView,
  StyleSheet,
  TouchableOpacity,
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
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const { currentLanguage, changeLanguage } = useRTL();
  const { theme, setMode } = useTheme();

  const handleLanguageSelect = async (langCode: 'en' | 'ar' | 'fr') => {
    await changeLanguage(langCode);
    setLanguageModalVisible(false);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setMode(newTheme);
  };

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
              
              {/* Language and Theme Selector Row */}
              <View style={styles.selectorRow}>
                <TouchableOpacity
                  onPress={() => setLanguageModalVisible(true)}
                  style={[styles.languageSelector,{ direction: isRTL ? 'rtl' : 'ltr',
                    backgroundColor: colors.neutral800}]}>
                    <Globe size={20} color={colors.primary} weight="regular" />
                    <Typo size={14} color={colors.primary} fontWeight="700">
                      {t('language')}
                    </Typo>
                </TouchableOpacity>

                {/* Theme Switcher */}
                <View style={[styles.themeSwitcher, { backgroundColor: colors.neutral800 }]}>
                  <TouchableOpacity
                    onPress={() => handleThemeChange('light')}
                    style={[
                      styles.themeIconButton,
                      theme === 'light' && { backgroundColor: colors.primary + '20' }
                    ]}
                    activeOpacity={0.7}
                  >
                    <Sun 
                      size={20} 
                      color={theme === 'light' ? colors.primary : colors.subtitleText} 
                      weight={theme === 'light' ? 'fill' : 'regular'} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleThemeChange('dark')}
                    style={[
                      styles.themeIconButton,
                      theme === 'dark' && { backgroundColor: colors.primary + '20' }
                    ]}
                    activeOpacity={0.7}
                  >
                    <Moon 
                      size={20} 
                      color={theme === 'dark' ? colors.primary : colors.subtitleText} 
                      weight={theme === 'dark' ? 'fill' : 'regular'} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

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

              {/* Forgot Password Button */}
              <Pressable onPress={() => router.push("/(auth)/forget-password")}>
                <Typo 
                      size={14}
                      color={colors.primary}
                      style={styles.forgotPasswordText}
                    >
                        {t("forgetPassword")}
                    </Typo>
                </Pressable>

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
                  color={colors.white}
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
            <View style={[styles.dividerContainer, { backgroundColor: colors.neutral600 }]}/>

            <Typo 
                size={16}
                color={colors.text}
                style={styles.registerWithGoogle}>
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

      {/* Language Selection Modal */}
      <LanguageSelectionModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
        onLanguageSelect={handleLanguageSelect}
      />
      
    </ScreenWrapper>
  );
}

export default login;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingY._24,
    width: '100%',
  },
  themeSwitcher: {
    flexDirection: 'row',
    borderRadius: radius._8,
    padding: spacingX._5,
    gap: spacingX._5
  },
  themeIconButton: {
    width: 36,
    height: 36,
    borderRadius: radius._8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacingX._20,
  },
  languageSelector: {
    padding: spacingX._10,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius._8,
    gap: spacingX._8,
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
  forgotPasswordText: {
    textDecorationLine: "underline",
    textAlign: "right",
    marginBottom: spacingY._8,
  },
});

