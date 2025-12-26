import Shimmer from '@/components/common/Shimmer';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import { CheckCircle, Clock, WarningCircle } from 'phosphor-react-native';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface PaymentStatusCardProps {
  monthlyFee: number;
  paymentStatus: 'paid' | 'pending' | 'unpaid';
  paymentDueDate?: string;
  loading: boolean;
}

export default function PaymentStatusCard({
  monthlyFee,
  paymentStatus,
  paymentDueDate,
  loading,
}: PaymentStatusCardProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  if (loading) {
    return (
      <View style={[styles.paymentStatusCard, { backgroundColor: colors.neutral800 }]}>
        <Shimmer width="100%" height={120} borderRadius={radius._16} />
      </View>
    );
  }

  if (paymentStatus === 'paid') {
    return (
      <View style={[styles.paymentStatusCard, { backgroundColor: colors.green }]}>
        <View style={styles.paymentStatusHeader}>
          <CheckCircle size={24} color={colors.white} weight="bold" />
          <Typo size={18} color={colors.white} fontWeight="600" style={styles.paymentStatusTitle}>
            {t('paymentCompleted')}
          </Typo>
        </View>
        <Typo size={32} color={colors.white} fontWeight="700" style={styles.paymentAmount}>
          {monthlyFee.toLocaleString()} MAD
        </Typo>
        <Typo size={14} color={colors.white} fontWeight="500" style={styles.paymentCompletedText}>
          {t('thankYouForPayment')}
        </Typo>
      </View>
    );
  }

  return (
    <View style={[styles.paymentStatusCard, { backgroundColor: colors.brightOrange }]}>
      <View style={styles.paymentStatusHeader}>
        <WarningCircle size={24} color={colors.white} weight="bold" />
        <Typo size={18} color={colors.white} fontWeight="600" style={styles.paymentStatusTitle}>
          {t('paymentRequired')}
        </Typo>
      </View>
      <Typo size={32} color={colors.white} fontWeight="700" style={styles.paymentAmount}>
        {monthlyFee.toLocaleString()} MAD
      </Typo>
      {paymentDueDate && (
        <View style={[styles.paymentDueInfo, { backgroundColor: colors.remainingPaymentBackground }]}>
          <Clock size={16} color={colors.white} weight="bold" />
          <Typo size={14} color={colors.white} fontWeight="500" style={styles.paymentDueText}>
            {paymentDueDate}
          </Typo>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});

