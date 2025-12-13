import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useTheme } from '@/contexts/themeContext';
import useThemeColors from '@/contexts/useThemeColors';
import { Pencil } from 'phosphor-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ThemeSelection() {
  const colors = useThemeColors();
  const { mode, setMode } = useTheme();
  const { t } = useTranslation();

  const handleThemeChange = (newMode: 'light' | 'dark' | 'system') => {
    setMode(newMode);
  };

  return (
    <View style={[styles.settingItem, { backgroundColor: colors.neutral800 }]}>
      <View style={styles.settingItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
          <Pencil size={20} color={colors.primary} weight="bold" />
        </View>
        <View style={styles.settingItemText}>
          <Typo size={16} color={colors.titleText} fontWeight="600">
            {t('theme')}
          </Typo>
          <View style={styles.themeOptionsContainer}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                mode === 'light' && { backgroundColor: colors.primary },
                { borderColor: colors.subtitleText + '40' },
              ]}
              onPress={() => handleThemeChange('light')}
            >
              <Typo
                size={14}
                color={mode === 'light' ? colors.white : colors.subtitleText}
                fontWeight="600"
              >
                {t('light')}
              </Typo>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeOption,
                mode === 'dark' && { backgroundColor: colors.primary },
                { borderColor: colors.subtitleText + '40' },
              ]}
              onPress={() => handleThemeChange('dark')}
            >
              <Typo
                size={14}
                color={mode === 'dark' ? colors.white : colors.subtitleText}
                fontWeight="600"
              >
                {t('dark')}
              </Typo>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeOption,
                mode === 'system' && { backgroundColor: colors.primary },
                { borderColor: colors.subtitleText + '40' },
              ]}
              onPress={() => handleThemeChange('system')}
            >
              <Typo
                size={14}
                color={mode === 'system' ? colors.white : colors.subtitleText}
                fontWeight="600"
              >
                {t('system')}
              </Typo>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacingX._16,
    borderRadius: radius._12,
    marginBottom: spacingY._12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius._8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacingX._12,
  },
  settingItemText: {
    flex: 1,
  },
  themeOptionsContainer: {
    flexDirection: 'row',
    gap: spacingX._8,
    marginTop: spacingY._16,
  },
  themeOption: {
    flex: 1,
    paddingVertical: spacingY._8,
    paddingHorizontal: spacingX._5,
    borderRadius: radius._8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

