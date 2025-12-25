import AppHeader from '@/components/AppHeader';
import InfoModal from '@/components/common/InfoModal';
import Input from '@/components/Input';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from '@/contexts/authContext';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { getApartmentData } from '@/services/apartmentService';
import { createRemainingPayment } from '@/services/remainingPaymentService';
import { useFocusEffect } from 'expo-router';
import { Money } from 'phosphor-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RemainingPaymentsResidentScreen() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { apartmentId } = useOnboarding();
  const { user } = useAuth();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [residentId, setResidentId] = useState<string | null>(null);
  const [residentRemainingAmount, setResidentRemainingAmount] = useState<number>(0);
  const [residentPaymentAmount, setResidentPaymentAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    if (apartmentId && user?.uid) {
      loadResidentData();
    } else {
      setLoading(false);
      setError('No apartment or user found');
    }
  }, [apartmentId, user?.uid]);

  useFocusEffect(
    useCallback(() => {
      if (apartmentId && user?.uid) {
        loadResidentData();
      }
    }, [apartmentId, user?.uid])
  );

  const loadResidentData = async () => {
    if (!apartmentId || !user?.uid) return;

    setLoading(true);
    setError(null);

    try {
      // Get apartment data to find the resident
      const apartmentResult = await getApartmentData(apartmentId);
      
      if (!apartmentResult.success || !apartmentResult.apartment) {
        setError('Failed to load apartment data');
        setLoading(false);
        return;
      }

      // Find resident linked to current user
      const linkedResident = apartmentResult.apartment.residents.find(
        (r) => r.isLinkedWithUser && r.linkedUserId === user.uid
      );

      if (!linkedResident) {
        setError('Resident not found');
        setLoading(false);
        return;
      }

      setResidentId(linkedResident.id);
      setResidentRemainingAmount(linkedResident.remainingAmount || 0);
    } catch (err: any) {
      console.log('Error loading resident data:', err);
      setError('An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleResidentSubmit = async () => {
    if (!apartmentId || !residentId) return;

    const amount = parseFloat(residentPaymentAmount);
    if (!residentPaymentAmount.trim() || isNaN(amount) || amount <= 0) {
      setError(t('validAmountRequired') || 'Please enter a valid amount');
      return;
    }

    if (amount > residentRemainingAmount) {
      setError(t('amountExceedsRemaining') || 'Amount cannot exceed remaining balance');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Get resident name
      const apartmentResult = await getApartmentData(apartmentId);
      if (!apartmentResult.success || !apartmentResult.apartment) {
        setError('Failed to load resident data');
        return;
      }

      const resident = apartmentResult.apartment.residents.find((r) => r.id === residentId);
      if (!resident) {
        setError('Resident not found');
        return;
      }

      const result = await createRemainingPayment(
        apartmentId,
        residentId,
        resident.name,
        amount
      );

      if (result.success) {
        setResidentPaymentAmount('');
        setSuccessMessage(t('remainingPaymentCreated') || 'Remaining payment created successfully');
        setSuccessModalVisible(true);
      } else {
        setError(result.error || t('errorOccurred') || 'An error occurred, please try again');
      }
    } catch (err: any) {
      console.log('Error creating remaining payment:', err);
      setError(t('errorOccurred') || 'An error occurred, please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAmountChange = (text: string) => {
    // Only allow numbers and one decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return;
    }
    return cleaned;
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
          <AppHeader title={t('remainingPayments') || 'Remaining Payments'} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
        <AppHeader title={t('remainingPayments') || 'Remaining Payments'} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + spacingY._20 },
              { direction: isRTL ? 'rtl' : 'ltr' },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: colors.redClose + '20' }]}>
                <Typo size={14} color={colors.redClose}>
                  {error}
                </Typo>
              </View>
            )}

            {residentRemainingAmount <= 0 ? (
              <View style={styles.emptyContainer}>
                <Money size={48} color={colors.subtitleText} weight="regular" />
                <Typo size={16} color={colors.subtitleText} style={styles.emptyText}>
                  {t('noRemainingMoneyToPay') || 'No remaining money to pay'}
                </Typo>
              </View>
            ) : (
              <>
                <View style={[styles.summaryCard, { backgroundColor: colors.neutral800 }]}>
                  <Typo size={16} color={colors.subtitleText} fontWeight="500">
                    {t('remainingAmountToPay') || 'Remaining amount to pay'}
                  </Typo>
                  <Typo size={32} color={colors.rose} fontWeight="700" style={styles.amountText}>
                    {residentRemainingAmount.toLocaleString()} MAD
                  </Typo>
                </View>

                <View style={styles.section}>
                  <Typo size={16} color={colors.titleText} fontWeight="600" style={styles.label}>
                    {t('amountToPay') || 'Amount to Pay'}
                  </Typo>
                  <Input
                    placeholder={t('enterAmount') || 'Enter amount'}
                    value={residentPaymentAmount}
                    onChangeText={(text) => {
                      const cleaned = handleAmountChange(text);
                      setResidentPaymentAmount(cleaned ?? '');
                      setError(null);
                    }}
                    keyboardType="decimal-pad"
                    containerStyle={styles.inputContainer}
                  />
                  <Typo size={12} color={colors.primary} style={styles.hint}>
                    {t('maxAmount') || 'Maximum'}: {residentRemainingAmount.toLocaleString()} MAD
                  </Typo>
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Fixed Button Container */}
        {residentRemainingAmount > 0 && (
          <View
            style={[
              styles.fixedButtonContainer,
              {
                backgroundColor: colors.screenBackground,
                paddingBottom: insets.bottom + spacingY._16,
                borderTopColor: colors.neutral700,
              },
            ]}
          >
            <PrimaryButton
              onPress={handleResidentSubmit}
              backgroundColor={colors.primary}
              loading={submitting}
              style={styles.submitButton}
            >
              <Typo size={16} color={colors.white} fontWeight="600">
                {t('createPayment') || 'Create Payment'}
              </Typo>
            </PrimaryButton>
          </View>
        )}

        {/* Success Modal */}
        <InfoModal
          visible={successModalVisible}
          type="success"
          title={t('success') || 'Success'}
          message={successMessage}
          onClose={async () => {
            setSuccessModalVisible(false);
            await loadResidentData();
          }}
          showCancel={false}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacingY._24,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacingX._20,
    paddingBottom: spacingY._60 + spacingY._40, // Extra padding for fixed button
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: spacingX._12,
    borderRadius: radius._8,
    marginBottom: spacingY._16,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacingY._40,
    gap: spacingY._12,
  },
  emptyText: {
    marginTop: spacingY._8,
    textAlign: 'center',
  },
  summaryCard: {
    padding: spacingX._20,
    borderRadius: radius._12,
    marginBottom: spacingY._24,
    alignItems: 'center',
  },
  amountText: {
    marginTop: spacingY._8,
  },
  section: {
    marginBottom: spacingY._24,
  },
  label: {
    marginBottom: spacingY._12,
  },
  inputContainer: {
    marginBottom: spacingY._8,
  },
  hint: {
    marginTop: spacingY._5,
  },
  submitButton: {
    width: '100%',
  },
  fixedButtonContainer: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._16,
    borderTopWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});

