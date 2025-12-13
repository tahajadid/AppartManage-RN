import LanguageSelectionModal from '@/components/appSettings/LanguageSelectionModal';
import SettingItem from '@/components/appSettings/SettingItem';
import ThemeSelection from '@/components/appSettings/ThemeSelection';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from '@/contexts/authContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { signOut } from '@/services/authService';
import { router } from 'expo-router';
import {
  Lock,
  SignOut,
  Translate,
  User,
} from 'phosphor-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LANGUAGE_NAMES: { [key: string]: string } = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
};

export default function SettingsScreen() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { currentLanguage, changeLanguage } = useRTL();
  const { user } = useAuth();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirmation'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await signOut();
            } catch (error: any) {
              console.log('Logout error:', error);
              Alert.alert(t('error'), t('failedToLogout'));
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleLanguageSelect = async (langCode: 'en' | 'ar' | 'fr') => {
    await changeLanguage(langCode);
    setLanguageModalVisible(false);
  };

  return (
    <ScreenWrapper>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.screenBackground }]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacingY._20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Typo size={28} color={colors.titleText} fontWeight="700" style={styles.title}>
          {t('settings')}
        </Typo>

        {/* Edit Profile */}
        <View style={styles.section}>
          <SettingItem
            icon={<User size={20} color={colors.primary} weight="bold" />}
            title={t('editProfile')}
            subtitle={t('modifyPersonalInformation')}
            onPress={() => router.push('/ui/settings/edit-profile' as any)}
          />
        </View>

        {/* Language Selection */}
        <View style={styles.section}>
          <SettingItem
            icon={<Translate size={20} color={colors.primary} weight="bold" />}
            title={t('language')}
            subtitle={LANGUAGE_NAMES[currentLanguage] || 'English'}
            onPress={() => setLanguageModalVisible(true)}
          />
        </View>

        {/* Theme Selection */}
        <View style={styles.section}>
          <ThemeSelection />
        </View>

        {/* Change Password */}
        <View style={styles.section}>
          <SettingItem
            icon={<Lock size={20} color={colors.primary} weight="bold" />}
            title={t('changePassword')}
            subtitle={t('updatePassword')}
            onPress={() => router.push('/ui/settings/change-password' as any)}
          />
        </View>

        {/* Logout Button */}
        <View style={[styles.section, styles.logoutSection]}>
          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: colors.redClose }]}
            onPress={handleLogout}
            disabled={loading}
            activeOpacity={0.7}
          >
            <SignOut size={20} color={colors.redClose} weight="bold" />
            <Typo size={16} color={colors.redClose} fontWeight="600" style={styles.logoutText}>
              {loading ? t('loggingOut') : t('logout')}
            </Typo>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <LanguageSelectionModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
        onLanguageSelect={handleLanguageSelect}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._24,
  },
  title: {
    marginBottom: spacingY._32,
  },
  section: {
    marginBottom: spacingY._16,
  },
  logoutSection: {
    marginTop: spacingY._24,
    marginBottom: spacingY._32,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacingX._16,
    borderRadius: radius._12,
    borderWidth: 1,
    gap: spacingX._10,
  },
  logoutText: {
    marginLeft: spacingX._5,
  },
});
