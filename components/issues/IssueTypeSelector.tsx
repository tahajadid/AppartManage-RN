import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { IssueType } from '@/services/issueService';
import {
  Drop,
  Elevator,
  Flame,
  Lock,
  Plug,
  Sparkle,
  Wrench
} from 'phosphor-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface IssueTypeOption {
  value: IssueType;
  labelKey: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface IssueTypeSelectorProps {
  selectedType: IssueType | null;
  onTypeSelect: (type: IssueType) => void;
}

const getIssueTypeOptions = (): IssueTypeOption[] => [
  { value: 'plumbing', labelKey: 'plumbing', icon: Drop, color: '#30b8e6' },
  { value: 'electrical', labelKey: 'electrical', icon: Plug, color: '#dec237' },
  { value: 'heating', labelKey: 'heating', icon: Flame, color: '#FF6347' },
  { value: 'elevator', labelKey: 'elevator', icon: Elevator, color: '#9370DB' },
  { value: 'security', labelKey: 'security', icon: Lock, color: '#FF6347' },
  { value: 'cleaning', labelKey: 'cleaning', icon: Sparkle, color: '#32CD32' },
  { value: 'other', labelKey: 'other', icon: Wrench, color: '#808080' },
];

export default function IssueTypeSelector({
  selectedType,
  onTypeSelect,
}: IssueTypeSelectorProps) {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { t } = useTranslation();

  const issueTypeOptions = getIssueTypeOptions();

  return (
    <View style={styles.container}>
      <Typo size={16} color={colors.titleText} fontWeight="600" style={styles.label}>
        {t('issueType') || 'Issue Type'}
      </Typo>
      <View style={styles.typeGrid}>
        {issueTypeOptions.map((issueType) => {
          const isSelected = selectedType === issueType.value;
          const Icon = issueType.icon;
          return (
            <TouchableOpacity
              key={issueType.value}
              onPress={() => onTypeSelect(issueType.value)}
              style={[
                styles.typeButton,
                {
                  backgroundColor: isSelected
                    ? issueType.color + '20'
                    : colors.neutral800,
                  borderColor: isSelected ? issueType.color : colors.neutral700,
                  borderWidth: isSelected ? 2 : 2,
                },
              ]}
              activeOpacity={0.7}
            >
              <Icon
                size={24}
                color={isSelected ? issueType.color : colors.subtitleText}
                weight={isSelected ? 'fill' : 'regular'}
              />
              <Typo
                size={14}
                color={isSelected ? issueType.color : colors.text}
                fontWeight="600"
                style={styles.typeButtonText}
              >
                {t(issueType.labelKey) || issueType.labelKey}
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

