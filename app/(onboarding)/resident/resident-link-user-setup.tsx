import OnBoardingHeader from '@/components/OnBoardingHeader';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { linkResidentToUser } from '@/services/onboardingService';
import { createRTLStyles } from '@/utils/rtlStyles';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle } from 'phosphor-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Resident {
  id: string;
  name: string;
  monthlyFee: number;
  remainingAmount: number;
  isLinkedWithUser: boolean;
  linkedUserId: string | null;
  isSyndic?: boolean;
}

export default function ResidentLinkUserSetup() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { refreshOnboardingStatus } = useOnboarding();
  const insets = useSafeAreaInsets();
  const rtlStyles = createRTLStyles(isRTL);

  const params = useLocalSearchParams<{
    apartmentId: string;
    apartmentName: string;
    joinCode: string;
    residents: string;
  }>();

  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apartmentId = params.apartmentId || '';
  const apartmentName = params.apartmentName || '';
  const joinCode = params.joinCode || '';
  const residents: Resident[] = params.residents ? JSON.parse(params.residents) : [];

  const handleBack = () => {
    router.back();
  };

  const handleSelectResident = (residentId: string) => {
    const resident = residents.find(r => r.id === residentId);
    if (resident && !resident.isLinkedWithUser) {
      setSelectedResidentId(residentId);
      setError(null);
    }
  };

  const handleComplete = async () => {
    if (!selectedResidentId) {
      setError(t('selectResidentRequired'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await linkResidentToUser(selectedResidentId, apartmentId);

      if (result.error) {
        setError(result.error);
      } else {
        // Refresh onboarding status and navigate to success screen
        await refreshOnboardingStatus();
        router.replace({
          pathname: '/(onboarding)/resident/resident-success-setup' as any,
          params: {
            apartmentName: apartmentName,
          },
        });
      }
    } catch (err: any) {
      console.log('Error linking resident:', err);
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
          title={t('selectYourIdentity')}
          onBack={handleBack}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Apartment Info */}
            <View style={styles.apartmentInfo}>
              <Typo 
                size={18}
                color={colors.text}
                fontWeight="700"
                style={styles.apartmentTitle}
              >
                {apartmentName}
              </Typo>
              <Typo 
                size={14}
                color={colors.subtitleText}
                fontWeight="400"
                style={styles.apartmentSubtitle}
              >
                {t('selectResidentDescription')}
              </Typo>
            </View>

            {/* Residents List */}
            <View style={styles.residentsContainer}>
              <Typo 
                size={16}
                color={colors.text}
                fontWeight="600"
                style={styles.residentsTitle}
              >
                {t('residents')}
              </Typo>
              
              {residents.map((resident) => {
                const isSelected = selectedResidentId === resident.id;
                const isDisabled = resident.isLinkedWithUser;
                
                return (
                  <TouchableOpacity
                    key={resident.id}
                    onPress={() => handleSelectResident(resident.id)}
                    disabled={isDisabled}
                    style={[
                      styles.residentCard,
                      {
                        backgroundColor: isDisabled 
                          ? colors.neutral800 
                          : isSelected 
                            ? colors.primary + '20' 
                            : colors.neutral900,
                        borderColor: isSelected 
                          ? colors.primary 
                          : isDisabled 
                            ? colors.neutral700 
                            : colors.neutral700,
                        opacity: isDisabled ? 0.5 : 1,
                      },
                    ]}
                    activeOpacity={isDisabled ? 1 : 0.7}
                  >
                    <View style={styles.residentContent}>
                      <View style={styles.residentInfo}>
                        <Typo 
                          size={16}
                          color={isDisabled ? colors.neutral400 : colors.text}
                          fontWeight="600"
                        >
                          {resident.name}
                          {resident.isSyndic && (
                            <Typo 
                              size={12}
                              color={colors.primary}
                              fontWeight="400"
                              style={styles.syndicBadge}
                            >
                              {' '}({t('syndic')})
                            </Typo>
                          )}
                        </Typo>
                        <Typo 
                          size={14}
                          color={isDisabled ? colors.neutral500 : colors.subtitleText}
                          fontWeight="400"
                        >
                          {t('monthlyFee')}: {resident.monthlyFee}
                        </Typo>
                        {resident.isLinkedWithUser && (
                          <Typo 
                            size={12}
                            color={colors.neutral400}
                            fontWeight="400"
                            style={styles.linkedLabel}
                          >
                            {t('alreadyLinked')}
                          </Typo>
                        )}
                      </View>
                      {isSelected && !isDisabled && (
                        <CheckCircle 
                          size={24} 
                          color={colors.primary} 
                          weight="fill" 
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
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

        {/* Continue Button at bottom */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacingY._24) }]}>
          <PrimaryButton
            style={styles.continueButton}
            backgroundColor={colors.primary}
            onPress={handleComplete}
            loading={loading}
            disabled={loading || !selectedResidentId}
          >
            <Typo 
              size={16}
              color={colors.screenBackground}
              fontWeight="600"
            >
              {loading ? t('linking') : t('continue')}
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
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  apartmentInfo: {
    marginBottom: spacingY._24,
    paddingBottom: spacingY._16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  apartmentTitle: {
    marginBottom: spacingY._8,
  },
  apartmentSubtitle: {
    lineHeight: 20,
  },
  residentsContainer: {
    marginBottom: spacingY._16,
  },
  residentsTitle: {
    marginBottom: spacingY._16,
  },
  residentCard: {
    padding: spacingX._16,
    borderRadius: radius._12,
    borderWidth: 2,
    marginBottom: spacingY._12,
  },
  residentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  residentInfo: {
    flex: 1,
  },
  syndicBadge: {
    marginLeft: spacingX._5,
  },
  linkedLabel: {
    marginTop: spacingY._5,
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
  continueButton: {
    height: 50,
    marginBottom: spacingY._24,
    borderRadius: radius._8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

