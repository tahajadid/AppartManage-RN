import Input from '@/components/Input';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { createRTLStyles } from '@/utils/rtlStyles';
import { useForgetPasswordViewModel } from '@/viewmodels/useForgetPasswordViewModel';
import { router } from 'expo-router';
import { CaretLeft, CaretRight } from 'phosphor-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const forgetPassword = () => {
  const {
    email,
    setEmail,
    loading,
    error,
    success,
    handleSendResetLink,
  } = useForgetPasswordViewModel();

  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const rtlStyles = createRTLStyles(isRTL);
  const insets = useSafeAreaInsets();

  // Use CaretRight for RTL (Arabic) and CaretLeft for LTR (English)
  const BackIcon = isRTL ? CaretRight : CaretLeft;
  
  return (
    <ScreenWrapper style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { direction: isRTL ? 'rtl' : 'ltr' }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
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
                  {t('forgetPasswordTitle')}
                </Typo>
              </TouchableOpacity>

              <Typo 
                size={18}
                color={colors.subtitleText}
                fontWeight="300"
                style={styles.subtitle}>
                {t('forgetPasswordDescription')}
              </Typo>



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

              {/* Success Message */}
              {success && (
                <View style={[styles.errorContainer, { backgroundColor: `${colors.green}20` }]}>
                  <Typo 
                    size={14}
                    color={colors.green}
                    style={styles.errorText}
                  >
                    {t('resetLinkSentMessage')}
                  </Typo>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        
        {/* Button Container - Fixed at Bottom */}
        <View style={[
          styles.buttonContainer, 
          { 
            paddingBottom: insets.bottom + spacingY._20,
            backgroundColor: colors.screenBackground,
          }
        ]}>
          <PrimaryButton 
            backgroundColor={colors.primary}
            onPress={handleSendResetLink}
            disabled={loading || !email.trim()}
            loading={loading}>
            <Typo 
              size={16}
              color={colors.white}
              fontWeight="600"
            >
              {loading ? t('sending') : t('sendResetLink')}
            </Typo>
          </PrimaryButton>
        </View>
      </View>

    </ScreenWrapper>
  );
}

export default forgetPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacingX._20,
    paddingBottom: spacingY._20,
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
    padding: spacingX._10,
    borderRadius: radius._8,
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
  buttonContainer: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._16,
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

