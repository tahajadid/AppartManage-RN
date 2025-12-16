import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { ExpenseType } from '@/services/expenseService';
import {
  Drop,
  Elevator,
  Lock,
  Sparkle,
  Wrench
} from 'phosphor-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface ExpenseTypeOption {
  value: ExpenseType;
  labelKey: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface ExpenseTypeSelectorProps {
  selectedType: ExpenseType | null;
  onTypeSelect: (type: ExpenseType) => void;
}

const getExpenseTypeOptions = (): ExpenseTypeOption[] => [
  { value: 'electricity', labelKey: 'electricity', icon: Sparkle, color: '#dec237' },
  { value: 'water', labelKey: 'water', icon: Drop, color: '#30b8e6' },
  { value: 'elevator', labelKey: 'elevator', icon: Elevator, color: '#9370DB' },
  { value: 'security', labelKey: 'security', icon: Lock, color: '#FF6347' },
  { value: 'clean', labelKey: 'clean', icon: Sparkle, color: '#32CD32' },
  { value: 'other', labelKey: 'other', icon: Wrench, color: '#808080' },
];

export default function ExpenseTypeSelector({
  selectedType,
  onTypeSelect,
}: ExpenseTypeSelectorProps) {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { t } = useTranslation();

  const expenseTypeOptions = getExpenseTypeOptions();

  return (
    <View style={styles.container}>
      <Typo size={16} color={colors.titleText} fontWeight="600" style={styles.label}>
        {t('expenseType') || 'Expense Type'}
      </Typo>
      <View style={styles.typeGrid}>
        {expenseTypeOptions.map((expenseType) => {
          const isSelected = selectedType === expenseType.value;
          const Icon = expenseType.icon;
          return (
            <TouchableOpacity
              key={expenseType.value}
              onPress={() => onTypeSelect(expenseType.value)}
              style={[
                styles.typeButton,
                {
                  backgroundColor: isSelected
                    ? expenseType.color + '20'
                    : colors.neutral800,
                  borderColor: isSelected ? expenseType.color : colors.neutral700,
                  borderWidth: isSelected ? 2 : 2,
                },
              ]}
              activeOpacity={0.7}
            >
              <Icon
                size={24}
                color={isSelected ? expenseType.color : colors.subtitleText}
                weight={isSelected ? 'fill' : 'regular'}
              />
              <Typo
                size={14}
                color={isSelected ? expenseType.color : colors.text}
                fontWeight="600"
                style={styles.typeButtonText}
              >
                {t(expenseType.labelKey) || expenseType.labelKey}
              </Typo>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacingY._24,
  },
  label: {
    marginBottom: spacingY._12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacingX._12,
  },
  typeButton: {
    paddingVertical: spacingY._12,
    paddingHorizontal: spacingX._16,
    borderRadius: radius._10,
    minWidth: 100,
    alignItems: 'center',
    gap: spacingX._8,
  },
  typeButtonText: {
    marginTop: spacingY._5,
  },
});

