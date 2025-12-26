import Input from '@/components/Input';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { createRTLStyles } from '@/utils/rtlStyles';
import { useRegisterViewModel } from '@/viewmodels/useRegisterViewModel';
import { router } from 'expo-router';
import { CaretLeft, CaretRight } from 'phosphor-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform, Pressable, ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

const register = () => {
  const {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    phoneNumber,
    setPhoneNumber,
    loading,
    error,
    handleRegister,
    handleGoogleSignIn,
  } = useRegisterViewModel();

  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const rtlStyles = createRTLStyles(isRTL);

  const textColor = colors.text;
  const tintColor = colors.neutral100;
  // Use CaretRight for RTL (Arabic) and CaretLeft for LTR (English)
  const BackIcon = isRTL ? CaretRight : CaretLeft;
  
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
              style={[styles.content, { direction: isRTL ? 'rtl' : 'ltr' }]}>

              <TouchableOpacity 
              onPress={() => router.back()}
              style={{flexDirection: 'row', alignItems: 'center', gap: spacingX._16}}>

                <BackIcon size={14} color={colors.white} 
                style={{backgroundColor: colors.primary, padding: spacingY._16,
                  borderRadius: radius._8,
                }} />
                
                <Typo 
                  size={26}
                  color={colors.primary}
                  style={styles.title}>

                  {t('CreateAccount')}
                </Typo>

              </TouchableOpacity>

              <Typo 
                size={18}
                color={colors.subtitleText}
                fontWeight="300"
                style={styles.subtitle}>
                {t('enterInformationDescription')}
              </Typo>

              {/* Full Name Input */}
              <View style={styles.inputContainer}>
                <Typo 
                  size={14}
                  color={colors.primary}
                  fontWeight="600"
                  style={styles.label}
                >
                  {t('fullName')}
                </Typo>
                <Input
                  containerStyle={{ borderColor: colors.primary }}
                  inputStyle={rtlStyles.input()}
                  placeholderTextColor={colors.neutral500}
                  placeholder={t('fullNamePlaceholder')}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Typo 
                  size={14}
                  color={colors.primary}
                  fontWeight="600"
                  style={styles.label}
                >
                  {t('email')}
                </Typo>
                <Input
                  containerStyle={{ borderColor: colors.primary }}
                  inputStyle={rtlStyles.input()}
                  placeholderTextColor={colors.neutral500}
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
                  color={colors.primary}
                  fontWeight="600"
                  style={styles.label}
                >
                  {t('password')}
                </Typo>
                <Input
                  containerStyle={{ borderColor: colors.primary }}
                  inputStyle={rtlStyles.input()}
                  placeholder={t('enterPassword')}
                  value={password}
                  placeholderTextColor={colors.neutral500}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password"
                  editable={!loading}
                />
              </View>

              {/* Re-enter Password Input */}
              <View style={styles.inputContainer}>
                <Typo 
                  size={14}
                  color={colors.primary}
                  fontWeight="600"
                  style={styles.label}
                >
                  {t('confirmPassword')}
                </Typo>
                <Input
                  containerStyle={{ borderColor: colors.primary }}
                  inputStyle={rtlStyles.input()}
                  placeholder={t('confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  placeholderTextColor={colors.neutral500}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password"
                  editable={!loading}
                />
              </View>

              {/* Phone Number (Optional) */}
              <View style={styles.inputContainer}>
                <Typo 
                  size={14}
                  color={colors.primary}
                  style={styles.label}
                >
                  {t('phoneNumber')} {t('optional')}
                </Typo>
                <Input
                  containerStyle={{ borderColor: colors.primary }}
                  inputStyle={rtlStyles.input()}
                  placeholder={t('phoneNumberPlaceholder')}
                  value={phoneNumber}
                  placeholderTextColor={colors.neutral500}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  autoComplete="tel"
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

            {/* Register Button */}
            <PrimaryButton 
              style={styles.loginButton}
              backgroundColor={colors.primary}
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
            >
              <Typo 
                size={16}
                color={colors.white}
                fontWeight="600"
              >
                {loading ? t('registering') : t('register')}
              </Typo>
            </PrimaryButton>

            {/* Login link */}
            <View style={styles.footer}>
                <Typo 
                  size={14}
                  color={colors.text}
                  style={styles.footerText}
                >
                    {t('alreadyHaveAccount')}
                </Typo>
                <Pressable onPress={() => router.push("/(auth)/login")}>
                    <Typo 
                      size={14}
                      color={colors.primary}
                      style={styles.underlinedText}
                    >
                        {t("signIn")}
                    </Typo>
                </Pressable>
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
    marginTop:spacingY._8,
    marginBottom: spacingY._10,
    textAlign: 'left',
  },
  subtitle: {
    marginTop: spacingY._8,
    marginBottom: spacingY._16,
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
    marginBottom: spacingY._16,
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
    height: 80,
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

