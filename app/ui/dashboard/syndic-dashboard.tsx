import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { router } from 'expo-router';
import { ArrowRight, Bell, CheckCircle, Clock, Receipt, TrendUp } from 'phosphor-react-native';
import React from 'react';
import {
  Dimensions,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT / 3;

// Mock data for Syndic Dashboard
const MOCK_DATA = {
  apartmentName: 'Residence Al Andalous',
  unreadNotifications: 3,
  currentBalance: 3600,
  totalExpectedThisMonth: 4800,
  totalExpensesThisMonth: 1200,
  paidAmount: 3600,
  unpaidAmount: 1200,
  paidPercentage: 75,
  unpaidPercentage: 25,
  lastPayments: [
    {
      id: '1',
      residentName: 'Ahmed Benali',
      amount: 500,
      date: '2 hours ago',
      status: 'paid',
    },
    {
      id: '2',
      residentName: 'Fatima Alami',
      amount: 400,
      date: 'Yesterday',
      status: 'paid',
    },
    {
      id: '3',
      residentName: 'Mohamed Tazi',
      amount: 300,
      date: '2 days ago',
      status: 'paid',
    },
    {
      id: '4',
      residentName: 'Sara Idrissi',
      amount: 450,
      date: '3 days ago',
      status: 'paid',
    },
    {
      id: '5',
      residentName: 'Youssef Alaoui',
      amount: 350,
      date: '5 days ago',
      status: 'paid',
    },
  ],
};

export default function SyndicDashboard() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const insets = useSafeAreaInsets();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Fixed Header Section - Top 1/3 of Screen */}
        <ImageBackground
          source={require('@/assets/images/background_home.png')}
          style={[styles.headerBackground, { height: HEADER_HEIGHT }]}
          resizeMode="cover"
        >
          {/* Gradient Overlay for readability */}
          <View style={styles.headerOverlay}>
            {/* Top Row: Apartment Name and Notification */}
            <View style={[styles.headerTopRow, { paddingTop: insets.top }]}>
              <Typo size={18} color={colors.white} fontWeight="700">
                {MOCK_DATA.apartmentName}
              </Typo>
              <TouchableOpacity style={styles.notificationButton}>
                <Bell size={28} color={colors.white} weight="regular" />
                {MOCK_DATA.unreadNotifications > 0 && (
                  <View style={[styles.notificationBadge, { backgroundColor: colors.rose }]}>
                    <Typo size={10} color={colors.white} fontWeight="700">
                      {MOCK_DATA.unreadNotifications > 9 ? '9+' : MOCK_DATA.unreadNotifications}
                    </Typo>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Center Content: Balance */}
            <View style={styles.headerBalanceContent}>
              <Typo size={16} color={colors.white} fontWeight="500" style={styles.balanceLabel}>
                Current Balance
              </Typo>
              <Typo size={48} color={colors.white} fontWeight="700" style={styles.balanceAmount}>
                {MOCK_DATA.currentBalance.toLocaleString()} MAD
              </Typo>
              <View style={[styles.remainingContainer,{backgroundColor:colors.remainingPaymentBackground}]}>
                <Clock size={16} color={colors.brightOrange} weight="bold" />
                <Typo size={14} color={colors.white} fontWeight="500" style={styles.remainingText}>
                  Remaining to collect this month: {MOCK_DATA.unpaidAmount.toLocaleString()} MAD
                </Typo>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Scrollable Content Below Header */}
        <ScrollView
          style={[styles.scrollView, { backgroundColor: colors.screenBackground }]}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacingY._20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Monthly Progress / Expense Card */}
          <View style={styles.section}>
            <View style={[styles.monthlyCard, { backgroundColor: colors.neutral900 }]}>
              <View style={styles.monthlyCardHeader}>
                <TrendUp size={24} color={colors.primary} weight="bold" />
                <Typo size={18} color={colors.titleText} fontWeight="600" style={styles.monthlyCardTitle}>
                  Monthly Financial Overview
                </Typo>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarBg, { backgroundColor: colors.neutral300 }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${MOCK_DATA.paidPercentage}%`,
                        backgroundColor: colors.green,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${MOCK_DATA.unpaidPercentage}%`,
                        backgroundColor: colors.brightOrange,
                      },
                    ]}
                  />
                </View>
                <View style={styles.progressPercentages}>
                  <Typo size={20} color={colors.green} fontWeight="700">
                    {MOCK_DATA.paidPercentage}% Paid
                  </Typo>
                  <Typo size={20} color={colors.brightOrange} fontWeight="700">
                    {MOCK_DATA.unpaidPercentage}% Not Paid
                  </Typo>
                </View>
              </View>

              {/* Financial Summary */}
              <View style={styles.financialSummary}>
                <View style={styles.summaryItem}>
                  <View style={styles.summaryItemHeader}>
                    <Receipt size={16} color={colors.primary} weight="regular" />
                    <Typo size={14} color={colors.subtitleText} fontWeight="400">
                      Total Expected
                    </Typo>
                  </View>
                  <Typo size={20} color={colors.primary} fontWeight="700">
                    {MOCK_DATA.totalExpectedThisMonth.toLocaleString()} MAD
                  </Typo>
                </View>
                <View style={[styles.summaryDivider,{backgroundColor:colors.neutral300}]} />
                <View style={styles.summaryItem}>
                  <View style={styles.summaryItemHeader}>
                    <Receipt size={16} color={colors.rose} weight="bold" />
                    <Typo size={14} color={colors.subtitleText} fontWeight="400">
                      Total Expenses
                    </Typo>
                  </View>
                  <Typo size={20} color={colors.rose} fontWeight="700">
                    {MOCK_DATA.totalExpensesThisMonth.toLocaleString()} MAD
                  </Typo>
                </View>
              </View>
            </View>
          </View>

          {/* Last Payments History */}
          <View style={styles.section}>
            <View style={styles.historyHeader}>
              <Typo size={20} color={colors.titleText} fontWeight="700">
                Last Payments
              </Typo>
              <TouchableOpacity
                onPress={() => router.push('/(home)/payments' as any)}
                style={styles.seeAllButton}
              >
                <Typo size={14} color={colors.primary} fontWeight="600">
                  See All
                </Typo>
                <ArrowRight size={16} color={colors.primary} weight="bold" />
              </TouchableOpacity>
            </View>

            <View style={styles.paymentsList}>
              {MOCK_DATA.lastPayments.map((payment) => (
                <View
                  key={payment.id}
                  style={[styles.paymentItem, { backgroundColor: colors.neutral900 }]}
                >
                  <View style={styles.paymentItemContent}>
                    <View style={[styles.paymentAvatar, { backgroundColor: colors.primary }]}>
                      <Typo size={16} color={colors.white} fontWeight="600">
                        {payment.residentName.charAt(0)}
                      </Typo>
                    </View>
                    <View style={styles.paymentInfo}>
                      <Typo size={16} color={colors.titleText} fontWeight="600">
                        {payment.residentName}
                      </Typo>
                      <Typo size={12} color={colors.subtitleText}>
                        {payment.date}
                      </Typo>
                    </View>
                  </View>
                  <View style={styles.paymentAmountContainer}>
                    <Typo size={18} color={colors.green} fontWeight="700">
                      +{payment.amount.toLocaleString()} MAD
                    </Typo>
                    <View style={[styles.statusBadge, { backgroundColor: `${colors.green}20` }]}>
                      <CheckCircle size={12} color={colors.green} weight="fill" />
                      <Typo size={10} color={colors.green} fontWeight="600" style={styles.statusText}>
                        Paid
                      </Typo>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
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
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: spacingX._20,
    justifyContent: 'space-between',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingY._24,
  },
  notificationButton: {
    position: 'relative',
    padding: spacingX._8,
  },
  notificationBadge: {
    position: 'absolute',
    top: spacingY._5,
    right: spacingY._5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacingX._5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerBalanceContent: {
    paddingBottom: spacingY._24,
  },
  balanceLabel: {
    marginBottom: spacingY._8,
    opacity: 0.9,
  },
  balanceAmount: {
    marginBottom: spacingY._16,
  },
  remainingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._8,
    paddingVertical: spacingY._8,
    paddingHorizontal: spacingX._12,
    borderRadius: radius._8,
  },
  remainingText: {
    flex: 1,
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
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
  summaryItem: {
    flex: 1,
    gap: spacingY._5,
  },
  summaryItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._5,
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

