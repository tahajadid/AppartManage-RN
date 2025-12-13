import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import { CaretRight } from 'phosphor-react-native';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  showArrow?: boolean;
}

export default function SettingItem({
  icon,
  title,
  subtitle,
  onPress,
  rightComponent,
  showArrow = true,
}: SettingItemProps) {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.neutral800 }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
          {icon}
        </View>
        <View style={styles.settingItemText}>
          <Typo size={16} color={colors.titleText} fontWeight="600">
            {title}
          </Typo>
          {subtitle && (
            <Typo size={14} color={colors.subtitleText} style={styles.subtitle}>
              {subtitle}
            </Typo>
          )}
        </View>
      </View>
      <View style={styles.settingItemRight}>
        {rightComponent}
        {showArrow && onPress && (
          <CaretRight
            size={20}
            color={colors.subtitleText}
            weight="bold"
            style={styles.arrow}
          />
        )}
      </View>
    </TouchableOpacity>
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
  subtitle: {
    marginTop: spacingY._5,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._8,
  },
  arrow: {
    marginLeft: spacingX._8,
  },
});

