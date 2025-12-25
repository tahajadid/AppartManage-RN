import ChangePaymentStatusModal from '@/app/ui/payments/syndic/bills/changePaymentStatusModal';
import AppHeader from '@/components/AppHeader';
import InfoModal from '@/components/common/InfoModal';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { RemainingPayment } from '@/data/types';
import { getApartmentRemainingPayments, validateRemainingPayment } from '@/services/remainingPaymentService';
import { useFocusEffect } from 'expo-router';
import { Swap } from 'phosphor-react-native';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RemainingPaymentsListScreen() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { apartmentId } = useOnboarding();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [payments, setPayments] = useState<RemainingPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<RemainingPayment | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState<boolean>(false);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [successModalVisible, setSuccessModalVisible] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'paid'>('all');

  useFocusEffect(
    useCallback(() => {
      if (apartmentId) {
        loadRemainingPayments();
      }
    }, [apartmentId])
  );

  const loadRemainingPayments = async () => {
    if (!apartmentId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getApartmentRemainingPayments(apartmentId);

      if (!result.success || !result.payments) {
        setError(result.error || 'Failed to load remaining payments');
        setLoading(false);
        return;
      }

      // Sort by creation date (newest first)
      const sortedPayments = [...result.payments].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPayments(sortedPayments);
    } catch (err: any) {
      console.log('Error loading remaining payments:', err);
      setError('An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentPress = (payment: RemainingPayment) => {
    if (payment.status === 'pending') {
      setSelectedPayment(payment);
      setStatusModalVisible(true);
    }
  };

  const handleStatusChange = async (newStatus: 'pending' | 'paid') => {
    if (!selectedPayment || !apartmentId || newStatus === 'pending') return;

    setUpdatingStatus(true);
    setError(null);

    try {
      const result = await validateRemainingPayment(apartmentId, selectedPayment.id);

      if (result.success) {
        setStatusModalVisible(false);
        setSelectedPayment(null);
        setSuccessModalVisible(true);
        await loadRemainingPayments();
      } else {
        setError(result.error || 'Failed to update payment status');
        setStatusModalVisible(false);
        setSelectedPayment(null);
      }
    } catch (err: any) {
      console.log('Error updating payment status:', err);
      setError('An error occurred, please try again');
      setStatusModalVisible(false);
      setSelectedPayment(null);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getFilteredPayments = (): RemainingPayment[] => {
    if (selectedFilter === 'all') {
      return payments;
    }
    return payments.filter((payment) => payment.status === selectedFilter);
  };

  const getStatusColor = (status: RemainingPayment['status']) => {
    switch (status) {
      case 'paid':
        return colors.greenAdd;
      case 'pending':
        return colors.brightOrange;
      default:
        return colors.subtitleText;
    }
  };

  const getStatusLabel = (status: RemainingPayment['status']) => {
    switch (status) {
      case 'paid':
        return t('paid') || 'Paid';
      case 'pending':
        return t('pending') || 'Pending';
      default:
        return status;
    }
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

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacingY._20 },
            { direction: isRTL ? 'rtl' : 'ltr' },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.redClose + '20' }]}>
              <Typo size={14} color={colors.redClose}>
                {error}
              </Typo>
            </View>
          )}

          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                { 
                  backgroundColor: selectedFilter === 'all' ? colors.primary : colors.neutral800,
                  borderColor: selectedFilter === 'all' ? colors.primary : colors.neutral700,
                }
              ]}
              onPress={() => setSelectedFilter('all')}
              activeOpacity={0.7}
            >
              <Typo 
                size={14} 
                color={selectedFilter === 'all' ? colors.white : colors.subtitleText} 
                fontWeight="600"
              >
                {t('all') || 'All'}
              </Typo>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                { 
                  backgroundColor: selectedFilter === 'pending' ? colors.brightOrange : colors.neutral800,
                  borderColor: selectedFilter === 'pending' ? colors.brightOrange : colors.neutral700,
                }
              ]}
              onPress={() => setSelectedFilter('pending')}
              activeOpacity={0.7}
            >
              <Typo 
                size={14} 
                color={selectedFilter === 'pending' ? colors.white : colors.subtitleText} 
                fontWeight="600"
              >
                {t('pending') || 'Pending'}
              </Typo>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                { 
                  backgroundColor: selectedFilter === 'paid' ? colors.greenAdd : colors.neutral800,
                  borderColor: selectedFilter === 'paid' ? colors.greenAdd : colors.neutral700,
                }
              ]}
              onPress={() => setSelectedFilter('paid')}
              activeOpacity={0.7}
            >
              <Typo 
                size={14} 
                color={selectedFilter === 'paid' ? colors.white : colors.subtitleText} 
                fontWeight="600"
              >
                {t('paid') || 'Paid'}
              </Typo>
            </TouchableOpacity>
          </View>

          {(() => {
            const filteredPayments = getFilteredPayments();
            
            if (filteredPayments.length === 0) {
              return (
                <View style={styles.emptyContainer}>
                  <Typo size={16} color={colors.subtitleText}>
                    {t('noRemainingPayments') || 'No remaining payments found'}
                  </Typo>
                </View>
              );
            }

            return filteredPayments.map((payment, index) => {
              const statusColor = getStatusColor(payment.status);

              return (
                <View
                  key={payment.id}
                  style={[styles.paymentCard, { backgroundColor: colors.neutral800 }]}
                >
                  <View style={[styles.paymentContent, { backgroundColor: colors.neutral800 }]}>
                    <View style={styles.paymentHeader}>
                      <View style={styles.paymentInfo}>
                        <Typo size={18} color={colors.primaryBigTitle} fontWeight="600">
                          {payment.residentName}
                        </Typo>
                        <Typo size={14} color={colors.subtitleText} style={styles.dateText}>
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </Typo>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        <Typo size={12} color={statusColor} fontWeight="600">
                          {getStatusLabel(payment.status)}
                        </Typo>
                      </View>
                    </View>

                    <View>
                      <Typo size={18} color={colors.text} fontWeight="700">
                        {payment.amount.toLocaleString()} MAD
                      </Typo>
                    </View>
                  </View>

                  {payment.status === 'pending' && (
                    <TouchableOpacity
                      onPress={() => handlePaymentPress(payment)}
                      style={[styles.changeStatusButton, { backgroundColor: colors.neutral700 }]}
                      activeOpacity={0.7}
                    >
                      <Swap size={16} color={colors.primary} weight="regular" />
                      <Typo size={14} color={colors.primary} fontWeight="600" style={styles.changeStatusText}>
                        {t('changeState') || 'Change State'}
                      </Typo>
                    </TouchableOpacity>
                  )}
                </View>
              );
            });
          })()}
        </ScrollView>

        {/* Change Status Modal */}
        <ChangePaymentStatusModal
          visible={statusModalVisible}
          bill={null}
          remainingPayment={selectedPayment}
          updatingStatus={updatingStatus}
          onClose={() => {
            setStatusModalVisible(false);
            setSelectedPayment(null);
          }}
          onStatusChange={(newStatus) => {
            if (newStatus === 'paid') {
              handleStatusChange(newStatus);
            }
          }}
        />

        {/* Success Modal */}
        <InfoModal
          visible={successModalVisible}
          type="success"
          title={t('success') || 'Success'}
          message={t('paymentStatusUpdated') || 'Payment status updated successfully'}
          onClose={() => setSuccessModalVisible(false)}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacingY._8,
    paddingBottom: spacingY._20,
    paddingHorizontal: spacingX._20,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacingY._40,
  },
  paymentCard: {
    borderRadius: radius._12,
    marginBottom: spacingY._12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  paymentContent: {
    padding: spacingX._16,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacingY._12,
  },
  paymentInfo: {
    flex: 1,
  },
  dateText: {
    marginTop: spacingY._5,
  },
  statusBadge: {
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._5,
    borderRadius: radius._8,
    marginStart: spacingX._12,
  },
  changeStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacingY._8,
    margin: spacingY._8,
    paddingHorizontal: spacingX._16,
    gap: spacingX._8,
    borderRadius: radius._12,
  },
  changeStatusText: {
    marginStart: spacingX._5,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacingX._8,
    marginBottom: spacingY._16,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: spacingX._16,
    paddingVertical: spacingY._8,
    borderRadius: radius._8,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
});

