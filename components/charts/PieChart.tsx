import { radius, spacingX, spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Typo from '../Typo';

interface PieData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  title: string;
  data: PieData[];
}

export default function PieChart({ title, data }: PieChartProps) {
  const colors = useThemeColors();
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate angles for pie segments
  let currentAngle = -90; // Start from top
  const segments = data.map((item) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    
    return {
      ...item,
      percentage,
      startAngle,
      angle,
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral800 }]}>
      <Typo size={18} color={colors.titleText} fontWeight="600" style={styles.title}>
        {title}
      </Typo>
      
      <View style={styles.chartContainer}>
        {/* Simple visual representation using bars */}
        <View style={styles.barsContainer}>
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            
            return (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                <View style={styles.legendContent}>
                  <Typo size={14} color={colors.titleText} fontWeight="500">
                    {item.label}
                  </Typo>
                  <View style={styles.legendDetails}>
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
        
        {/* Visual pie representation using stacked bars */}
        <View style={[styles.pieVisual, { backgroundColor: colors.neutral300 }]}>
          {segments.map((segment, index) => (
            <View
              key={index}
              style={[
                styles.pieSegment,
                {
                  backgroundColor: segment.color,
                  width: `${segment.percentage}%`,
                },
              ]}
            />
          ))}
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
  title: {
    marginBottom: spacingY._16,
  },
  chartContainer: {
    gap: spacingY._16,
  },
  barsContainer: {
    gap: spacingY._12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._12,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendDetails: {
    flexDirection: 'row',
    gap: spacingX._8,
    alignItems: 'center',
  },
  pieVisual: {
    height: 24,
    borderRadius: radius._12,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  pieSegment: {
    height: '100%',
  },
});


