import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

interface DatePickerProps {
  visible: boolean;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onClose: () => void;
}

export default function DatePicker({
  visible,
  selectedDate,
  onDateChange,
  onClose,
}: DatePickerProps) {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { t } = useTranslation();

  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();
  const currentDay = selectedDate.getDate();

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(selectedDate);
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleYearChange = (year: number) => {
    const newDate = new Date(year, currentMonth, currentDay);
    onDateChange(newDate);
  };

  const handleMonthChange = (month: number) => {
    const maxDay = getDaysInMonth(new Date(currentYear, month, 1));
    const newDay = Math.min(currentDay, maxDay);
    const newDate = new Date(currentYear, month, newDay);
    onDateChange(newDate);
  };

  const handleDayChange = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    onDateChange(newDate);
  };

  const monthNames = [
    t('january') || 'Jan',
    t('february') || 'Feb',
    t('march') || 'Mar',
    t('april') || 'Apr',
    t('may') || 'May',
    t('june') || 'Jun',
    t('july') || 'Jul',
    t('august') || 'Aug',
    t('september') || 'Sep',
    t('october') || 'Oct',
    t('november') || 'Nov',
    t('december') || 'Dec',
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.neutral800 }]}>
          <View style={styles.header}>
            <Typo size={18} color={colors.titleText} fontWeight="700">
              {t('selectDate') || 'Select Date'}
            </Typo>
            <TouchableOpacity onPress={onClose}>
              <Typo size={24} color={colors.subtitleText}>
                ×
              </Typo>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {/* Year Selection */}
            <View style={styles.column}>
              <Typo size={14} color={colors.subtitleText} style={styles.label}>
                {t('year') || 'Year'}
              </Typo>
              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    onPress={() => handleYearChange(year)}
                    style={[
                      styles.item,
                      {
                        backgroundColor:
                          year === currentYear ? colors.primary + '20' : 'transparent',
                      },
                    ]}
                  >
                    <Typo
                      size={16}
                      color={year === currentYear ? colors.primary : colors.text}
                      fontWeight={year === currentYear ? '600' : '400'}
                    >
                      {year}
                    </Typo>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Month Selection */}
            <View style={styles.column}>
              <Typo size={14} color={colors.subtitleText} style={styles.label}>
                {t('month') || 'Month'}
              </Typo>
              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {months.map((month) => (
                  <TouchableOpacity
                    key={month}
                    onPress={() => handleMonthChange(month)}
                    style={[
                      styles.item,
                      {
                        backgroundColor:
                          month === currentMonth ? colors.primary + '20' : 'transparent',
                      },
                    ]}
                  >
                    <Typo
                      size={16}
                      color={month === currentMonth ? colors.primary : colors.text}
                      fontWeight={month === currentMonth ? '600' : '400'}
                    >
                      {monthNames[month]}
                    </Typo>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Day Selection */}
            <View style={styles.column}>
              <Typo size={14} color={colors.subtitleText} style={styles.label}>
                {t('day') || 'Day'}
              </Typo>
              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {days.map((day) => (
                  <TouchableOpacity
                    key={day}
                    onPress={() => handleDayChange(day)}
                    style={[
                      styles.item,
                      {
                        backgroundColor:
                          day === currentDay ? colors.primary + '20' : 'transparent',
                      },
                    ]}
                  >
                    <Typo
                      size={16}
                      color={day === currentDay ? colors.primary : colors.text}
                      fontWeight={day === currentDay ? '600' : '400'}
                    >
                      {day}
                    </Typo>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacingX._20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    borderRadius: radius._16,
    padding: spacingX._20,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingY._20,
  },
  grid: {
    flexDirection: 'row',
    gap: spacingX._12,
    height: 300,
  },
  column: {
    flex: 1,
  },
  label: {
    marginBottom: spacingY._8,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  item: {
    paddingVertical: spacingY._8,
    paddingHorizontal: spacingX._12,
    borderRadius: radius._8,
    marginBottom: spacingY._5,
    alignItems: 'center',
  },
});

