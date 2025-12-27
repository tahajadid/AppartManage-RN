import AppHeader from '@/components/AppHeader';
import DatePicker from '@/components/common/DatePicker';
import InfoModal from '@/components/common/InfoModal';
import TimePicker from '@/components/common/TimePicker';
import Input from '@/components/Input';
import MeetingTypeSelector, { MeetingType } from '@/components/meetings/MeetingTypeSelector';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { addMeeting } from '@/services/meetingService';
import { formatDate, formatDateForDisplay } from '@/utils/DateFormatHelper';
import { router } from 'expo-router';
import { Calendar, Clock } from 'phosphor-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddMeetingScreen() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { apartmentId } = useOnboarding();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [reason, setReason] = useState<string>('');
  const [place, setPlace] = useState<string>('');
  const [selectedType, setSelectedType] = useState<MeetingType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('12:00');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState<boolean>(false);

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
    setShowDatePicker(false);
  };

  const handleTimeChange = (newTime: string) => {
    setSelectedTime(newTime);
    setShowTimePicker(false);
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedType) {
      setError(t('meetingTypeRequired') || 'Please select a meeting type');
      return;
    }

    if (!reason.trim()) {
      setError(t('meetingReasonRequired') || 'Please enter a reason for the meeting');
      return;
    }

    if (!place.trim()) {
      setError(t('meetingPlaceRequired') || 'Please enter a place for the meeting');
      return;
    }

    if (!apartmentId) {
      setError(t('apartmentNotFound') || 'Apartment not found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dateStr = formatDate(selectedDate);
      const result = await addMeeting(
        apartmentId,
        reason.trim(),
        place.trim(),
        dateStr,
        selectedTime,
        selectedType
      );

      if (result.success) {
        setSuccessModalVisible(true);
      } else {
        setError(result.error || t('errorOccurred') || 'An error occurred, please try again');
      }
    } catch (err: any) {
      console.log('Error adding meeting:', err);
      setError(t('errorOccurred') || 'An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
        <AppHeader title={t('addMeeting') || 'Add Meeting'} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { direction: isRTL ? 'rtl' : 'ltr' },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Meeting Type Selector */}
            <View style={styles.section}>
              <MeetingTypeSelector
                selectedType={selectedType}
                onTypeSelect={(type) => {
                  setSelectedType(type);
                  setError(null);
                }}
              />
            </View>

            {/* Reason Input */}
            <View style={styles.section}>
              <Typo size={16} color={colors.titleText} fontWeight="600" style={styles.label}>
                {t('meetingReason') || 'Reason for Meeting'}
              </Typo>
              <Input
                placeholder={t('meetingReasonPlaceholder') || 'Enter reason for meeting'}
                value={reason}
                onChangeText={(text) => {
                  setReason(text);
                  setError(null);
                }}
                containerStyle={styles.inputContainer}
              />
            </View>

            {/* Place Input */}
            <View style={styles.section}>
              <Typo size={16} color={colors.titleText} fontWeight="600" style={styles.label}>
                {t('meetingPlace') || 'Place of Meeting'}
              </Typo>
              <Input
                placeholder={t('meetingPlacePlaceholder') || 'Enter place of meeting'}
                value={place}
                onChangeText={(text) => {
                  setPlace(text);
                  setError(null);
                }}
                containerStyle={styles.inputContainer}
              />
            </View>

            {/* Date Selection */}
            <View style={styles.section}>
              <Typo size={16} color={colors.titleText} fontWeight="600" style={styles.label}>
                {t('meetingDate') || 'Date of Meeting'}
              </Typo>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={[styles.dateButton, { backgroundColor: colors.neutral800, borderColor: colors.neutral700 }]}
                activeOpacity={0.7}
              >
                <Calendar size={20} color={colors.primary} weight="regular" />
                <Typo size={16} color={colors.text} fontWeight="500" style={styles.dateButtonText}>
                  {formatDateForDisplay(selectedDate)}
                </Typo>
              </TouchableOpacity>
            </View>

            {/* Time Selection */}
            <View style={styles.section}>
              <Typo size={16} color={colors.titleText} fontWeight="600" style={styles.label}>
                {t('meetingTime') || 'Time of Meeting'}
              </Typo>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={[styles.dateButton, { backgroundColor: colors.neutral800, borderColor: colors.neutral700 }]}
                activeOpacity={0.7}
              >
                <Clock size={20} color={colors.primary} weight="regular" />
                <Typo size={16} color={colors.text} fontWeight="500" style={styles.dateButtonText}>
                  {selectedTime}
                </Typo>
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Typo size={14} color={colors.redClose}>
                  {error}
                </Typo>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Submit Button - Outside KeyboardAvoidingView */}
        <View
          style={[
            styles.buttonContainer,
            { paddingBottom: insets.bottom + spacingY._10 },
          ]}
        >
          <PrimaryButton
            onPress={handleSubmit}
            backgroundColor={colors.primary}
            loading={loading}
            style={styles.submitButton}
          >
            <Typo size={16} color={colors.white} fontWeight="600">
              {t('addMeeting') || 'Add Meeting'}
            </Typo>
          </PrimaryButton>
        </View>

        {/* Date Picker Modal */}
        <DatePicker
          visible={showDatePicker}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          onClose={() => setShowDatePicker(false)}
        />

        {/* Time Picker Modal */}
        <TimePicker
          visible={showTimePicker}
          selectedTime={selectedTime}
          onTimeChange={handleTimeChange}
          onClose={() => setShowTimePicker(false)}
        />

        {/* Success Modal */}
        <InfoModal
          visible={successModalVisible}
          type="success"
          title={t('success') || 'Success'}
          message={t('meetingAdded') || 'Meeting added successfully'}
          onClose={() => {
            setSuccessModalVisible(false);
            router.back();
          }}
          showCancel={false}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: spacingY._20,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacingX._20,
    paddingBottom: spacingY._50,
  },
  section: {
    marginBottom: spacingY._24,
  },
  label: {
    marginBottom: spacingY._12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacingX._16,
    borderRadius: radius._10,
    borderWidth: 1,
    gap: spacingX._12,
  },
  dateButtonText: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: spacingY._8,
  },
  errorContainer: {
    marginTop: spacingY._8,
    marginBottom: spacingY._16,
  },
  buttonContainer: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._16,
    backgroundColor: 'transparent',
  },
  submitButton: {
    width: '100%',
  },
});

