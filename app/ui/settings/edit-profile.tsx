import AppHeader from '@/components/AppHeader';
import Input from '@/components/Input';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { spacingX, spacingY } from '@/constants/theme';
import { useAuth } from '@/contexts/authContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { user } = useAuth();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSave = async () => {
    setLoading(true);
    // UI only - no actual save logic
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
          <AppHeader title={t('editProfile')} showBackButton={true} />

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Typo size={14} color={colors.subtitleText} fontWeight="500" style={styles.label}>
                {t('fullName')}
              </Typo>
              <Input
                placeholder={t('fullNamePlaceholder')}
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Typo size={14} color={colors.subtitleText} fontWeight="500" style={styles.label}>
                {t('email')}
              </Typo>
              <Input
                placeholder={t('enterEmail')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Typo size={14} color={colors.subtitleText} fontWeight="500" style={styles.label}>
                {t('phoneNumber')} <Typo size={12} color={colors.subtitleText}>{t('optional')}</Typo>
              </Typo>
              <Input
                placeholder={t('phoneNumberPlaceholder')}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>
          </View>
        </ScrollView>

        <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + spacingY._20 }]}>
          <PrimaryButton
            onPress={handleSave}
            loading={loading}
            disabled={loading || !fullName.trim() || !email.trim()}
            backgroundColor={colors.primary}
          >
            <Typo size={16} color={colors.white} fontWeight="600">
              {t('saveChanges')}
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
    paddingHorizontal: spacingX._20,
    marginTop: spacingY._24,
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

