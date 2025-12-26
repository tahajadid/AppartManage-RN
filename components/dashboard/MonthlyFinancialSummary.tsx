import Shimmer from '@/components/common/Shimmer';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import { Receipt, TrendUp } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface MonthlyFinancialSummaryProps {
  totalExpected: number;
  totalCollected: number;
  totalExpenses: number;
  netBalance: number;
  collectionRate: number;
  loading: boolean;
}

export default function MonthlyFinancialSummary({
  totalExpected,
  totalCollected,
  totalExpenses,
  netBalance,
  collectionRate,
  loading,
}: MonthlyFinancialSummaryProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <View style={styles.section}>
      <View style={[styles.summaryCard, { backgroundColor: colors.neutral800 }]}>
        <View style={styles.summaryCardHeader}>
          <TrendUp size={24} color={colors.primary} weight="bold" />
          <Typo size={18} color={colors.titleText} fontWeight="600" style={styles.summaryCardTitle}>
            {t('monthlyFinancialSummary')}
          </Typo>
        </View>

        {/* separator */}
        <View style={{ height: spacingY._1, backgroundColor: colors.neutral700, marginBottom: spacingY._12 }} />

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <View style={styles.summaryItemHeader}>
              <Receipt size={16} color={colors.primary} weight="regular" />
              <Typo size={14} color={colors.subtitleText} fontWeight="400">
                {t('totalExpected')}
              </Typo>
            </View>
            {loading ? (
              <Shimmer width={120} height={24} borderRadius={radius._4} />
            ) : (
              <Typo size={20} color={colors.primary} fontWeight="700">
                {totalExpected.toLocaleString()} MAD
              </Typo>
            )}
          </View>

          <View style={styles.summaryItem}>
            <View style={styles.summaryItemHeader}>
              <Receipt size={16} color={colors.green} weight="regular" />
              <Typo size={14} color={colors.subtitleText} fontWeight="400">
                {t('totalCollected')}
              </Typo>
            </View>
            {loading ? (
              <Shimmer width={120} height={24} borderRadius={radius._4} />
            ) : (
              <Typo size={20} color={colors.green} fontWeight="700">
                {totalCollected.toLocaleString()} MAD
              </Typo>
            )}
          </View>

          <View style={styles.summaryItem}>
            <View style={styles.summaryItemHeader}>
              <Receipt size={16} color={colors.rose} weight="bold" />
              <Typo size={14} color={colors.subtitleText} fontWeight="400">
                {t('totalExpenses')}
              </Typo>
            </View>
            {loading ? (
              <Shimmer width={120} height={24} borderRadius={radius._4} />
            ) : (
              <Typo size={20} color={colors.rose} fontWeight="700">
                {totalExpenses.toLocaleString()} MAD
              </Typo>
            )}
          </View>

          <View style={styles.summaryItem}>
            <View style={styles.summaryItemHeader}>
              <TrendUp size={16} color={netBalance >= 0 ? colors.green : colors.rose} weight="bold" />
              <Typo size={14} color={colors.subtitleText} fontWeight="400">
                {t('netBalance')}
              </Typo>
            </View>
            {loading ? (
              <Shimmer width={120} height={24} borderRadius={radius._4} />
            ) : (
              <Typo size={20} color={netBalance >= 0 ? colors.green : colors.rose} fontWeight="700">
                {netBalance >= 0 ? '+' : ''}{netBalance.toLocaleString()} MAD
              </Typo>
            )}
          </View>
        </View>

        <View style={[styles.collectionRateContainer, { backgroundColor: colors.neutral700 }]}>
          <Typo size={14} color={colors.subtitleText} fontWeight="400">
            {t('collectionRate')}
          </Typo>
          {loading ? (
            <Shimmer width={80} height={20} borderRadius={radius._4} />
          ) : (
            <Typo size={18} color={colors.primary} fontWeight="700">
              {collectionRate.toFixed(1)}%
            </Typo>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacingY._24,
  },
  summaryCard: {
    borderRadius: radius._16,
    padding: spacingX._20,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._12,
    marginBottom: spacingY._20,
  },
  summaryCardTitle: {
    flex: 1,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacingX._16,
    marginBottom: spacingY._16,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    gap: spacingY._8,
  },
  summaryItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._8,
  },
  collectionRateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacingX._16,
    borderRadius: radius._12,
  },
});

