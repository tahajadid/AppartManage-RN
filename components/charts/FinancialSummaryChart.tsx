import { radius, spacingX, spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Typo from '../Typo';

interface IncomeExpenseData {
  label: string;
  value: number;
  color: string;
}

interface PaymentStatusData {
  label: string;
  value: number;
  color: string;
}

interface FinancialSummaryChartProps {
  collectionRate: number;
  incomeExpenseData: IncomeExpenseData[];
  paymentStatusData: PaymentStatusData[];
  lastUpdated?: string;
}

export default function FinancialSummaryChart({
  collectionRate,
  incomeExpenseData,
  paymentStatusData,
  lastUpdated,
}: FinancialSummaryChartProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  // Calculate max value for income/expenses bars
  const maxIncomeExpense = Math.max(...incomeExpenseData.map(d => d.value), 1);
  
  // Calculate total for payment status
  const totalPaymentStatus = paymentStatusData.reduce((sum, item) => sum + item.value, 0);

  // Circular progress calculation
  const size = 120;
  const strokeWidth = 12;
  const progressPercentage = Math.min(100, Math.max(0, collectionRate));
  const radius = (size - strokeWidth) / 2;
  
  // Calculate rotation angles for the progress
  const progressAngle = (progressPercentage / 100) * 360;

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral800 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Typo size={18} color={colors.titleText} fontWeight="600">
          {t('monthlyFinancialSummary')}
        </Typo>
        {lastUpdated && (
          <Typo size={12} color={colors.subtitleText} fontWeight="400">
            {t('lastUpdated')}: {lastUpdated}
          </Typo>
        )}
      </View>

      {/* Separator */}
      <View style={[styles.separator, { backgroundColor: colors.neutral700 }]} />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Left: Circular Progress */}
        <View style={styles.progressContainer}>
          <View style={[styles.circularProgressWrapper, { width: size, height: size }]}>
            {/* Background circle */}
            <View
              style={[
                styles.circleBackground,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: strokeWidth,
                  borderColor: colors.neutral300,
                },
              ]}
            />
            
            {/* Progress ring using two half-circles technique */}
            <View style={[styles.progressRingContainer, { width: size, height: size, overflow: 'hidden' }]}>
              {/* Left half circle - always shows when progress > 50% */}
              <View
                style={[
                  styles.halfCircle,
                  {
                    position: 'absolute',
                    left: 0,
                    width: size / 2,
                    height: size,
                    borderTopLeftRadius: size / 2,
                    borderBottomLeftRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: progressPercentage > 50 ? colors.primary : colors.neutral300,
                    borderRightWidth: 0,
                  },
                ]}
              />
              
              {/* Right half circle - rotates to show progress */}
              <View
                style={[
                  styles.halfCircle,
                  {
                    position: 'absolute',
                    right: 0,
                    width: size / 2,
                    height: size,
                    borderTopRightRadius: size / 2,
                    borderBottomRightRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: colors.primary,
                    borderLeftWidth: 0,
                    transform: [
                      { rotate: progressPercentage > 50 ? `${progressAngle - 180}deg` : `${progressAngle}deg` },
                    ],
                    transformOrigin: 'left center',
                  },
                ]}
              />
              
              {/* Mask for right half when progress <= 50% */}
              {progressPercentage <= 50 && (
                <View
                  style={[
                    styles.progressMask,
                    {
                      position: 'absolute',
                      width: size,
                      height: size,
                      backgroundColor: colors.neutral800,
                      transform: [{ rotate: `${progressAngle}deg` }],
                      transformOrigin: 'center center',
                    },
                  ]}
                />
              )}
            </View>
            
            {/* Inner circle to create the ring effect */}
            <View
              style={[
                styles.innerCircle,
                {
                  width: size - strokeWidth * 2,
                  height: size - strokeWidth * 2,
                  borderRadius: (size - strokeWidth * 2) / 2,
                  backgroundColor: colors.neutral800,
                },
              ]}
            />
            
            {/* Center text */}
            <View style={styles.progressTextContainer}>
              <Typo size={32} color={colors.titleText} fontWeight="700">
                {progressPercentage.toFixed(0)}%
              </Typo>
              <Typo size={14} color={colors.subtitleText} fontWeight="500">
                {t('collected')}
              </Typo>
            </View>
          </View>
        </View>

        {/* Right: Income and Expenses Bars */}
        <View style={styles.barsContainer}>
          {incomeExpenseData.map((item, index) => {
            const percentage = (item.value / maxIncomeExpense) * 100;
            
            return (
              <View key={index} style={styles.barItem}>
                <View style={styles.barLabelRow}>
                  <Typo size={14} color={colors.subtitleText} fontWeight="500">
                    {item.label}
                  </Typo>
                  <Typo size={14} color={colors.titleText} fontWeight="600">
                    {item.value.toLocaleString()} MAD
                  </Typo>
                </View>
                <View style={[styles.barContainer, { backgroundColor: colors.neutral300 }]}>
                  <View
                    style={[
                      styles.bar,
                      {
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Payment Status Section */}
      <View style={styles.paymentStatusSection}>
        <Typo size={18} color={colors.titleText} fontWeight="600" style={styles.paymentStatusTitle}>
          {t('paymentStatus')}
        </Typo>
        
        {/* Payment Status List */}
        <View style={styles.paymentStatusList}>
          {paymentStatusData.map((item, index) => {
            const percentage = totalPaymentStatus > 0 ? (item.value / totalPaymentStatus) * 100 : 0;
            
            return (
              <View key={index} style={styles.paymentStatusItem}>
                <View style={[styles.colorCircle, { backgroundColor: item.color }]} />
                <View style={styles.paymentStatusContent}>
                  <Typo size={14} color={colors.titleText} fontWeight="500">
                    {item.label}
                  </Typo>
                  <View style={styles.paymentStatusDetails}>
                    <Typo size={12} color={colors.subtitleText}>
                      {item.value.toLocaleString()} MAD
                    </Typo>
                    <Typo size={12} color={colors.subtitleText} fontWeight="600">
                      ({percentage.toFixed(1)}%)
                    </Typo>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Segmented Bar */}
        <View style={[styles.segmentedBar, { backgroundColor: colors.neutral300 }]}>
          {paymentStatusData.map((item, index) => {
            const percentage = totalPaymentStatus > 0 ? (item.value / totalPaymentStatus) * 100 : 0;
            
            return (
              <View
                key={index}
                style={[
                  styles.segment,
                  {
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                  },
                ]}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius._16,
    padding: spacingX._20,
    marginBottom: spacingY._16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingY._16,
  },
  separator: {
    height: spacingY._1,
    marginBottom: spacingY._16,
  },
  content: {
    flexDirection: 'row',
    gap: spacingX._20,
    marginBottom: spacingY._24,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBackground: {
    position: 'absolute',
    borderStyle: 'solid',
  },
  progressRingContainer: {
    position: 'absolute',
  },
  halfCircle: {
    top: 0,
  },
  progressMask: {
    top: 0,
    left: 0,
  },
  innerCircle: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  barsContainer: {
    flex: 1,
    gap: spacingY._12,
    justifyContent: 'center',
  },
  barItem: {
    gap: spacingY._8,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barContainer: {
    height: 24,
    borderRadius: radius._12,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: radius._12,
  },
  paymentStatusSection: {
    gap: spacingY._12,
  },
  paymentStatusTitle: {
    marginBottom: spacingY._8,
  },
  paymentStatusList: {
    gap: spacingY._10,
  },
  paymentStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._12,
  },
  colorCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  paymentStatusContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentStatusDetails: {
    flexDirection: 'row',
    gap: spacingX._8,
    alignItems: 'center',
  },
  segmentedBar: {
    height: 24,
    borderRadius: radius._12,
    flexDirection: 'row',
    overflow: 'hidden',
    marginTop: spacingY._8,
  },
  segment: {
    height: '100%',
  },
});

