import PaymentHistory from '@/components/dashboard/PaymentHistory';
import PaymentStatusCard from '@/components/dashboard/PaymentStatusCard';
import ResidentWelcomeHeader from '@/components/dashboard/ResidentWelcomeHeader';
import UpcomingMeetings from '@/components/dashboard/UpcomingMeetings';
import ScreenWrapper from '@/components/ScreenWrapper';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from '@/contexts/authContext';
import { useOnboarding } from '@/contexts/onboardingContext';
import useThemeColors from '@/contexts/useThemeColors';
import { RemainingPayment } from '@/data/types';
import { getApartmentData } from '@/services/apartmentService';
import { getApartmentMeetings, Meeting } from '@/services/meetingService';
import { Bill, getApartmentBills, getCurrentMonth } from '@/services/paymentService';
import { getResidentRemainingPayments } from '@/services/remainingPaymentService';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PaymentItem = 
  | { type: 'bill'; data: Bill }
  | { type: 'remaining'; data: RemainingPayment };

export default function ResidentDashboard() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { apartmentId } = useOnboarding();

  const [residentName, setResidentName] = useState<string>('');
  const [residentId, setResidentId] = useState<string | null>(null);
  const [monthlyFee, setMonthlyFee] = useState<number>(0);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentItem[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const parseDate = (dateStr: string): Date => {
    // Parse "DD/MM/YYYY" format
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const isUpcomingMeeting = (meeting: Meeting): boolean => {
    const meetingDate = parseDate(meeting.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return meetingDate >= today;
  };

  const getCurrentMonthBill = useCallback(async () => {
    if (!apartmentId || !residentId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Get apartment data to find resident info
      const apartmentResult = await getApartmentData(apartmentId);
      if (apartmentResult.success && apartmentResult.apartment) {
        const resident = apartmentResult.apartment.residents.find((r) => r.id === residentId);
        if (resident) {
          setResidentName(resident.name);
          setMonthlyFee(resident.monthlyFee);
        }
      }

      // Get bills, remaining payments, and meetings in parallel
      const [billsResult, remainingPaymentsResult, meetingsResult] = await Promise.all([
        getApartmentBills(apartmentId),
        getResidentRemainingPayments(apartmentId, residentId),
        getApartmentMeetings(apartmentId),
      ]);

      // Process bills
      let historyBills: PaymentItem[] = [];
      if (billsResult.success && billsResult.bills && billsResult.bills.length > 0) {
        // Filter bills for this resident
        const residentBills = billsResult.bills.filter((bill) => bill.ownerOfBill === residentId);
        
        if (residentBills.length > 0) {
          // Sort by date (newest first) - sort by year first, then month
          residentBills.sort((a, b) => {
            const [monthA, yearA] = a.date.split('-').map(Number);
            const [monthB, yearB] = b.date.split('-').map(Number);
            if (yearA !== yearB) return yearB - yearA; // Newer year first
            return monthB - monthA; // Newer month first
          });

          // Get current month bill
          const currentMonth = getCurrentMonth();
          const currentMonthBill = residentBills.find((bill) => bill.date === currentMonth);
          setCurrentBill(currentMonthBill || null);

          // Get payment history (all bills except current month)
          // Show all bills with all statuses (paid, pending, unpaid)
          historyBills = residentBills
            .filter((bill) => bill.date !== currentMonth)
            .map((bill) => ({ type: 'bill' as const, data: bill }));
        }
      }

      // Process remaining payments
      let historyRemainingPayments: PaymentItem[] = [];
      if (remainingPaymentsResult.success && remainingPaymentsResult.payments && remainingPaymentsResult.payments.length > 0) {
        // Sort by creation date (newest first)
        const sortedRemaining = [...remainingPaymentsResult.payments].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        historyRemainingPayments = sortedRemaining.map((payment) => ({ 
          type: 'remaining' as const, 
          data: payment 
        }));
      }

      // Combine bills and remaining payments into unified list
      const combinedItems: PaymentItem[] = [...historyBills, ...historyRemainingPayments];

      // Sort by date (newest first) - for bills use date field, for remaining payments use createdAt
      combinedItems.sort((a, b) => {
        let dateA: string;
        let dateB: string;
        
        if (a.type === 'bill') {
          // Convert "MM-YYYY" to sortable format "YYYY-MM"
          const [month, year] = a.data.date.split('-');
          dateA = `${year}-${month.padStart(2, '0')}`;
        } else {
          // Use createdAt date for remaining payments
          dateA = new Date(a.data.createdAt).toISOString().split('T')[0];
        }
        
        if (b.type === 'bill') {
          // Convert "MM-YYYY" to sortable format "YYYY-MM"
          const [month, year] = b.data.date.split('-');
          dateB = `${year}-${month.padStart(2, '0')}`;
        } else {
          // Use createdAt date for remaining payments
          dateB = new Date(b.data.createdAt).toISOString().split('T')[0];
        }
        
        return dateB.localeCompare(dateA); // Newest first
      });

      // Get the last 3 payments (most recent)
      const last3Payments = combinedItems.slice(0, 3);
      setPaymentHistory(last3Payments);

      // Process meetings
      if (meetingsResult.success && meetingsResult.meetings) {
        const upcoming = meetingsResult.meetings
          .filter(isUpcomingMeeting)
          .sort((a: Meeting, b: Meeting) => {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            if (dateA.getTime() === dateB.getTime()) {
              // If same date, sort by time
              return a.time.localeCompare(b.time);
            }
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 1); // Get only the next meeting
        setUpcomingMeetings(upcoming);
      }
    } catch (error) {
      console.log('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [apartmentId, residentId]);

  useEffect(() => {
    if (apartmentId && user?.uid) {
      loadResidentId();
    } else {
      setLoading(false);
    }
  }, [apartmentId, user?.uid]);

  useEffect(() => {
    if (residentId) {
      getCurrentMonthBill();
    }
  }, [residentId, getCurrentMonthBill]);

  const loadResidentId = async () => {
    if (!apartmentId || !user?.uid) return;

    try {
      const apartmentResult = await getApartmentData(apartmentId);
      if (apartmentResult.success && apartmentResult.apartment) {
        const linkedResident = apartmentResult.apartment.residents.find(
          (r) => r.isLinkedWithUser && r.linkedUserId === user.uid
        );
        if (linkedResident) {
          setResidentId(linkedResident.id);
        }
      }
    } catch (error) {
      console.log('Error loading resident ID:', error);
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getCurrentMonthBill();
    setRefreshing(false);
  }, [getCurrentMonthBill]);

  const getPaymentStatus = (): 'paid' | 'pending' | 'unpaid' => {
    if (!currentBill) return 'unpaid';
    return currentBill.status as 'paid' | 'pending' | 'unpaid';
  };

  const getPaymentDueDate = (): string | undefined => {
    if (!currentBill || currentBill.status === 'paid') return undefined;
    
    // Calculate days remaining in the month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysRemaining = lastDayOfMonth - now.getDate();
    
    // Return days remaining as a simple string
    return `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining`;
  };

  const HEADER_HEIGHT = 140; // Fixed height for the header

  return (
    <ScreenWrapper style={{ paddingTop: 0 }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>

        {/* Fixed Header Section */}
        <View style={[styles.headerContainer, { height: HEADER_HEIGHT + insets.top }]}>
          <ResidentWelcomeHeader 
            residentName={residentName || user?.name || ''} 
            unreadNotifications={0} // TODO: Get actual notification count
            insetsTop={insets.top}
          />
        </View>

        {/* Scrollable Content Below Header */}
        <ScrollView
          style={[styles.scrollView, { backgroundColor: colors.screenBackground, marginTop: HEADER_HEIGHT}]}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacingY._20 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* Payment Status Card */}
          <View style={styles.section}>
            <PaymentStatusCard
              monthlyFee={monthlyFee}
              paymentStatus={getPaymentStatus()}
              paymentDueDate={getPaymentDueDate()}
              loading={loading}
            />
          </View>

          {/* Upcoming Meetings Section */}
          <UpcomingMeetings meetings={upcomingMeetings} />

          {/* Payment History Section - Last 3 payments */}
          <PaymentHistory payments={paymentHistory} limit={3} loading={loading} />
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    borderBottomLeftRadius: radius._20,
    borderBottomRightRadius: radius._20,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._20,
  },
  section: {
    marginBottom: spacingY._24,
  },
});
