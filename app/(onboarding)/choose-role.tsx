import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type UserRole = 'syndic' | 'syndic_resident' | 'resident';

export default function ChooseRoleScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) return;

    if (selectedRole === 'syndic' || selectedRole === 'syndic_resident') {
      router.push({
        pathname: '/(onboarding)/syndic/syndic-apartment-setup',
        params: {
          role: selectedRole,
        },
      });
    } else {
      router.push({
        pathname: '/(onboarding)/resident/resident-apartment-setup',
        params: {
          role: selectedRole,
        },
      });
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Title at top left */}
        <View style={styles.header}>
          <Typo 
            size={28}
            color={colors.text}
            fontWeight="700"
            style={styles.title}
          >
            {t('chooseYourRole')}
          </Typo>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Typo 
              size={18}
              color={colors.subtitleText}
              fontWeight="300"
              style={styles.subtitle}
            >
              {t('selectRoleDescription')}
            </Typo>

            {/* Syndic Option */}
            <PrimaryButton
              style={[
                styles.roleButton,
                selectedRole === 'syndic' && styles.roleButtonSelected,
              ].filter(Boolean) as any}
              backgroundColor={selectedRole === 'syndic' ? colors.primary : colors.unselectedPrimary}
              onPress={() => handleRoleSelect('syndic')}
            >
              <View style={styles.roleButtonContent}>
                <Typo 
                  size={18}
                  color={colors.screenBackground}
                  fontWeight="600"
                >
                  {t('syndic')}
                </Typo>
                <Typo 
                  size={14}
                  color={colors.screenBackground}
                  style={styles.roleDescription}
                >
                  {t('syndicDescription')}
                </Typo>
              </View>
            </PrimaryButton>

            {/* Syndic Resident Option */}
            <PrimaryButton
              style={[
                styles.roleButton,
                selectedRole === 'syndic_resident' && styles.roleButtonSelected,
              ].filter(Boolean) as any}
              backgroundColor={selectedRole === 'syndic_resident' ? colors.primary : colors.unselectedPrimary}
              onPress={() => handleRoleSelect('syndic_resident')}
            >
              <View style={styles.roleButtonContent}>
                <Typo 
                  size={18}
                  color={colors.screenBackground}
                  fontWeight="600"
                >
                  {t('syndicResident')}
                </Typo>
                <Typo 
                  size={14}
                  color={colors.screenBackground}
                  style={styles.roleDescription}
                >
                  {t('syndicResidentDescription')}
                </Typo>
              </View>
            </PrimaryButton>

            {/* Resident Option */}
            <PrimaryButton
              style={[
                styles.roleButton,
                selectedRole === 'resident' && styles.roleButtonSelected,
              ].filter(Boolean) as any}
              backgroundColor={selectedRole === 'resident' ? colors.primary : colors.unselectedPrimary}
              onPress={() => handleRoleSelect('resident')}
            >
              <View style={styles.roleButtonContent}>
                <Typo 
                  size={18}
                  color={colors.screenBackground}
                  fontWeight="600"
                >
                  {t('resident')}
                </Typo>
                <Typo 
                  size={14}
                  color={colors.screenBackground}
                  style={styles.roleDescription}
                >
                  {t('residentDescription')}
                </Typo>
              </View>
            </PrimaryButton>

          </View>
        </ScrollView>

        {/* Continue Button at bottom */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacingY._24) }]}>
          <PrimaryButton
            style={styles.continueButton}
            backgroundColor={selectedRole ? colors.primary : colors.neutral500}
            onPress={handleContinue}
            disabled={!selectedRole}
          >
            <Typo 
              size={16}
              color={colors.screenBackground}
              fontWeight="600"
            >
              {t('continue')}
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
    paddingHorizontal: spacingX._20,
  },
  header: {
    marginTop: spacingY._24,
    marginBottom: spacingY._16,
  },
  title: {
    textAlign: 'left',
    marginTop: spacingY._16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    width: '100%',
    maxWidth: 400,
  },
  subtitle: {
    marginBottom: spacingY._32,
    textAlign: 'left',
  },
  roleButton: {
    marginBottom: spacingY._16,
    paddingVertical: spacingY._20,
    paddingHorizontal: spacingX._20,
    height: 80,
    borderRadius: radius._8,
  },
  roleButtonSelected: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  roleButtonContent: {
    alignItems: 'center',
  },
  roleDescription: {
    marginTop: spacingY._8,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: spacingY._24,
    paddingTop: spacingY._16,
  },
  continueButton: {
    height: 50,
    marginBottom: spacingY._24,
    borderRadius: radius._8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

