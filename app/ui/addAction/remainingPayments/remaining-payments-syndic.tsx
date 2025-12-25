import AppHeader from '@/components/AppHeader';
import InfoModal from '@/components/common/InfoModal';
import Input from '@/components/Input';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { getApartmentData } from '@/services/apartmentService';
import { createRemainingPaymentBySyndic } from '@/services/remainingPaymentService';
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
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ResidentWithRemaining {
  id: string;
  name: string;
  remainingAmount: number;
}

export default function RemainingPaymentsSyndicScreen() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { apartmentId } = useOnboarding();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [residentsWithRemaining, setResidentsWithRemaining] = useState<ResidentWithRemaining[]>([]);
  const [totalRemaining, setTotalRemaining] = useState<number>(0);
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    if (apartmentId) {
      loadSyndicData();
    } else {
      setLoading(false);
      setError('No apartment found');
    }
  }, [apartmentId]);

  useFocusEffect(
    useCallback(() => {
      if (apartmentId) {
        loadSyndicData();
      }
    }, [apartmentId])
  );

  const loadSyndicData = async () => {
    if (!apartmentId) return;

    setLoading(true);
    setError(null);

    try {
      // Get apartment data
      const apartmentResult = await getApartmentData(apartmentId);
      
      if (!apartmentResult.success || !apartmentResult.apartment) {
        setError('Failed to load apartment data');
        setLoading(false);
        return;
      }

      // Get all residents with remaining amount > 0
      const residents = apartmentResult.apartment.residents.filter(
        (r) => (r.remainingAmount || 0) > 0
      );

      // Calculate total remaining
      const total = residents.reduce((sum, r) => sum + (r.remainingAmount || 0), 0);

      setResidentsWithRemaining(
        residents.map((r) => ({
          id: r.id,
          name: r.name,
          remainingAmount: r.remainingAmount || 0,
        }))
      );
      setTotalRemaining(total);
    } catch (err: any) {
      console.log('Error loading syndic data:', err);
      setError('An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleSyndicSubmit = async () => {
    if (!apartmentId || !selectedResidentId) return;

    const amount = parseFloat(paymentAmount);

    if (!paymentAmount.trim() || isNaN(amount) || amount <= 0) {
      setError(t('validAmountRequired') || 'Please enter a valid amount');
      return;
    }

    const resident = residentsWithRemaining.find((r) => r.id === selectedResidentId);
    if (!resident) {
      setError('Resident not found');
      return;
    }

    if (amount > resident.remainingAmount) {
      setError(t('amountExceedsRemaining') || 'Amount cannot exceed remaining balance');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await createRemainingPaymentBySyndic(
        apartmentId,
        selectedResidentId,
        resident.name,
        amount
      );

      if (result.success) {
        // Clear selection and input
        setSelectedResidentId(null);
        setPaymentAmount('');
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

            <View style={[styles.summaryCard, { backgroundColor: colors.neutral800 }]}>
              <Typo size={16} color={colors.redClose} fontWeight="500">
                {t('totalRemainingMoney') || 'Total Remaining Money'}
              </Typo>
              <Typo size={32} color={colors.rose} fontWeight="700" style={styles.amountText}>
                {totalRemaining.toLocaleString()} MAD
              </Typo>
            </View>

            {residentsWithRemaining.length === 0 ? (
              <EmptyState message={t('noResidentsWithRemaining') || 'No residents with remaining balance'} />
            ) : (
              <>
                <View style={styles.section}>
                  <Typo size={18} color={colors.titleText} fontWeight="600" style={styles.sectionTitle}>
                    {t('residentsWithRemaining') || 'Residents with Remaining Balance'}
                  </Typo>

                  {residentsWithRemaining.map((resident) => (
                    <TouchableOpacity
                      key={resident.id}
                      onPress={() => {
                        setSelectedResidentId(resident.id === selectedResidentId ? null : resident.id);
                        setPaymentAmount('');
                        setError(null);
                      }}
                      style={[
                        styles.residentCard,
                        { 
                          backgroundColor: selectedResidentId === resident.id 
                            ? colors.primary + '20' 
                            : colors.neutral800,
                          borderWidth: selectedResidentId === resident.id ? 2 : 0,
                          borderColor: colors.primary,
                        }
                      ]}
                      activeOpacity={0.7}
                    >
                      <View style={styles.residentHeader}>
                        <Typo size={18} color={colors.primaryBigTitle} fontWeight="600">
                          {resident.name}
                        </Typo>
                        <Typo size={16} color={colors.rose} fontWeight="600">
                          {resident.remainingAmount.toLocaleString()} MAD
                        </Typo>
                      </View>
                    </TouchableOpacity>
                  ))}

                  {/* Amount Input - Show only when resident is selected */}
                  {selectedResidentId && (
                    <View style={styles.paymentInputSection}>
                      <Typo size={16} color={colors.titleText} fontWeight="600" style={styles.label}>
                        {t('amountPaid') || 'Amount Paid'}
                      </Typo>
                      <Input
                        placeholder={t('enterAmount') || 'Enter amount'}
                        value={paymentAmount}
                        onChangeText={(text) => {
                          const cleaned = handleAmountChange(text);
                          setPaymentAmount(cleaned ?? '');
                          setError(null);
                        }}
                        keyboardType="decimal-pad"
                        containerStyle={styles.inputContainer}
                      />
                      {selectedResidentId && (() => {
                        const selectedResident = residentsWithRemaining.find(r => r.id === selectedResidentId);
                        return selectedResident ? (
                          <Typo size={12} color={colors.primary} style={styles.hint}>
                            {t('maxAmount') || 'Maximum'}: {selectedResident.remainingAmount.toLocaleString()} MAD
                          </Typo>
                        ) : null;
                      })()}
                    </View>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Fixed Button Container */}
        {selectedResidentId && (
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
              onPress={handleSyndicSubmit}
              backgroundColor={colors.primary}
              loading={submitting}
              style={styles.submitButton}
              disabled={!paymentAmount || parseFloat(paymentAmount || '0') <= 0}
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
            await loadSyndicData();
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
  sectionTitle: {
    marginBottom: spacingY._16,
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
  residentCard: {
    padding: spacingX._16,
    borderRadius: radius._12,
    marginBottom: spacingY._12,
  },
  residentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentInputSection: {
    marginTop: spacingY._12,
  },
});

