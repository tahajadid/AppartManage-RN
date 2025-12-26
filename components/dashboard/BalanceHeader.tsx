import Shimmer from '@/components/common/Shimmer';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import { Clock } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface BalanceHeaderProps {
  currentBalance: number;
  remainingToCollect: number;
  loading: boolean;
}

export default function BalanceHeader({
  currentBalance,
  remainingToCollect,
  loading,
}: BalanceHeaderProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <View style={styles.headerBalanceContent}>
      <Typo size={16} color={colors.white} fontWeight="500" style={styles.balanceLabel}>
        {t('currentBalance')}
      </Typo>
      {loading ? (
        <Shimmer width={180} height={56} borderRadius={radius._8} style={styles.balanceAmount} />
      ) : (
        <View style={styles.balanceAmount}>
          <Typo size={48} color={colors.white} fontWeight="700">
            {currentBalance.toLocaleString()}
          </Typo>
          <Typo size={20} color={colors.white} fontWeight="500" style={styles.currencyText}>
            {' '}MAD
          </Typo>
        </View>
      )}
      <View style={[styles.remainingContainer, { backgroundColor: colors.remainingPaymentBackground }]}>
        <Clock size={16} color={colors.brightOrange} weight="bold" />
        {loading ? (
          <Shimmer width={250} height={18} borderRadius={radius._4} style={{ flex: 1 }} />
        ) : (
          <Typo size={14} color={colors.white} fontWeight="500" style={styles.remainingText}>
            {t('remainingToCollectThisMonth')}: {remainingToCollect.toLocaleString()} MAD
          </Typo>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBalanceContent: {
    paddingBottom: spacingY._24,
  },
  balanceLabel: {
    marginBottom: spacingY._4,
    opacity: 0.9,
  },
  balanceAmount: {
    marginBottom: spacingY._16,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencyText: {
    marginLeft: spacingX._3,
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
});

