import AppHeader from '@/components/AppHeader';
import EmptyState from '@/components/common/EmptyState';
import Shimmer from '@/components/common/Shimmer';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import i18n from '@/i18n/index';
import { Expense, ExpenseType, getApartmentExpenses } from '@/services/expenseService';
import { router, useFocusEffect } from 'expo-router';
import {
  Drop,
  Elevator,
  Lock,
  Receipt,
  Sparkle,
  Wrench
} from 'phosphor-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const getExpenseTypeIcon = (type: ExpenseType) => {
  switch (type) {
    case 'electricity':
      return Sparkle;
    case 'water':
      return Drop;
    case 'elevator':
      return Elevator;
    case 'security':
      return Lock;
    case 'clean':
      return Sparkle;
    case 'other':
      return Wrench;
    default:
      return Receipt;
  }
};

const getExpenseTypeColor = (type: ExpenseType): string => {
  switch (type) {
    case 'electricity':
      return '#FFD700';
    case 'water':
      return '#00BFFF';
    case 'elevator':
      return '#9370DB';
    case 'security':
      return '#FF6347';
    case 'clean':
      return '#32CD32';
    case 'other':
      return '#808080';
    default:
      return '#808080';
  }
};

export default function PaymentsExpensesScreen() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { apartmentId } = useOnboarding();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (apartmentId) {
      loadExpenses();
    } else {
      setLoading(false);
      setError('No apartment found');
    }
  }, [apartmentId]);

  // Reload expenses when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (apartmentId) {
        loadExpenses();
      }
    }, [apartmentId])
  );

  const loadExpenses = async () => {
    if (!apartmentId) return;

    setLoading(true);
    setError(null);

    try {
      const expensesResult = await getApartmentExpenses(apartmentId);
      
      if (!expensesResult.success) {
        setError(expensesResult.error || 'Failed to load expenses');
        setLoading(false);
        return;
      }

      const expensesList = expensesResult.expenses || [];

      // Sort expenses by date (newest first)
      // Date format is "DD/MM/YYYY", convert to comparable format
      expensesList.sort((a, b) => {
        // Convert "DD/MM/YYYY" to "YYYY-MM-DD" for comparison
        const dateA = a.date.split('/').reverse().join('-'); // "YYYY-MM-DD"
        const dateB = b.date.split('/').reverse().join('-'); // "YYYY-MM-DD"
        return dateB.localeCompare(dateA); // Newest first
      });

      setExpenses(expensesList);
    } catch (err: any) {
      console.log('Error loading expenses:', err);
      setError('An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  // Format date from "DD/MM/YYYY" to "MonthName YYYY" for expenses
  const formatExpenseMonthYear = (dateStr: string): string => {
    const [day, month, year] = dateStr.split('/');
    const monthNum = parseInt(month, 10) - 1; // JavaScript months are 0-indexed
    const date = new Date(parseInt(year, 10), monthNum, parseInt(day, 10));
    
    // Get current language from i18n
    const currentLang = i18n.language || 'en';
    // Map language codes to locale strings
    const localeMap: { [key: string]: string } = {
      'en': 'en-US',
      'ar': 'ar-SA',
      'fr': 'fr-FR',
    };
    const locale = localeMap[currentLang] || 'en-US';
    
    // Use toLocaleDateString with options for month and year
    return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  };

  // Group expenses by month
  const groupExpensesByMonth = (expenses: Expense[]): Map<string, Expense[]> => {
    const grouped = new Map<string, Expense[]>();
    
    expenses.forEach((expense) => {
      // Extract month and year from "DD/MM/YYYY"
      const [day, month, year] = expense.date.split('/');
      const monthKey = `${month}-${year}`; // "MM-YYYY"
      
      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, []);
      }
      grouped.get(monthKey)!.push(expense);
    });
    
    // Sort expenses within each month by date (newest first)
    grouped.forEach((monthExpenses) => {
      monthExpenses.sort((a, b) => {
        // Convert "DD/MM/YYYY" to "YYYY-MM-DD" for comparison
        const dateA = a.date.split('/').reverse().join('-');
        const dateB = b.date.split('/').reverse().join('-');
        return dateB.localeCompare(dateA); // Newest first
      });
    });
    
    return grouped;
  };

  const handleExpensePress = (expense: Expense) => {
    router.push({
      pathname: '/ui/payments/syndic/expenses/expense-details',
      params: { expenseId: expense.id },
    } as any);
  };

  // Render shimmer loading state
  const renderShimmerItems = () => {
    return Array.from({ length: 3 }).map((_, index) => (
      <TouchableOpacity
        key={`shimmer-${index}`}
        style={[styles.expenseCard, { backgroundColor: colors.neutral800 }]}
        disabled
      >
        <View style={styles.expenseHeader}>
          <Shimmer width={48} height={48} borderRadius={radius._8} />
          <View style={styles.expenseInfo}>
            <Shimmer width={120} height={18} borderRadius={radius._8} />
            <Shimmer width={200} height={14} borderRadius={radius._8} style={{ marginTop: spacingY._5 }} />
          </View>
        </View>
        <View>
          <Shimmer width={100} height={18} borderRadius={radius._8} />
          <Shimmer width={80} height={12} borderRadius={radius._8} style={{ marginTop: spacingY._5 }} />
        </View>
      </TouchableOpacity>
    ));
  };

  if (error && !expenses.length && !loading) {
    return (
      <ScreenWrapper>
        <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
          <AppHeader title={t('expenses')} />
          <View style={styles.errorContainer}>
            <Typo size={16} color={colors.redClose}>
              {error}
            </Typo>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
        <AppHeader title={t('expenses')} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacingY._20 },
            { direction: isRTL ? 'rtl' : 'ltr' },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {loading && expenses.length === 0 ? (
            <View style={styles.monthSection}>
              <View style={styles.monthHeader}>
                <Shimmer width={150} height={18} borderRadius={radius._8} />
              </View>
              {renderShimmerItems()}
            </View>
          ) : expenses.length === 0 ? (
            <EmptyState message={t('noExpenses') || 'No expenses found'} />
          ) : (
            (() => {
              const groupedExpenses = groupExpensesByMonth(expenses);
              // Sort months (newest first)
              const sortedMonths = Array.from(groupedExpenses.keys()).sort((a, b) => {
                const [monthA, yearA] = a.split('-').map(Number);
                const [monthB, yearB] = b.split('-').map(Number);
                
                // First compare by year (newest first)
                if (yearB !== yearA) {
                  return yearB - yearA;
                }
                // Then by month (newest first)
                return monthB - monthA;
              });

              return sortedMonths.map((monthKey) => {
                const monthExpenses = groupedExpenses.get(monthKey)!;
                const monthTitle = formatExpenseMonthYear(monthExpenses[0].date);

                return (
                  <View key={monthKey} style={styles.monthSection}>
                    <View style={styles.monthHeader}>
                      <Typo size={18} color={colors.text} fontWeight="600">
                        {monthTitle}
                      </Typo>
                      <View style={{height: spacingY._1, backgroundColor: colors.text, marginTop: spacingX._3, marginHorizontal:spacingX._20}} />
                    </View>
                    {monthExpenses.map((expense) => {
                      const Icon = getExpenseTypeIcon(expense.type);
                      const iconColor = getExpenseTypeColor(expense.type);

                      return (
                        <TouchableOpacity
                          key={expense.id}
                          onPress={() => handleExpensePress(expense)}
                          style={[styles.expenseCard, { backgroundColor: colors.neutral800 }]}
                          activeOpacity={0.7}
                        >
                          <View style={styles.expenseHeader}>
                            <View style={[styles.expenseIconContainer, { backgroundColor: iconColor + '20' }]}>
                              <Icon size={24} color={iconColor} weight="fill" />
                            </View>
                            <View style={styles.expenseInfo}>
                              <Typo size={18} color={colors.titleText} fontWeight="600">
                                {t(expense.type) || expense.type}
                              </Typo> 
                              {expense.description && (
                                <Typo size={14} color={colors.subtitleText} style={styles.expenseDescription}>
                                  {expense.description}
                                </Typo>
                              )}
                              <Typo size={20} color={colors.text} fontWeight="700">
                                {expense.amount} MAD
                              </Typo>
                              <Typo size={12} color={colors.primary} style={styles.expenseDate}>
                                {expense.date}
                              </Typo>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              });
            })()
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacingY._24,
  },
  title: {
    marginStart: spacingX._20,
    textAlign: 'left',
    marginBottom: spacingY._16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacingY._20,
    paddingTop: spacingY._12,
    paddingHorizontal: spacingX._20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacingX._20,
  },
  monthSection: {
    marginBottom: spacingY._24,
  },
  monthHeader: {
    marginBottom: spacingY._16,
  },
  expenseCard: {
    padding: spacingX._16,
    borderRadius: radius._12,
    marginBottom: spacingY._8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._8,
  },
  expenseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius._12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseInfo: {
    flex: 1,
    gap: spacingY._5,
  },
  expenseDescription: {
    marginTop: spacingY._5,
  },
  expenseDate: {
    marginTop: spacingY._5,
  },
  expenseAmount: {
    alignItems: 'flex-end',
  },
});


