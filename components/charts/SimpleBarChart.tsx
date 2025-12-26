import { radius, spacingX, spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Typo from '../Typo';

interface BarData {
  label: string;
  value: number;
  color: string;
}

interface SimpleBarChartProps {
  title: string;
  data: BarData[];
  maxValue?: number;
}

export default function SimpleBarChart({ title, data, maxValue }: SimpleBarChartProps) {
  const colors = useThemeColors();
  
  // Calculate max value from data if not provided
  const calculatedMax = maxValue || Math.max(...data.map(d => d.value), 1);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.neutral800 }]}>       
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const percentage = (item.value / calculatedMax) * 100;
          
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
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius._16,
    padding: spacingX._20,
    marginBottom: spacingY._16,
  },
  title: {
    marginBottom: spacingY._16,
  },
  chartContainer: {
    gap: spacingY._12,
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
});


