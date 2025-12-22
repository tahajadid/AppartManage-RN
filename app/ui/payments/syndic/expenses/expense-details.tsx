import AppHeader from '@/components/AppHeader';
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { deleteExpense, getApartmentExpenses } from '@/services/expenseService';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Pencil, Trash } from 'phosphor-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ExpenseDetailsScreen() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { apartmentId } = useOnboarding();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();

  const [expense, setExpense] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);

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
    } catch (err: any) {
      console.log('Error loading expense:', err);
      setError('An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/ui/payments/syndic/expenses/expense-edit?expenseId=${expenseId}`);
  };

  const handleDelete = () => {
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!apartmentId || !expenseId) return;

    setDeleting(true);
    setError(null);

    try {
      const result = await deleteExpense(apartmentId, expenseId);

      if (result.success) {
        setDeleteModalVisible(false);
        router.back();
      } else {
        setError(result.error || 'Failed to delete expense');
        setDeleteModalVisible(false);
      }
    } catch (err: any) {
      console.log('Error deleting expense:', err);
      setError('An error occurred, please try again');
      setDeleteModalVisible(false);
    } finally {
      setDeleting(false);
    }
  };


  if (loading) {
    return (
      <ScreenWrapper>
        <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
          <AppHeader title={t('expenseDetails') || 'Expense Details'} />
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
          <AppHeader title={t('expenseDetails') || 'Expense Details'} />
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
        <AppHeader title={t('expenseDetails') || 'Expense Details'} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { direction: isRTL ? 'rtl' : 'ltr' },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {error && (
            <View style={styles.errorContainer}>
              <Typo size={14} color={colors.redClose}>
                {error}
              </Typo>
            </View>
          )}

          {/* View Mode */}
          <View style={styles.viewSection}>
            <View style={styles.viewRow}>
              <Typo size={16} color={colors.primary} fontWeight="500">
                {t('expenseType') || 'Type'}
              </Typo>
              <Typo size={18} color={colors.text} fontWeight="600">
                {t(expense.type) || expense.type}
              </Typo>
            </View>

            <View style={styles.viewRow}>
              <Typo size={16} color={colors.primary} fontWeight="500">
                {t('amountLabel') || 'Amount'}
              </Typo>
              <Typo size={20} color={colors.text} fontWeight="700">
                {expense.amount} MAD
              </Typo>
            </View>

            <View style={styles.viewRow}>
              <Typo size={16} color={colors.primary} fontWeight="500">
                {t('expenseDate') || 'Date'}
              </Typo>
              <Typo size={18} color={colors.text} fontWeight="600">
                {expense.date}
              </Typo>
            </View>

            {expense.description && (
              <View style={styles.viewRow}>
                <Typo size={16} color={colors.primary} fontWeight="500">
                  {t('description') || 'Description'}
                </Typo>
                <Typo size={16} color={colors.text} fontWeight="400" style={styles.descriptionText}>
                  {expense.description}
                </Typo>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          visible={deleteModalVisible}
          loading={deleting}
          title={t('deleteExpense') || 'Delete Expense'}
          message={
            expense
              ? t('deleteExpenseConfirmation', {
                  type: t(expense.type) || expense.type,
                  amount: expense.amount,
                }) || `Are you sure you want to delete this ${t(expense.type) || expense.type} expense of ${expense.amount} MAD?`
              : t('deleteExpenseConfirmationGeneric') || 'Are you sure you want to delete this expense?'
          }
          onClose={() => setDeleteModalVisible(false)}
          onConfirm={handleDeleteConfirm}
        />

        {/* Edit and Delete Buttons - At the bottom */}
        <View style={[styles.actionButtons, { paddingBottom: insets.bottom + spacingY._16 }]}>
          <TouchableOpacity
            onPress={handleEdit}
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.7}
          >
            <Pencil size={20} color={colors.white} weight="regular" />
            <Typo size={16} color={colors.white} fontWeight="600">
              {t('edit') || 'Edit'}
            </Typo>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.actionButton, { backgroundColor: colors.redClose }]}
            activeOpacity={0.7}
          >
            <Trash size={20} color={colors.white} weight="regular" />
            <Typo size={16} color={colors.white} fontWeight="600">
              {t('delete') || 'Delete'}
            </Typo>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacingY._24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacingX._20,
    paddingBottom: spacingY._20,
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
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._16,
    gap: spacingX._12,
    backgroundColor: 'transparent',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacingY._16,
    paddingHorizontal: spacingX._16,
    borderRadius: radius._12,
    gap: spacingX._8,
  },
  viewSection: {
    gap: spacingY._20,
  },
  viewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacingY._12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(22, 110, 139, 0.2)',
  },
  descriptionText: {
    flex: 1,
    textAlign: 'right',
    marginStart: spacingX._16,
  },
});

