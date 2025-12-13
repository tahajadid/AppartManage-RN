import AppHeader from '@/components/AppHeader';
import Input from '@/components/Input';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { spacingX, spacingY } from '@/constants/theme';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChangePasswordScreen() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      // Show error - passwords don't match
      return;
    }
    if (newPassword.length < 6) {
      // Show error - password too short
      return;
    }

    setLoading(true);
    // UI only - no actual password change logic
    setTimeout(() => {
      setLoading(false);
      router.back();
    }, 1000);
  };

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AppHeader title={t('changePassword')} showBackButton={true} />

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Typo size={14} color={colors.subtitleText} fontWeight="500" style={styles.label}>
                {t('currentPassword')}
              </Typo>
              <Input
                placeholder={t('currentPasswordPlaceholder')}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Typo size={14} color={colors.subtitleText} fontWeight="500" style={styles.label}>
                {t('newPassword')}
              </Typo>
              <Input
                placeholder={t('newPasswordPlaceholder')}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Typo size={14} color={colors.subtitleText} fontWeight="500" style={styles.label}>
                {t('confirmNewPassword')}
              </Typo>
              <Input
                placeholder={t('confirmNewPasswordPlaceholder')}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={styles.input}
              />
            </View>
          </View>
        </ScrollView>

        <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + spacingY._20 }]}>
          <PrimaryButton
            onPress={handleChangePassword}
            loading={loading}
            disabled={
              loading ||
              !currentPassword.trim() ||
              !newPassword.trim() ||
              !confirmPassword.trim()
            }
            backgroundColor={colors.primary}
          >
            <Typo size={16} color={colors.white} fontWeight="600">
              {t('updatePasswordButton')}
            </Typo>
          </PrimaryButton>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacingY._20,
    paddingBottom: spacingY._24,
  },
  form: {
    marginTop: spacingY._24,
    paddingHorizontal: spacingX._20,
    gap: spacingY._20,
  },
  inputGroup: {
    gap: spacingY._8,
  },
  label: {
    marginBottom: spacingY._5,
  },
  input: {
    marginTop: 0,
  },
  buttonContainer: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._16,
    backgroundColor: 'transparent',
  },
});

