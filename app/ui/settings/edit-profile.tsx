import AppHeader from '@/components/AppHeader';
import Shimmer from '@/components/common/Shimmer';
import Input from '@/components/Input';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from '@/contexts/authContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { getUserProfile, updateUserProfile } from '@/services/userService';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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
  const [initialLoading, setInitialLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Load user profile data when screen mounts
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Reload profile when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
    }, [])
  );

  const loadUserProfile = async () => {
    setInitialLoading(true);
    try {
      const result = await getUserProfile();
      if (result.success && result.profile) {
        setFullName(result.profile.fullName);
        setEmail(result.profile.email);
        setPhoneNumber(result.profile.phoneNumber || '');
      } else {
        // Fallback to auth context if service fails
        setFullName(user?.name || '');
        setEmail(user?.email || '');
        setPhoneNumber('');
      }
    } catch (error) {
      console.log('Error loading profile:', error);
      // Fallback to auth context
      setFullName(user?.name || '');
      setEmail(user?.email || '');
      setPhoneNumber('');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim() || !email.trim()) {
      return;
    }

    setLoading(true);
    try {
      const result = await updateUserProfile({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
      });

      if (result.success) {
        router.back();
      } else {
        // Handle error - could show an error message
        console.log('Error updating profile:', result.error);
      }
    } catch (error) {
      console.log('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
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
            {initialLoading ? (
              <>
                <View style={styles.inputGroup}>
                  <Shimmer width={80} height={14} borderRadius={radius._8} style={{ marginBottom: spacingY._8 }} />
                  <Shimmer width="100%" height={50} borderRadius={radius._8} />
                </View>
                <View style={styles.inputGroup}>
                  <Shimmer width={60} height={14} borderRadius={radius._8} style={{ marginBottom: spacingY._8 }} />
                  <Shimmer width="100%" height={50} borderRadius={radius._8} />
                </View>
                <View style={styles.inputGroup}>
                  <Shimmer width={100} height={14} borderRadius={radius._8} style={{ marginBottom: spacingY._8 }} />
                  <Shimmer width="100%" height={50} borderRadius={radius._8} />
                </View>
              </>
            ) : (
              <>
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
              </>
            )}
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

