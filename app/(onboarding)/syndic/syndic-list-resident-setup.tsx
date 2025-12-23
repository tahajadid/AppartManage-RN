import Input from '@/components/Input';
import OnBoardingHeader from '@/components/OnBoardingHeader';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { ResidentData } from '@/data/types';
import { completeOnboarding } from '@/services/onboardingService';
import { createRTLStyles } from '@/utils/rtlStyles';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SyndicListResidentSetup() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { refreshOnboardingStatus } = useOnboarding();
  const insets = useSafeAreaInsets();
  const rtlStyles = createRTLStyles(isRTL);
  const params = useLocalSearchParams<{
    apartmentName: string;
    actualBalance: string;
    numberOfResidents: string;
    role: string;
  }>();

  const apartmentName = params.apartmentName || '';
  const actualBalance = parseFloat(params.actualBalance || '0');
  const numberOfResidents = parseInt(params.numberOfResidents || '0', 10);
  const role = (params.role as 'syndic' | 'syndic_resident') || 'syndic';
  const isSyndicResident = role === 'syndic_resident';

  // Initialize residents array
  const [residents, setResidents] = useState<ResidentData[]>(() => {
    return Array.from({ length: numberOfResidents }, () => ({
      name: '',
      monthlyFee: '',
      remainingAmount: '0', // Default to 0, not mandatory
    }));
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    router.back();
  };

  const updateResident = (index: number, field: keyof ResidentData, value: string) => {
    const updatedResidents = [...residents];
    updatedResidents[index] = {
      ...updatedResidents[index],
      [field]: value,
    };
    setResidents(updatedResidents);
  };

  const handleComplete = async () => {
    // Validation
    for (let i = 0; i < residents.length; i++) {
      if (!residents[i].name.trim()) {
        setError(`${t('residentNameRequired')} ${i + 1}`);
        return;
      }
      const fee = parseFloat(residents[i].monthlyFee);
      if (!residents[i].monthlyFee.trim() || isNaN(fee) || fee < 0) {
        setError(`${t('validMonthlyFeeRequired')} ${i + 1}`);
        return;
      }
      // Remaining amount is optional, default to 0 if empty or invalid
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare residents data for onboarding service
      const residentsData = residents.map((resident, index) => {
        // Remaining amount is optional, default to 0 if empty or invalid
        const remainingAmountValue = resident.remainingAmount.trim() 
          ? parseFloat(resident.remainingAmount) 
          : 0;
        const remainingAmount = isNaN(remainingAmountValue) || remainingAmountValue < 0 
          ? 0 
          : remainingAmountValue;
        
        return {
          name: resident.name.trim(),
          monthlyFee: parseFloat(resident.monthlyFee),
          remainingAmount: remainingAmount,
          isSyndic: isSyndicResident && index === 0,
        };
      });

      const result = await completeOnboarding({
        role: role,
        apartmentName: apartmentName,
        actualBalance: actualBalance,
        numberOfResidents: numberOfResidents,
        residents: residentsData,
      });

      if (result.error) {
        setError(result.error);
      } else {
        // Refresh onboarding status and navigate to success screen
        await refreshOnboardingStatus();
        router.push({
          pathname: '/(onboarding)/syndic/syndic-success-setup',
          params: {
            joinCode: result.joinCode || '',
            apartmentName: apartmentName,
          },
        });
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
          title={t('addResidents')}
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
                style={styles.subtitle}>
                {t('addResidentsDescription')}
              </Typo>

              {/* Dynamic Resident List */}
              {residents.map((resident, index) => {
                
                const isFirstAndSyndicResident = isSyndicResident && index === 0;
                
                return (
                  <View
                    key={index}
                    style={[
                      styles.residentItem,
                      !isFirstAndSyndicResident && styles.residentItemSyndic 
                      && {backgroundColor: colors.primaryUnselectedBackground, borderRadius: radius._8, borderColor: colors.goldColorBorder},
                      isFirstAndSyndicResident && styles.residentItemSyndic 
                      && {backgroundColor: colors.goldColorBackground, borderColor: colors.goldColorBorder},
                    ]}
                  >
                    {isFirstAndSyndicResident && (
                      <View style={[styles.syndicBadge, {backgroundColor: colors.screenBackground, borderColor: colors.neutral200}]}>
                        <Typo 
                          size={12}
                          color={colors.primary}
                          fontWeight="600"
                        >
                          {t('you')}
                        </Typo>
                      </View>
                    )}

                    <Typo 
                      size={16}
                      color={colors.text}
                      fontWeight="800"
                      style={styles.residentLabel}
                    >
                      {t('resident')} {index + 1}
                    </Typo>

                    {/* Resident Name Input */}
                    <View style={styles.inputContainer}>
                      <Typo 
                        size={14}
                        color={colors.text}
                        fontWeight="600"
                        style={styles.label}
                      >
                        {t('residentName')}
                      </Typo>
                      <Input
                        containerStyle={{ borderColor: colors.neutral300 }}
                        inputStyle={rtlStyles.input()}
                        placeholderTextColor={colors.text}
                        placeholder={t('residentNamePlaceholder')}
                        value={resident.name}
                        onChangeText={(value) => updateResident(index, 'name', value)}
                        autoCapitalize="words"
                        editable={!loading}
                      />
                    </View>

                    {/* Monthly Fee Input */}
                    <View style={styles.inputContainer}>
                      <Typo 
                        size={14}
                        color={colors.text}
                        fontWeight="600"
                        style={styles.label}
                      >
                        {t('monthlyFee')}
                      </Typo>
                      <Input
                        containerStyle={{ borderColor: colors.neutral300 }}
                        inputStyle={rtlStyles.input()}
                        placeholderTextColor={colors.text}
                        placeholder={t('monthlyFeePlaceholder')}
                        value={resident.monthlyFee}
                        onChangeText={(value) => updateResident(index, 'monthlyFee', value)}
                        keyboardType="decimal-pad"
                        editable={!loading}
                      />
                    </View>

                    {/* Remaining Amount Input */}
                    <View style={styles.inputContainer}>
                      <Typo 
                        size={14}
                        color={colors.text}
                        fontWeight="600"
                        style={styles.label}
                      >
                        {t('remainingAmount')}
                      </Typo>
                      <Input
                        containerStyle={{ borderColor: colors.neutral300 }}
                        inputStyle={rtlStyles.input()}
                        placeholderTextColor={colors.text}
                        placeholder={t('remainingAmountPlaceholder')}
                        value={resident.remainingAmount}
                        onChangeText={(value) => updateResident(index, 'remainingAmount', value)}
                        keyboardType="decimal-pad"
                        editable={!loading}
                      />
                    </View>
                  </View>
                );
              })}

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
            onPress={handleComplete}
            loading={loading}
            disabled={loading}
          >
            <Typo 
              size={16}
              color={colors.screenBackground}
              fontWeight="600"
            >
              {loading ? t('completing') : t('complete')}
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
    paddingBottom: spacingY._16,
  },
  content: {
    width: '100%',
    maxWidth: 400,
  },
  subtitle: {
    marginBottom: spacingY._24,
    textAlign: 'left',
  },
  residentItem: {
    marginBottom: spacingY._16,
    padding: spacingX._16,
    borderRadius: radius._8
  },
  residentItemSyndic: {
    borderWidth: 1,
  },
  syndicBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._5,
    borderRadius: radius._8,
    marginBottom: spacingY._12,
  },
  residentLabel: {
    marginBottom: spacingY._5,
  },
  inputContainer: {
  },
  label: {
    marginTop: spacingY._10,
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

