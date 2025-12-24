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

interface TimePickerProps {
  visible: boolean;
  selectedTime: string; // "HH:mm" format
  onTimeChange: (time: string) => void;
  onClose: () => void;
}

export default function TimePicker({
  visible,
  selectedTime,
  onTimeChange,
  onClose,
}: TimePickerProps) {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { t } = useTranslation();

  // Parse selected time
  const [selectedHour, selectedMinute] = selectedTime.split(':').map(Number);
  const currentHour = selectedHour || 12;
  const currentMinute = selectedMinute || 0;

  // Generate hours (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  // Generate minutes (0, 15, 30, 45 for simplicity, or 0-59 for full range)
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleHourChange = (hour: number) => {
    const newTime = `${String(hour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    onTimeChange(newTime);
  };

  const handleMinuteChange = (minute: number) => {
    const newTime = `${String(currentHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    onTimeChange(newTime);
  };

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
              {t('selectTime') || 'Select Time'}
            </Typo>
            <TouchableOpacity onPress={onClose}>
              <Typo size={24} color={colors.subtitleText}>
                ×
              </Typo>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {/* Hour Selection */}
            <View style={styles.column}>
              <Typo size={14} color={colors.subtitleText} style={styles.label}>
                {t('hour') || 'Hour'}
              </Typo>
              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {hours.map((hour) => (
                  <TouchableOpacity
                    key={hour}
                    onPress={() => handleHourChange(hour)}
                    style={[
                      styles.item,
                      {
                        backgroundColor:
                          hour === currentHour ? colors.primary + '20' : 'transparent',
                      },
                    ]}
                  >
                    <Typo
                      size={16}
                      color={hour === currentHour ? colors.primary : colors.text}
                      fontWeight={hour === currentHour ? '600' : '400'}
                    >
                      {String(hour).padStart(2, '0')}
                    </Typo>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Minute Selection */}
            <View style={styles.column}>
              <Typo size={14} color={colors.subtitleText} style={styles.label}>
                {t('minute') || 'Minute'}
              </Typo>
              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {minutes.map((minute) => (
                  <TouchableOpacity
                    key={minute}
                    onPress={() => handleMinuteChange(minute)}
                    style={[
                      styles.item,
                      {
                        backgroundColor:
                          minute === currentMinute ? colors.primary + '20' : 'transparent',
                      },
                    ]}
                  >
                    <Typo
                      size={16}
                      color={minute === currentMinute ? colors.primary : colors.text}
                      fontWeight={minute === currentMinute ? '600' : '400'}
                    >
                      {String(minute).padStart(2, '0')}
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
    maxWidth: 300,
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

