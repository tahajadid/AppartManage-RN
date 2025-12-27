import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import {
    Calendar,
    CurrencyCircleDollar,
    FileText,
    Warning
} from 'phosphor-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export type MeetingType = 'general' | 'budget' | 'administrative' | 'urgent';

interface MeetingTypeOption {
  value: MeetingType;
  labelKey: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface MeetingTypeSelectorProps {
  selectedType: MeetingType | null;
  onTypeSelect: (type: MeetingType) => void;
}

const getMeetingTypeOptions = (): MeetingTypeOption[] => [
  { value: 'general', labelKey: 'meetingTypeGeneral', icon: Calendar, color: '#30b8e6' },
  { value: 'budget', labelKey: 'meetingTypeBudget', icon: CurrencyCircleDollar, color: '#32CD32' },
  { value: 'administrative', labelKey: 'meetingTypeAdministrative', icon: FileText, color: '#9370DB' },
  { value: 'urgent', labelKey: 'meetingTypeUrgent', icon: Warning, color: '#FF6347' },
];

export default function MeetingTypeSelector({
  selectedType,
  onTypeSelect,
}: MeetingTypeSelectorProps) {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { t } = useTranslation();

  const meetingTypeOptions = getMeetingTypeOptions();

  return (
    <View style={styles.container}>
      <Typo size={16} color={colors.titleText} fontWeight="600" style={styles.label}>
        {t('meetingType') || 'Meeting Type'}
      </Typo>
      <View style={styles.typeGrid}>
        {meetingTypeOptions.map((meetingType) => {
          const isSelected = selectedType === meetingType.value;
          const Icon = meetingType.icon;
          return (
            <TouchableOpacity
              key={meetingType.value}
              onPress={() => onTypeSelect(meetingType.value)}
              style={[
                styles.typeButton,
                {
                  backgroundColor: isSelected
                    ? meetingType.color + '20'
                    : colors.neutral800,
                  borderColor: isSelected ? meetingType.color : colors.neutral700,
                  borderWidth: isSelected ? 2 : 2,
                },
              ]}
              activeOpacity={0.7}
            >
              <Icon
                size={20}
                color={isSelected ? meetingType.color : colors.subtitleText}
                weight={isSelected ? 'fill' : 'regular'}
              />
              <Typo
                size={14}
                color={isSelected ? meetingType.color : colors.text}
                fontWeight="600"
              >
                {t(meetingType.labelKey) || meetingType.labelKey}
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
    flexDirection: 'row',
    paddingVertical: spacingY._12,
    paddingHorizontal: spacingX._16,
    borderRadius: radius._10,
    minWidth: 100,
    alignItems: 'center',
    gap: spacingX._8,
  },
});

