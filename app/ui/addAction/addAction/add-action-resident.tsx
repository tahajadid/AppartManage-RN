import AppHeader from '@/components/AppHeader';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { getResidentActionOptions } from '@/constants/addActionListHelper';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { Plus } from 'phosphor-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';


export default function AddActionResidentScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isRTL } = useRTL();

  const actionOptions = getResidentActionOptions(t, colors);

  const handleActionPress = (route: string) => {
    // Navigate to the corresponding screen (placeholder for now)
    console.log('Navigate to:', route);
    // router.push(route as any);
  };

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: colors.screenBackground, direction: isRTL ? 'rtl' : 'ltr' }]}>
        {/* Header */}
        <AppHeader title={t('addAction') || 'Add Action'} />

        {/* Content */}
        <ScrollView contentContainerStyle={[styles.scrollContent, { direction: isRTL ? 'rtl' : 'ltr' }]}>
          <Typo 
            size={18} 
            color={colors.subtitleText} 
            style={styles.subtitle}
          >
            {t('selectActionToAdd') || 'Select an action to add'}
          </Typo>

          <View style={styles.optionsContainer}>
            {actionOptions.map((option) => {
              const Icon = option.icon;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleActionPress(option.route)}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: colors.neutral900,
                      borderColor: colors.neutral700,
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: `${option.iconColor}20` },
                    ]}
                  >
                    <Icon size={28} color={option.iconColor} weight="bold" />
                  </View>
                  <View style={styles.optionContent}>
                    <Typo size={18} color={colors.titleText} fontWeight="600">
                      {option.title}
                    </Typo>
                    <Typo size={14} color={colors.subtitleText} style={styles.optionSubtitle}>
                      {option.subtitle}
                    </Typo>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Plus size={20} color={colors.neutral400} weight="bold" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: spacingY._20,
  },
  scrollContent: {
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._40,
  },
  subtitle: {
    marginBottom: spacingY._16,
    marginTop: spacingY._16,
    textAlign: 'left',
  },
  optionsContainer: {
    gap: spacingY._16,
  },
  optionCard: {
    alignItems: 'center',
    padding: spacingX._16,
    borderRadius: radius._12,
    borderWidth: 1,
    gap: spacingX._16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: radius._12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
    gap: spacingY._5,
  },
  optionSubtitle: {
    marginTop: spacingY._5,
  },
  arrowContainer: {
    padding: spacingX._8,
  },
});
