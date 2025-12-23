import Input from '@/components/Input';
import OnBoardingHeader from '@/components/OnBoardingHeader';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { createRTLStyles } from '@/utils/rtlStyles';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SyndicApartmentSetup() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const insets = useSafeAreaInsets();
  const rtlStyles = createRTLStyles(isRTL);
  const params = useLocalSearchParams<{ role?: string }>();

  const [apartmentName, setApartmentName] = useState('');
  const [actualBalance, setActualBalance] = useState('0');
  const [numberOfResidents, setNumberOfResidents] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    router.push('/(onboarding)/choose-role');
  };

  const handleContinue = () => {
    // Validation
    if (!apartmentName.trim()) {
      setError(t('apartmentNameRequired'));
      return;
    }

    const residentsCount = parseInt(numberOfResidents, 10);
    if (!numberOfResidents.trim() || isNaN(residentsCount) || residentsCount < 1) {
      setError(t('validResidentsCountRequired'));
      return;
    }

    // Validate actual balance (must be a valid number, can be 0 or positive)
    const balanceValue = parseFloat(actualBalance);
    if (actualBalance.trim() === '' || isNaN(balanceValue) || balanceValue < 0) {
      setError(t('validBalanceRequired') || 'Please enter a valid balance (0 or greater)');
      return;
    }

    // Get the selected role from route params or default to 'syndic'
    const role = params.role || 'syndic';

    // Navigate to resident list setup with apartment info
    router.push({
      pathname: '/(onboarding)/syndic/syndic-list-resident-setup',
      params: {
        apartmentName: apartmentName.trim(),
        actualBalance: balanceValue.toString(),
        numberOfResidents: residentsCount.toString(),
        role: role,
      },
    });
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header with back button and title */}
        <OnBoardingHeader 
          title={t('createApartment')}
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
                {t('createApartmentDescription')}
              </Typo>

              {/* Apartment Name Input */}
              <View style={styles.inputContainer}>
                <Typo 
                  size={14}
                  color={colors.primary}
                  fontWeight="600"
                  style={styles.label}
                >
                  {t('apartmentName')}
                </Typo>
                <Input
                  containerStyle={{ borderColor: colors.primary }}
                  inputStyle={rtlStyles.input()}
                  placeholderTextColor={colors.neutral400}
                  placeholder={t('apartmentNamePlaceholder')}
                  value={apartmentName}
                  onChangeText={setApartmentName}
                  autoCapitalize="words"
                  editable={true}
                />
              </View>

              {/* Actual Balance Input */}
              <View style={styles.inputContainer}>
                <Typo 
                  size={14}
                  color={colors.primary}
                  fontWeight="600"
                  style={styles.label}
                >
                  {t('actualBalance') || 'Actual Balance'}
                </Typo>
                <Input
                  containerStyle={{ borderColor: colors.primary }}
                  inputStyle={rtlStyles.input()}
                  placeholderTextColor={colors.neutral400}
                  placeholder={t('actualBalancePlaceholder') || '0'}
                  value={actualBalance}
                  onChangeText={setActualBalance}
                  keyboardType="decimal-pad"
                  editable={true}
                />
              </View>

              {/* Number of Residents Input */}
              <View style={styles.inputContainer}>
                <Typo 
                  size={14}
                  color={colors.primary}
                  fontWeight="600"
                  style={styles.label}
                >
                  {t('numberOfResidents')}
                </Typo>
                <Input
                  containerStyle={{ borderColor: colors.primary }}
                  inputStyle={rtlStyles.input()}
                  placeholderTextColor={colors.neutral400}
                  placeholder={t('numberOfResidentsPlaceholder')}
                  value={numberOfResidents}
                  onChangeText={setNumberOfResidents}
                  keyboardType="number-pad"
                  editable={true}
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

        {/* Complete Button at bottom */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacingY._24) }]}>
          <PrimaryButton
            style={styles.completeButton}
            backgroundColor={colors.primary}
            onPress={handleContinue}
          >
            <Typo 
              size={16}
              color={colors.screenBackground}
              fontWeight="600"
            >
              {t('continue')}
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
  completeButton: {
    height: 50,
    marginBottom: spacingY._24,
    borderRadius: radius._8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

