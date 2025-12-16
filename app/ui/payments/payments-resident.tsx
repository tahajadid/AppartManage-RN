import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from '@/contexts/authContext';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { getApartmentData } from '@/services/apartmentService';
import { Bill, getApartmentBills } from '@/services/paymentService';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
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

  const loadBills = async () => {
    if (!apartmentId || !residentId) return;

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
        (bill) => bill.ownerOfBill === residentId
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
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper>
        <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
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
        <Typo size={28} color={colors.primary} style={styles.title} fontWeight="700">
          {t('tabPayments')}
        </Typo>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacingY._20 },
            { direction: isRTL ? 'rtl' : 'ltr' },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {bills.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Typo size={16} color={colors.subtitleText}>
                {t('noBills') || 'No bills found'}
              </Typo>
            </View>
          ) : (
            bills.map((bill, index) => {
              const statusColor = getStatusColor(bill.status);

              return (
                <View
                  key={`${bill.ownerOfBill}-${bill.date}-${index}`}
                  style={[styles.billCard, { backgroundColor: colors.neutral800 }]}
                >
                  <View style={styles.billHeader}>
                    <View style={styles.billInfo}>
                      <Typo size={18} color={colors.titleText} fontWeight="600">
                        {t('monthlyBill') || 'Monthly Bill'}
                      </Typo>
                      <Typo size={14} color={colors.subtitleText}>
                        {bill.date}
                      </Typo>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                      <Typo size={12} color={statusColor} fontWeight="600">
                        {getStatusLabel(bill.status)}
                      </Typo>
                    </View>
                  </View>

                  <View style={styles.billAmount}>
                    <Typo size={24} color={colors.primary} fontWeight="700">
                      {bill.amount} MAD
                    </Typo>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
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
    padding: spacingX._20,
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
    padding: spacingX._16,
    borderRadius: radius._12,
    marginBottom: spacingY._12,
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
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacingY._12,
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
  billAmount: {
    marginBottom: spacingY._8,
  },
});

