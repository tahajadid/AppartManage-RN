import AppHeader from '@/components/AppHeader';
import DatePicker from '@/components/common/DatePicker';
import InfoModal from '@/components/common/InfoModal';
import ExpenseTypeSelector from '@/components/expenses/ExpenseTypeSelector';
import Input from '@/components/Input';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { ExpenseType, getApartmentExpenses, updateExpense } from '@/services/expenseService';
import { formatDate, formatDateForDisplay, parseDate } from '@/utils/DateFormatHelper';
import { scale } from '@/utils/styling';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Calendar } from 'phosphor-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ExpenseEditScreen() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { apartmentId } = useOnboarding();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();

  const [expense, setExpense] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [successModalVisible, setSuccessModalVisible] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Form state
  const [selectedType, setSelectedType] = useState<ExpenseType | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Refs for scrolling
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (apartmentId && expenseId) {
      loadExpense();
    } else {
      setLoading(false);
      setError('Expense ID or apartment ID not found');
    }
  }, [apartmentId, expenseId]);

  useFocusEffect(
    useCallback(() => {
      if (apartmentId && expenseId) {
        loadExpense();
      }
    }, [apartmentId, expenseId])
  );

  const loadExpense = async () => {
    if (!apartmentId || !expenseId) return;

    setLoading(true);
    setError(null);

    try {
      const expensesResult = await getApartmentExpenses(apartmentId);
      
      if (!expensesResult.success) {
        setError(expensesResult.error || 'Failed to load expense');
        setLoading(false);
        return;
      }

      const foundExpense = expensesResult.expenses?.find((exp) => exp.id === expenseId);

      if (!foundExpense) {
        setError('Expense not found');
        setLoading(false);
        return;
      }

      setExpense(foundExpense);
      setSelectedType(foundExpense.type);
      setAmount(foundExpense.amount.toString());
      setDescription(foundExpense.description || '');
      setSelectedDate(parseDate(foundExpense.date));
    } catch (err: any) {
      console.log('Error loading expense:', err);
      setError('An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleSave = async () => {
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

    if (!apartmentId || !expenseId) {
      setError(t('apartmentNotFound') || 'Apartment not found');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const dateStr = formatDate(selectedDate);
      const result = await updateExpense(
        apartmentId,
        expenseId,
        {
          type: selectedType,
          amount: amountNum,
          date: dateStr,
          description: description.trim() || undefined,
        }
      );

      if (result.success) {
        setSuccessModalVisible(true);
      } else {
        setError(result.error || t('errorOccurred') || 'An error occurred, please try again');
      }
    } catch (err: any) {
      console.log('Error updating expense:', err);
      setError(t('errorOccurred') || 'An error occurred, please try again');
    } finally {
      setSaving(false);
    }
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

  const handleSuccessClose = () => {
    setSuccessModalVisible(false);
    router.back();
  };

  const renderContent = () => (
    <>
      {error && (
        <View style={styles.errorContainer}>
          <Typo size={14} color={colors.redClose}>
            {error}
          </Typo>
        </View>
      )}

      {/* Expense Type Selection */}
      <ExpenseTypeSelector
        selectedType={selectedType}
        onTypeSelect={(type) => {
          setSelectedType(type);
          setError(null);
        }}
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
      <View style={{marginBottom: scale(100)}}>
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
          onFocus={() => {
            // Scroll to end to show description field above keyboard
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, Platform.OS === 'ios' ? 300 : 100);
          }}
        />
      </View>
    </>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
          <AppHeader title={t('edit') || 'Edit Expense'} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  if (error && !expense) {
    return (
      <ScreenWrapper>
        <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
          <AppHeader title={t('edit') || 'Edit Expense'} />
          <View style={styles.errorContainer}>
            <Typo size={16} color={colors.redClose}>
              {error}
            </Typo>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  if (!expense) {
    return null;
  }

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
        <AppHeader title={t('edit') || 'Edit Expense'} />

        <View style={styles.contentWrapper}>
          {Platform.OS === 'ios' ? (
            <KeyboardAvoidingView
              behavior="padding"
              style={styles.keyboardView}
              keyboardVerticalOffset={0}
            >
              <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={[
                  styles.scrollContent,
                  { direction: isRTL ? 'rtl' : 'ltr' },
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
              >
                {renderContent()}
              </ScrollView>
            </KeyboardAvoidingView>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={[
                styles.scrollContent,
                { direction: isRTL ? 'rtl' : 'ltr' },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
              {renderContent()}
            </ScrollView>
          )}
        </View>

        {/* Fixed Action Buttons at Bottom */}
        <View style={[styles.fixedButtons, { 
          backgroundColor: colors.screenBackground,
          paddingBottom: insets.bottom + spacingY._16 
        }]}>
          <TouchableOpacity
            onPress={handleCancel}
            style={[styles.cancelButton, { backgroundColor: colors.neutral600 }]}
            activeOpacity={0.7}
          >
            <Typo size={16} color={colors.text} fontWeight="600">
              {t('cancel') || 'Cancel'}
            </Typo>
          </TouchableOpacity>
          <PrimaryButton
            onPress={handleSave}
            backgroundColor={colors.primary}
            loading={saving}
            style={styles.saveButton}
          >
            <Typo size={16} color={colors.white} fontWeight="600">
              {t('saveChanges') || 'Save Changes'}
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

        {/* Success Modal */}
        <InfoModal
          visible={successModalVisible}
          type="success"
          title={t('success') || 'Success'}
          message={t('expenseUpdated') || 'Expense updated successfully'}
          onClose={handleSuccessClose}
          showCancel={false}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacingY._24,
  },
  contentWrapper: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacingX._20,
    paddingBottom: spacingY._60 + spacingY._40, // Extra padding to ensure description field is scrollable above keyboard
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: spacingX._12,
    borderRadius: radius._8,
    backgroundColor: 'rgba(200, 82, 80, 0.1)',
    marginBottom: spacingY._16,
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
  descriptionInput: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingTop: spacingY._12,
  },
  descriptionInputText: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  fixedButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._16,
    gap: spacingX._12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(22, 110, 139, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacingY._16,
    borderRadius: radius._10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    flex: 1,
  },
});
