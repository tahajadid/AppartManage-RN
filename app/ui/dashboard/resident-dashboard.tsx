import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from '@/contexts/authContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { router } from 'expo-router';
import { ArrowRight, Bell, CheckCircle, Clock, WarningCircle } from 'phosphor-react-native';
import React from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock data for Resident Dashboard
const MOCK_DATA = {
  residentName: 'Ahmed Benali',
  monthlyFee: 500,
  paymentStatus: 'pending', // 'paid' | 'pending'
  paymentDueDate: '15 days remaining',
  paymentHistory: [
    {
      id: '1',
      amount: 500,
      date: 'October 2024',
      status: 'paid',
    },
    {
      id: '2',
      amount: 500,
      date: 'September 2024',
      status: 'paid',
    },
    {
      id: '3',
      amount: 500,
      date: 'August 2024',
      status: 'paid',
    },
    {
      id: '4',
      amount: 500,
      date: 'July 2024',
      status: 'paid',
    },
  ],
};

export default function ResidentDashboard() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const displayName = user?.name || MOCK_DATA.residentName;

  return (
    <ScreenWrapper>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.screenBackground }]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacingY._20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeHeader}>
            <View style={styles.welcomeTextContainer}>
              <Typo size={20} color={colors.subtitleText} fontWeight="400" style={styles.welcomeLabel}>
                Welcome
              </Typo>
              <Typo size={26} color={colors.titleText} fontWeight="700" style={styles.welcomeName}>
                {displayName}
              </Typo>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Bell size={28} color={colors.titleText} weight="regular" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Status Card */}
        <View style={styles.section}>
          {MOCK_DATA.paymentStatus === 'pending' ? (
            <View style={[styles.paymentStatusCard, { backgroundColor: colors.brightOrange }]}>
              <View style={styles.paymentStatusHeader}>
                <WarningCircle size={24} color={colors.white} weight="bold" />
                <Typo size={18} color={colors.white} fontWeight="600" style={styles.paymentStatusTitle}>
                  Payment Required
                </Typo>
              </View>
              <Typo size={32} color={colors.white} fontWeight="700" style={styles.paymentAmount}>
                {MOCK_DATA.monthlyFee.toLocaleString()} MAD
              </Typo>
              <View style={[styles.paymentDueInfo, {backgroundColor:colors.remainingPaymentBackground}]}>
                <Clock size={16} color={colors.white} weight="bold" />
                <Typo size={14} color={colors.white} fontWeight="500" style={styles.paymentDueText}>
                  {MOCK_DATA.paymentDueDate}
                </Typo>
              </View>
            </View>
          ) : (
            <View style={[styles.paymentStatusCard, { backgroundColor: colors.green }]}>
              <View style={styles.paymentStatusHeader}>
                <CheckCircle size={24} color={colors.white} weight="bold" />
                <Typo size={18} color={colors.white} fontWeight="600" style={styles.paymentStatusTitle}>
                  Payment Completed
                </Typo>
              </View>
              <Typo size={32} color={colors.white} fontWeight="700" style={styles.paymentAmount}>
                {MOCK_DATA.monthlyFee.toLocaleString()} MAD
              </Typo>
              <Typo size={14} color={colors.white} fontWeight="500" style={styles.paymentCompletedText}>
                Thank you for your payment this month
              </Typo>
            </View>
          )}
        </View>

        {/* Payment History Section */}
        <View style={styles.section}>
          <View style={styles.historyHeader}>
            <Typo size={20} color={colors.titleText} fontWeight="700">
              Payment History
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
            {MOCK_DATA.paymentHistory.map((payment) => (
              <View
                key={payment.id}
                style={[styles.paymentItem, { backgroundColor: colors.neutral900 }]}
              >
                <View style={styles.paymentItemContent}>
                  <View style={[styles.paymentIconContainer, { backgroundColor: `${colors.green}20` }]}>
                    <CheckCircle size={20} color={colors.green} weight="fill" />
                  </View>
                  <View style={styles.paymentInfo}>
                    <Typo size={16} color={colors.titleText} fontWeight="600">
                      Monthly Payment
                    </Typo>
                    <Typo size={12} color={colors.subtitleText}>
                      {payment.date}
                    </Typo>
                  </View>
                </View>
                <View style={styles.paymentAmountContainer}>
                  <Typo size={18} color={colors.green} fontWeight="700">
                    -{payment.amount.toLocaleString()} MAD
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._20,
  },
  section: {
    marginBottom: spacingY._24,
  },
  welcomeSection: {
    paddingVertical: spacingY._16,
    marginBottom: spacingY._16,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeLabel: {
    marginBottom: spacingY._5,
  },
  welcomeName: {
    marginTop: spacingY._5,
  },
  notificationButton: {
    padding: spacingX._8,
  },
  paymentStatusCard: {
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
  paymentStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._12,
    marginBottom: spacingY._16,
  },
  paymentStatusTitle: {
    flex: 1,
  },
  paymentAmount: {
    marginBottom: spacingY._12,
  },
  paymentDueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._8,
    paddingVertical: spacingY._8,
    paddingHorizontal: spacingX._12,
    borderRadius: radius._8,
  },
  paymentDueText: {
    flex: 1,
  },
  paymentCompletedText: {
    opacity: 0.9,
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
  paymentIconContainer: {
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

