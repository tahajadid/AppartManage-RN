import FinancialSummaryChart from '@/components/charts/FinancialSummaryChart';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MonthlyFinancialSummary from '@/components/dashboard/MonthlyFinancialSummary';
import UpcomingMeetings from '@/components/dashboard/UpcomingMeetings';
import ScreenWrapper from '@/components/ScreenWrapper';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboardingContext';
import useThemeColors from '@/contexts/useThemeColors';
import { getApartmentData } from '@/services/apartmentService';
import { getApartmentExpenses } from '@/services/expenseService';
import { getApartmentMeetings, Meeting } from '@/services/meetingService';
import { getApartmentBills } from '@/services/paymentService';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  ImageBackground,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT / 3;

export default function SyndicDashboard() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { apartmentId } = useOnboarding();

  const [apartmentName, setApartmentName] = useState<string>('');
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [remainingToCollect, setRemainingToCollect] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Financial Summary
  const [totalExpected, setTotalExpected] = useState<number>(0);
  const [totalCollected, setTotalCollected] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [netBalance, setNetBalance] = useState<number>(0);
  const [collectionRate, setCollectionRate] = useState<number>(0);
  
  // Upcoming Meetings
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  
  // Chart Data
  const [paymentStatusData, setPaymentStatusData] = useState<Array<{ label: string; value: number; color: string }>>([]);
  const [incomeExpenseData, setIncomeExpenseData] = useState<Array<{ label: string; value: number; color: string }>>([]);

  const getCurrentMonth = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${month}-${year}`;
  };

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

  const loadDashboardData = useCallback(async () => {
    if (!apartmentId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const currentMonth = getCurrentMonth();
      
      // Fetch apartment data
      const apartmentResult = await getApartmentData(apartmentId);
      if (apartmentResult.success && apartmentResult.apartment) {
        setApartmentName(apartmentResult.apartment.name);
        setCurrentBalance(apartmentResult.apartment.actualBalance || 0);
        
        // Calculate total expected (sum of all residents' monthly fees)
        const totalExpectedAmount = apartmentResult.apartment.residents.reduce(
          (sum, resident) => sum + resident.monthlyFee,
          0
        );
        setTotalExpected(totalExpectedAmount);
      }

      // Fetch bills and expenses in parallel
      const [billsResult, expensesResult] = await Promise.all([
        getApartmentBills(apartmentId),
        getApartmentExpenses(apartmentId),
      ]);

      let totalCollectedAmount = 0;
      let totalExpensesAmount = 0;

      // Process bills
      if (billsResult.success && billsResult.bills) {
        const currentMonthBills = billsResult.bills.filter((bill) => bill.date === currentMonth);
        
        // Calculate totals
        const unpaidBills = currentMonthBills.filter(
          (bill) => bill.status === 'unpaid' || bill.status === 'pending'
        );
        const paidBills = currentMonthBills.filter((bill) => bill.status === 'paid');
        
        const totalUnpaid = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);
        totalCollectedAmount = paidBills.reduce((sum, bill) => sum + bill.amount, 0);
        
        setRemainingToCollect(totalUnpaid);
        setTotalCollected(totalCollectedAmount);
        
        // Calculate collection rate
        const expected = totalExpected || 1;
        const rate = expected > 0 ? (totalCollectedAmount / expected) * 100 : 0;
        setCollectionRate(Math.min(100, Math.max(0, rate)));
        
        // Payment status chart data
        const paidAmount = totalCollectedAmount;
        const pendingAmount = currentMonthBills
          .filter((bill) => bill.status === 'pending')
          .reduce((sum, bill) => sum + bill.amount, 0);
        const unpaidAmount = currentMonthBills
          .filter((bill) => bill.status === 'unpaid')
          .reduce((sum, bill) => sum + bill.amount, 0);
        
        setPaymentStatusData([
          { label: t('paid'), value: paidAmount, color: '#10B981' }, // green
          { label: t('pending'), value: pendingAmount, color: '#F97316' }, // brightOrange
          { label: t('unpaid'), value: unpaidAmount, color: '#EF4444' }, // rose
        ]);
      }

      // Process expenses
      if (expensesResult.success && expensesResult.expenses) {
        // Filter expenses for current month (date format: "DD/MM/YYYY")
        const currentMonthExpenses = expensesResult.expenses.filter((expense: any) => {
          const expenseDate = parseDate(expense.date);
          const now = new Date();
          return (
            expenseDate.getMonth() === now.getMonth() &&
            expenseDate.getFullYear() === now.getFullYear()
          );
        });
        
        totalExpensesAmount = currentMonthExpenses.reduce(
          (sum: number, expense: any) => sum + expense.amount,
          0
        );
        setTotalExpenses(totalExpensesAmount);
      }

      // Calculate net balance and income vs expenses chart (using local variables)
      const net = totalCollectedAmount - totalExpensesAmount;
      setNetBalance(net);
      
      // Income vs Expenses chart data
      setIncomeExpenseData([
        { label: t('income'), value: totalCollectedAmount, color: '#10B981' }, // green
        { label: t('expenses'), value: totalExpensesAmount, color: '#EF4444' }, // rose
      ]);

      // Fetch upcoming meetings
      const meetingsResult = await getApartmentMeetings(apartmentId);
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
  }, [apartmentId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  return (
    <ScreenWrapper style={{ paddingTop: 0 }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        {/* Fixed Header Section - Top 1/3 of Screen */}
        <ImageBackground
          source={require('@/assets/images/dash_header.png')}
          style={[styles.headerBackground, { height: HEADER_HEIGHT + insets.top }]}
          resizeMode="cover"
        >
          <DashboardHeader
            apartmentName={apartmentName}
            currentBalance={currentBalance}
            remainingToCollect={remainingToCollect}
            loading={loading}
            headerHeight={HEADER_HEIGHT}
            insetsTop={insets.top}
          />
        </ImageBackground>

        {/* Scrollable Content Below Header */}
        <ScrollView
          style={[styles.scrollView, { backgroundColor: colors.screenBackground, marginTop: HEADER_HEIGHT + insets.top }]}
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
          {/* Upcoming Meetings Section - Top */}
          <UpcomingMeetings meetings={upcomingMeetings} />

          {/* Monthly Financial Summary Card */}
          <MonthlyFinancialSummary
            totalExpected={totalExpected}
            totalCollected={totalCollected}
            totalExpenses={totalExpenses}
            netBalance={netBalance}
            collectionRate={collectionRate}
            loading={loading}
          />

          {/* Charts Section */}
          {incomeExpenseData.length > 0 && paymentStatusData.length > 0 && paymentStatusData.some(d => d.value > 0) && (
            <View style={styles.section}>
              <FinancialSummaryChart
                collectionRate={collectionRate}
                incomeExpenseData={incomeExpenseData}
                paymentStatusData={paymentStatusData.filter(d => d.value > 0)}
                lastUpdated={new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              />
            </View>
          )}

        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackground: {
    width: '100%',
    justifyContent: 'flex-start',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    overflow: 'visible',
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
  monthlyCard: {
    borderRadius: radius._16,
    padding: spacingX._20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6},
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  monthlyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._12,
    marginBottom: spacingY._16,
  },
  monthlyCardTitle: {
    flex: 1,
  },
  progressBarContainer: {
    marginBottom: spacingY._20,
  },
  progressBarBg: {
    height: 24,
    borderRadius: radius._12,
    overflow: 'hidden',
    marginBottom: spacingY._12,
    flexDirection: 'row',
  },
  progressBarFill: {
    height: '100%',
  },
  progressPercentages: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  financialSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacingY._16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    marginHorizontal: spacingX._16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingY._16,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._5,
  },
  paymentsList: {
    gap: spacingY._12,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacingX._16,
    borderRadius: radius._12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  paymentItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._12,
    flex: 1,
  },
  paymentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmountContainer: {
    alignItems: 'flex-end',
    gap: spacingY._5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._5,
    paddingHorizontal: spacingX._8,
    paddingVertical: spacingY._5,
    borderRadius: radius._8,
  },
  statusText: {
    marginLeft: spacingX._3,
  },
});

