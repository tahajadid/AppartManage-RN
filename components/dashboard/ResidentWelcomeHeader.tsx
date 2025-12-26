import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import { Bell } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

interface ResidentWelcomeHeaderProps {
  residentName: string;
  unreadNotifications?: number;
  insetsTop: number;
}

export default function ResidentWelcomeHeader({
  residentName,
  unreadNotifications = 0,
  insetsTop,
}: ResidentWelcomeHeaderProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  const handleNotificationPress = () => {
    router.push('/(home)/notifications' as any);
  };

  return (
    <View style={[styles.headerContainer, { backgroundColor: colors.primary }]}>
      <View style={[styles.headerContent, { paddingTop: insetsTop + spacingY._20 }]}>
        <View style={styles.welcomeTextContainer}>
          <Typo size={20} color={colors.white} fontWeight="400" style={styles.welcomeLabel}>
            {t('welcome')}
          </Typo>
          <Typo size={26} color={colors.white} fontWeight="700" style={styles.welcomeName}>
            {residentName}
          </Typo>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton} 
          onPress={handleNotificationPress}
          activeOpacity={0.7}
        >
          <Bell size={28} color={colors.white} weight="regular" />
          {unreadNotifications > 0 && (
            <View style={[styles.notificationBadge, { backgroundColor: colors.rose }]}>
              <Typo size={10} color={colors.white} fontWeight="700">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </Typo>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    borderBottomLeftRadius: radius._20,
    borderBottomRightRadius: radius._20,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._20,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeLabel: {
    marginBottom: spacingY._5,
  },
  welcomeName: {
    marginTop: spacingY._5,
  },
  notificationButton: {
    padding: spacingX._8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: spacingY._5,
    right: spacingY._5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacingX._5,
    borderWidth: 2,
    borderColor: '#fff',
  },
});

