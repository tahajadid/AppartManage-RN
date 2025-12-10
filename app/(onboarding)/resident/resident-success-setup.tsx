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

export default function ResidentSuccessSetup() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    apartmentName: string;
  }>();

  const apartmentName = params.apartmentName || '';

  const handleGoToHome = () => {
    router.replace('/(home)');
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header */}
        <OnBoardingHeader 
          title={t('welcome')}
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
              {t('residentLinkedSuccess')}
            </Typo>

            <Typo 
              size={16}
              color={colors.subtitleText}
              fontWeight="400"
              style={styles.message}
            >
              {t('residentLinkedMessage').replace('{{apartmentName}}', apartmentName)}
            </Typo>
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

