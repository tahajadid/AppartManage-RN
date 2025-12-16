import AppHeader from '@/components/AppHeader';
import DatePicker from '@/components/common/DatePicker';
import ExpenseTypeSelector from '@/components/expenses/ExpenseTypeSelector';
import Input from '@/components/Input';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { addExpense, ExpenseType } from '@/services/expenseService';
import { formatDate, formatDateForDisplay } from '@/utils/DateFormatHelper';
import { router } from 'expo-router';
import { Calendar } from 'phosphor-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddExpenseScreen() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { apartmentId } = useOnboarding();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [selectedType, setSelectedType] = useState<ExpenseType | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTypeSelect = (type: ExpenseType) => {
    setSelectedType(type);
    setError(null);
  };

  const handleAmountChange = (text: string) => {
    // Only allow numbers and one decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return;
    }
    setAmount(cleaned);
    setError(null);
  };

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
    setShowDatePicker(false);
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedType) {
      setError(t('expenseTypeRequired') || 'Please select an expense type');
      return;
    }

    if (!amount.trim()) {
      setError(t('amountRequired') || 'Please enter an amount');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError(t('validAmountRequired') || 'Please enter a valid amount');
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
      const result = await addExpense(
        apartmentId,
        selectedType,
        amountNum,
        dateStr,
        description.trim() || undefined
      );

      if (result.success) {
        Alert.alert(
          t('success') || 'Success',
          t('expenseAdded') || 'Expense added successfully',
          [
            {
              text: t('ok') || 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        setError(result.error || t('errorOccurred') || 'An error occurred, please try again');
      }
    } catch (err: any) {
      console.log('Error adding expense:', err);
      setError(t('errorOccurred') || 'An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
        <AppHeader title={t('addExpense') || 'Add Expense'} />

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
            {/* Expense Type Selection */}
            <ExpenseTypeSelector
              selectedType={selectedType}
              onTypeSelect={handleTypeSelect}
            />

            {/* Date Selection */}
            <View style={styles.section}>
              <Typo size={16} color={colors.titleText} fontWeight="600" style={styles.label}>
                {t('expenseDate') || 'Expense Date'}
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

            {/* Amount Input */}
            <View style={styles.section}>
              <Typo size={16} color={colors.titleText} fontWeight="600" style={styles.label}>
                {t('amountLabel')}
              </Typo>
              <Input
                placeholder={t('enterAmount') || 'Enter amount'}
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="decimal-pad"
                containerStyle={styles.inputContainer}
              />
            </View>

            {/* Description Input (Optional) */}
            <View style={styles.section}>
              <Typo size={16} color={colors.titleText} fontWeight="600" style={styles.label}>
                {t('description') || 'Description'} {t('optional')}
              </Typo>
              <Input
                placeholder={t('enterDescription') || 'Enter description (optional)'}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                containerStyle={StyleSheet.flatten([styles.inputContainer, styles.descriptionInput])}
                inputStyle={styles.descriptionInputText}
              />
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
              {t('addExpense') || 'Add Expense'}
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
  descriptionInput: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingTop: spacingY._12,
  },
  descriptionInputText: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  inputContainer: {
    marginBottom: spacingY._8,
  },
  hint: {
    marginTop: spacingY._5,
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

