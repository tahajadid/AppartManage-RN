import Input from '@/components/Input';
import OnBoardingHeader from '@/components/OnBoardingHeader';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { completeOnboarding } from '@/services/onboardingService';
import { createRTLStyles } from '@/utils/rtlStyles';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ResidentSetupScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { refreshOnboardingStatus } = useOnboarding();
  const insets = useSafeAreaInsets();
  const rtlStyles = createRTLStyles(isRTL);

  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    router.push('/(onboarding)/choose-role');
  };

  const handleComplete = async () => {
    // Validation
    if (!joinCode.trim()) {
      setError(t('joinCodeRequired'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await completeOnboarding({
        role: 'resident',
        joinCode: joinCode.trim(),
      });

      if (result.error) {
        setError(result.error);
      } else {
        // Refresh onboarding status and navigate to home
        await refreshOnboardingStatus();
        router.replace('/(home)');
      }
    } catch (err: any) {
      console.log('Onboarding completion error:', err);
      setError(t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header with back button and title */}
        <OnBoardingHeader 
          title={t('joinApartment')}
          onBack={handleBack}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <Typo 
                size={18}
                color={colors.subtitleText}
                fontWeight="300"
                style={styles.subtitle}
              >
                {t('joinApartmentDescription')}
              </Typo>

            {/* Join Code Input */}
            <View style={styles.inputContainer}>
              <Typo 
                size={14}
                color={colors.primary}
                fontWeight="600"
                style={styles.label}
              >
                {t('joinCode')}
              </Typo>
              <Input
                containerStyle={{ borderColor: colors.primary }}
                inputStyle={rtlStyles.input()}
                placeholderTextColor={colors.neutral400}
                placeholder={t('joinCodePlaceholder')}
                value={joinCode}
                onChangeText={(text) => setJoinCode(text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                autoCapitalize="characters"
                maxLength={8}
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
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Join Button at bottom */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacingY._24) }]}>
          <PrimaryButton
            style={styles.joinButton}
            backgroundColor={colors.primary}
            onPress={handleComplete}
            loading={loading}
            disabled={loading}
          >
            <Typo 
              size={16}
              color={colors.screenBackground}
              fontWeight="600"
            >
              {loading ? t('joining') : t('join')}
            </Typo>
          </PrimaryButton>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: spacingX._20,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    width: '100%',
    maxWidth: 400,
  },
  subtitle: {
    marginBottom: spacingY._32,
    textAlign: 'left',
  },
  inputContainer: {
    marginBottom: spacingY._16,
  },
  label: {
    marginBottom: spacingY._10,
  },
  errorContainer: {
    marginBottom: spacingY._16,
  },
  errorText: {
    textAlign: 'left',
  },
  footer: {
    paddingTop: spacingY._16,
  },
  joinButton: {
    height: 50,
    marginBottom: spacingY._24,
    borderRadius: radius._8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

