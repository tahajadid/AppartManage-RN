import AppHeader from '@/components/AppHeader';
import InfoModal from '@/components/common/InfoModal';
import RequestPaymentModal from '@/components/payments/RequestPaymentModal';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from '@/contexts/authContext';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import i18n from '@/i18n/index';
import { getApartmentData } from '@/services/apartmentService';
import { Bill, getApartmentBills, getCurrentDate, requestPayment } from '@/services/paymentService';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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

interface BillWithResidentName extends Bill {
  residentName: string;
}

export default function PaymentsResident() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { apartmentId } = useOnboarding();
  const { user } = useAuth();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [bills, setBills] = useState<BillWithResidentName[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [residentId, setResidentId] = useState<string | null>(null);
  const [requestModalVisible, setRequestModalVisible] = useState<boolean>(false);
  const [selectedBill, setSelectedBill] = useState<BillWithResidentName | null>(null);
  const [requestingPayment, setRequestingPayment] = useState<boolean>(false);
  const [successModalVisible, setSuccessModalVisible] = useState<boolean>(false);

  useEffect(() => {
    if (apartmentId && user?.uid) {
      loadResidentId();
    } else {
      setLoading(false);
      setError('No apartment or user found');
    }
  }, [apartmentId, user?.uid]);

  // Reload bills when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (apartmentId && residentId) {
        loadBillsForResident(residentId);
      }
    }, [apartmentId, residentId])
  );

  const loadResidentId = async () => {
    if (!apartmentId || !user?.uid) return;

    try {
      // Get apartment data to find the resident linked to this user
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
    } catch (err: any) {
      console.log('Error loading resident ID:', err);
      setError('An error occurred, please try again');
      setLoading(false);
    }
  };

  const loadBillsForResident = async (residentIdToLoad: string) => {
    if (!apartmentId) return;

    setLoading(true);
    setError(null);

    try {
      // Get bills
      const billsResult = await getApartmentBills(apartmentId);
      
      if (!billsResult.success || !billsResult.bills) {
        setError(billsResult.error || 'Failed to load bills');
        setLoading(false);
        return;
      }

      // Filter bills for this resident only
      const residentBills = billsResult.bills.filter(
        (bill) => bill.ownerOfBill === residentIdToLoad
      );

      // Get apartment data to get resident name
      const apartmentResult = await getApartmentData(apartmentId);
      
      if (!apartmentResult.success || !apartmentResult.apartment) {
        setError('Failed to load resident data');
        setLoading(false);
        return;
      }

      // Map bills with resident name
      const billsWithNames: BillWithResidentName[] = residentBills.map((bill) => {
        const resident = apartmentResult.apartment!.residents.find(
          (r) => r.id === bill.ownerOfBill
        );
        return {
          ...bill,
          residentName: resident?.name || 'Unknown Resident',
        };
      });

      // Sort by date (newest first)
      billsWithNames.sort((a, b) => b.date.localeCompare(a.date));

      setBills(billsWithNames);
    } catch (err: any) {
      console.log('Error loading bills:', err);
      setError('An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (residentId && apartmentId) {
      loadBillsForResident(residentId);
    }
  }, [residentId]);

  // Format date from "MM-YYYY" to "MonthName YYYY"
  const formatMonthYear = (dateStr: string): string => {
    const [month, year] = dateStr.split('-');
    const monthNum = parseInt(month, 10) - 1; // JavaScript months are 0-indexed
    const date = new Date(parseInt(year, 10), monthNum, 1);
    
    // Get current language from i18n
    const currentLang = i18n.language || 'en';
    // Map language codes to locale strings
    const localeMap: { [key: string]: string } = {
      'en': 'en-US',
      'ar': 'ar-SA',
      'fr': 'fr-FR',
    };
    const locale = localeMap[currentLang] || 'en-US';
    
    // Use toLocaleDateString with options for month and year
    return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  };

  // Group bills by month
  const groupBillsByMonth = (bills: BillWithResidentName[]): Map<string, BillWithResidentName[]> => {
    const grouped = new Map<string, BillWithResidentName[]>();
    
    bills.forEach((bill) => {
      const monthKey = bill.date; // "MM-YYYY"
      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, []);
      }
      grouped.get(monthKey)!.push(bill);
    });
    
    // Sort bills within each month by last operation date (newest first)
    grouped.forEach((monthBills) => {
      monthBills.sort((a, b) => {
        // Get the last operation date from each bill
        const lastOpA = a.listOfOperation && a.listOfOperation.length > 0 
          ? a.listOfOperation[a.listOfOperation.length - 1].date 
          : '';
        const lastOpB = b.listOfOperation && b.listOfOperation.length > 0 
          ? b.listOfOperation[b.listOfOperation.length - 1].date 
          : '';
        
        // Sort by last operation date (newest first)
        if (lastOpA && lastOpB) {
          // Convert "DD-MM-YYYY" to comparable format
          const dateA = lastOpA.split('-').reverse().join('-'); // "YYYY-MM-DD"
          const dateB = lastOpB.split('-').reverse().join('-'); // "YYYY-MM-DD"
          if (dateA !== dateB) {
            return dateB.localeCompare(dateA); // Newest first
          }
        }
        // If no operations or dates are equal, maintain original order
        return 0;
      });
    });
    
    return grouped;
  };

  const handleRequestPayment = (bill: BillWithResidentName) => {
    setSelectedBill(bill);
    setRequestModalVisible(true);
  };

  const handleConfirmRequestPayment = async () => {
    if (!selectedBill || !apartmentId || !residentId) return;

    setRequestingPayment(true);
    setError(null);

    try {
      const result = await requestPayment(
        apartmentId,
        residentId,
        selectedBill.date
      );

      if (result.success) {
        // Update the bill status in local state to "payment_requested"
        setBills((prevBills) => {
          return prevBills.map((bill) => {
            if (bill.ownerOfBill === selectedBill.ownerOfBill && bill.date === selectedBill.date) {
              // Update status and add the new operation
              const operationDate = getCurrentDate();

              return {
                ...bill,
                status: 'payment_requested' as const,
                listOfOperation: [
                  ...bill.listOfOperation,
                  {
                    date: operationDate,
                    operation: 'request_payment' as const,
                  },
                ],
              };
            }
            return bill;
          });
        });

        setRequestModalVisible(false);
        setSelectedBill(null);
        setSuccessModalVisible(true);
      } else {
        setError(result.error || 'Failed to request payment');
        setRequestModalVisible(false);
        setSelectedBill(null);
      }
    } catch (err: any) {
      console.log('Error requesting payment:', err);
      setError('An error occurred, please try again');
      setRequestModalVisible(false);
      setSelectedBill(null);
    } finally {
      setRequestingPayment(false);
    }
  };

  const getStatusColor = (status: Bill['status']) => {
    switch (status) {
      case 'paid':
        return colors.greenAdd;
      case 'payment_requested':
        return colors.brightOrange;
      case 'not_paid':
        return colors.redClose;
      default:
        return colors.subtitleText;
    }
  };

  const getStatusLabel = (status: Bill['status']) => {
    switch (status) {
      case 'paid':
        return t('paid') || 'Paid';
      case 'payment_requested':
        return t('paymentRequested') || 'Payment Requested';
      case 'not_paid':
        return t('notPaid') || 'Not Paid';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
          <AppHeader title={t('tabPayments')} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  if (error && !bills.length) {
    return (
      <ScreenWrapper>
        <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
          <AppHeader title={t('tabPayments')} />
          <View style={styles.errorContainer}>
            <Typo size={16} color={colors.redClose}>
              {error}
            </Typo>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
        <AppHeader title={t('tabPayments')} />

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
            <View style={styles.errorContainer}>
              <Typo size={14} color={colors.redClose}>
                {error}
              </Typo>
            </View>
          )}

          {bills.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Typo size={16} color={colors.subtitleText}>
                {t('noBills') || 'No bills found'}
              </Typo>
            </View>
          ) : (
            (() => {
              const groupedBills = groupBillsByMonth(bills);
              // Sort months (newest first) - properly sort by year then month
              const sortedMonths = Array.from(groupedBills.keys()).sort((a, b) => {
                const [monthA, yearA] = a.split('-').map(Number);
                const [monthB, yearB] = b.split('-').map(Number);
                
                // First compare by year (newest first)
                if (yearB !== yearA) {
                  return yearB - yearA;
                }
                // Then by month (newest first)
                return monthB - monthA;
              });

              return sortedMonths.map((monthKey) => {
                const monthBills = groupedBills.get(monthKey)!;
                const monthTitle = formatMonthYear(monthKey);

                return (
                  <View key={monthKey} style={styles.monthSection}>
                    <View style={styles.monthHeader}>
                      <Typo size={18} color={colors.text} fontWeight="600">
                        {monthTitle}
                      </Typo>
                      <View style={{height: spacingY._1, backgroundColor: colors.text, marginTop: spacingX._3, marginHorizontal:spacingX._20}} />
                    </View>
                    {monthBills.map((bill, index) => {
                      const statusColor = getStatusColor(bill.status);

                      return (
                        <View
                          key={`${bill.ownerOfBill}-${bill.date}-${index}`}
                          style={[styles.billCard, { backgroundColor: colors.neutral800 }]}
                        >
                          <View style={[styles.billContent, { backgroundColor: colors.neutral800 }]}>
                            <View style={styles.billHeader}>
                              <View style={styles.billInfo}>
                                <Typo size={18} color={colors.primaryBigTitle} fontWeight="600">
                                  {t('monthlyBill') || 'Monthly Bill'}
                                </Typo>
                              </View>
                              <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                                <Typo size={12} color={statusColor} fontWeight="600">
                                  {getStatusLabel(bill.status)}
                                </Typo>
                              </View>
                            </View>

                            <View>
                              <Typo size={18} color={colors.text} fontWeight="700">
                                {bill.amount} MAD
                              </Typo>
                            </View>
                          </View>

                          {bill.status === 'not_paid' && (
                            <TouchableOpacity
                              onPress={() => handleRequestPayment(bill)}
                              style={[styles.requestPaymentButton, { backgroundColor: colors.primary }]}
                              activeOpacity={0.7}
                            >
                              <Typo size={16} color={colors.white} fontWeight="600">
                                {t('requestPayment') || 'Request Payment'}
                              </Typo>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </View>
                );
              });
            })()
          )}
        </ScrollView>

        {/* Request Payment Modal */}
        <RequestPaymentModal
          visible={requestModalVisible}
          bill={selectedBill}
          loading={requestingPayment}
          onClose={() => {
            setRequestModalVisible(false);
            setSelectedBill(null);
          }}
          onConfirm={handleConfirmRequestPayment}
        />

        {/* Success Modal */}
        <InfoModal
          visible={successModalVisible}
          type="success"
          title={t('success') || 'Success'}
          message={t('paymentRequested') || 'Payment request sent successfully. The syndic will be notified.'}
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
  title: {
    marginStart: spacingX._20,
    textAlign: 'left',
    marginBottom: spacingY._16,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacingX._20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacingY._40,
  },
  billCard: {
    borderRadius: radius._12,
    marginBottom: spacingY._8,
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
  billContent: {
    padding: spacingX._12,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacingY._8,
  },
  billInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._5,
    borderRadius: radius._8,
    marginStart: spacingX._12,
  },
  monthSection: {
    marginBottom: spacingY._24,
  },
  monthHeader: {
    marginBottom: spacingY._16,
    flexDirection: 'column',
  },
  requestPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacingY._8,
    margin: spacingY._8,
    paddingHorizontal: spacingX._16,
    gap: spacingX._8,
    borderRadius: radius._12,
  },
});

