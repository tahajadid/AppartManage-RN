import OnBoardingHeader from '@/components/OnBoardingHeader';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle } from 'phosphor-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SyndicSuccessSetup() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    joinCode: string;
    apartmentName: string;
  }>();

  const joinCode = params.joinCode || '';
  const apartmentName = params.apartmentName || '';

  const handleGoToHome = () => {
    router.replace('/(home)');
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header */}
        <OnBoardingHeader 
          title={t('apartmentCreated')}
          headerLeft={false}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Success Icon */}
            <View style={styles.iconContainer}>
              <CheckCircle size={80} color={colors.primary} weight="fill" />
            </View>

            {/* Success Message */}
            <Typo 
              size={24}
              color={colors.text}
              fontWeight="700"
              style={styles.title}
            >
              {t('apartmentCreatedSuccess')}
            </Typo>

            <Typo 
              size={16}
              color={colors.subtitleText}
              fontWeight="400"
              style={styles.message}
            >
              {t('apartmentCreatedMessage').replace('{{apartmentName}}', apartmentName)}
            </Typo>

            {/* Join Code Display */}
            <View style={styles.codeContainer}>
              <Typo 
                size={14}
                color={colors.subtitleText}
                fontWeight="400"
                style={styles.codeLabel}
              >
                {t('yourJoinCode')}
              </Typo>
              <View style={[styles.codeBox, { backgroundColor: colors.neutral800, borderColor: colors.primary }]}>
                <Typo 
                  size={32}
                  color={colors.primary}
                  fontWeight="700"
                  style={styles.codeText}
                >
                  {joinCode}
                </Typo>
              </View>
              <Typo 
                size={12}
                color={colors.neutral400}
                fontWeight="400"
                style={styles.codeHint}
              >
                {t('shareCodeWithResidents')}
              </Typo>
            </View>
          </View>
        </ScrollView>

        {/* Go to Home Button at bottom */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacingY._24) }]}>
          <PrimaryButton
            style={styles.homeButton}
            backgroundColor={colors.primary}
            onPress={handleGoToHome}
          >
            <Typo 
              size={16}
              color={colors.screenBackground}
              fontWeight="600"
            >
              {t('goToHome')}
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacingY._24,
  },
  title: {
    marginBottom: spacingY._12,
    textAlign: 'center',
  },
  message: {
    marginBottom: spacingY._32,
    textAlign: 'center',
  },
  codeContainer: {
    width: '100%',
    alignItems: 'center',
  },
  codeLabel: {
    marginBottom: spacingY._12,
    textAlign: 'center',
  },
  codeBox: {
    width: '100%',
    paddingVertical: spacingY._20,
    paddingHorizontal: spacingX._20,
    borderRadius: radius._12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacingY._12,
  },
  codeText: {
    letterSpacing: 4,
    textAlign: 'center',
  },
  codeHint: {
    textAlign: 'center',
  },
  footer: {
    paddingTop: spacingY._16,
  },
  homeButton: {
    height: 50,
    marginBottom: spacingY._24,
    borderRadius: radius._8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

