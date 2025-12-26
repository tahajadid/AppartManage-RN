import EmptyState from '@/components/common/EmptyState';
import Shimmer from '@/components/common/Shimmer';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import { Bill } from '@/services/paymentService';
import { RemainingPayment } from '@/data/types';
import { router } from 'expo-router';
import { ArrowRight, CheckCircle, Clock, XCircle } from 'phosphor-react-native';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type PaymentItem = 
  | { type: 'bill'; data: Bill }
  | { type: 'remaining'; data: RemainingPayment };

interface PaymentHistoryProps {
  payments: PaymentItem[];
  limit?: number;
  loading?: boolean;
}

export default function PaymentHistory({ payments, limit = 4, loading = false }: PaymentHistoryProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  const displayPayments = payments.slice(0, limit);

  const formatDate = (dateStr: string): string => {
    // Convert "MM-YYYY" to "Month YYYY"
    const [month, year] = dateStr.split('-');
    const monthNames = [
      t('january'),
      t('february'),
      t('march'),
      t('april'),
      t('may'),
      t('june'),
      t('july'),
      t('august'),
      t('september'),
      t('october'),
      t('november'),
      t('december'),
    ];
    const monthIndex = parseInt(month) - 1;
    return `${monthNames[monthIndex]} ${year}`;
  };

  const formatRemainingPaymentDate = (dateStr: string): string => {
    // Format ISO date string to "DD Month YYYY"
    const date = new Date(dateStr);
    const day = date.getDate();
    const monthNames = [
      t('january'),
      t('february'),
      t('march'),
      t('april'),
      t('may'),
      t('june'),
      t('july'),
      t('august'),
      t('september'),
      t('october'),
      t('november'),
      t('december'),
    ];
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    return `${day} ${monthNames[monthIndex]} ${year}`;
  };

  return (
    <View style={styles.section}>
      <View style={styles.historyHeader}>
        <Typo size={20} color={colors.titleText} fontWeight="700">
          {t('paymentHistory')}
        </Typo>
        <TouchableOpacity
          onPress={() => router.push('/(home)/payments' as any)}
          style={styles.seeAllButton}
        >
          <Typo size={14} color={colors.primary} fontWeight="600">
            {t('seeAll')}
          </Typo>
          <ArrowRight size={16} color={colors.primary} weight="bold" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.paymentsList}>
          {Array.from({ length: limit }).map((_, index) => (
            <View
              key={`shimmer-${index}`}
              style={[styles.paymentItem, { backgroundColor: colors.neutral800 }]}
            >
              <View style={styles.paymentItemContent}>
                <Shimmer width={48} height={48} borderRadius={24} />
                <View style={styles.paymentInfo}>
                  <Shimmer width={120} height={16} borderRadius={radius._8} style={{ marginBottom: spacingY._5 }} />
                  <Shimmer width={80} height={12} borderRadius={radius._8} />
                </View>
              </View>
              <View style={styles.paymentAmountContainer}>
                <Shimmer width={100} height={18} borderRadius={radius._8} style={{ marginBottom: spacingY._5 }} />
                <Shimmer width={70} height={24} borderRadius={radius._8} />
              </View>
            </View>
          ))}
        </View>
      ) : displayPayments.length === 0 ? (
        <EmptyState message={t('noPayments')} />
      ) : (
        <View style={styles.paymentsList}>
          {displayPayments.map((paymentItem, index) => {
            const isBill = paymentItem.type === 'bill';
            const payment = isBill ? paymentItem.data : paymentItem.data;
            const isPaid = payment.status === 'paid';
            const isPending = payment.status === 'pending';
            const statusColor = isPaid ? colors.green : isPending ? colors.brightOrange : colors.rose;
            const StatusIcon = isPaid ? CheckCircle : isPending ? Clock : XCircle;
            
            // Get payment type label and date
            const paymentTypeLabel = isBill ? t('monthlyBill') : t('remainingPayment');
            const paymentDate = isBill 
              ? formatDate(paymentItem.data.date)
              : formatRemainingPaymentDate(paymentItem.data.createdAt);
            
            // Get unique key
            const uniqueKey = isBill 
              ? `bill-${paymentItem.data.date}-${index}`
              : `remaining-${paymentItem.data.id}-${index}`;
            
            return (
              <View
                key={uniqueKey}
                style={[styles.paymentItem, { backgroundColor: colors.neutral800 }]}
              >
                <View style={styles.paymentItemContent}>
                  <View style={[styles.paymentIconContainer, { backgroundColor: `${statusColor}20` }]}>
                    <StatusIcon size={20} color={statusColor} weight="fill" />
                  </View>
                  <View style={styles.paymentInfo}>
                    <Typo size={16} color={colors.titleText} fontWeight="600">
                      {paymentTypeLabel}
                    </Typo>
                    <Typo size={12} color={colors.subtitleText}>
                      {paymentDate}
                    </Typo>
                  </View>
                </View>
                <View style={styles.paymentAmountContainer}>
                  <Typo size={18} color={statusColor} fontWeight="700">
                    -{payment.amount.toLocaleString()} MAD
                  </Typo>
                  <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                    <StatusIcon size={12} color={statusColor} weight="fill" />
                    <Typo size={10} color={statusColor} fontWeight="600" style={styles.statusText}>
                      {t(payment.status)}
                    </Typo>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacingY._24,
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

