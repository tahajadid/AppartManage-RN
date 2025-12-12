import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import { signOut } from '@/services/authService';
import { SignOut } from 'phosphor-react-native';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

export default function SettingsScreen() {
  const colors = useThemeColors();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Sign out from Firebase
              // This will trigger onAuthStateChanged in both authContext and onboardingContext
              // index.tsx will automatically handle navigation to login when user becomes null
              await signOut();
            } catch (error: any) {
              console.log('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
              setLoading(false);
            }
            // Note: Don't set loading to false on success - navigation will happen via index.tsx
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
        <View style={styles.content}>
          <Typo size={28} color={colors.text} fontWeight="700" style={styles.title}>
            Settings
          </Typo>

          <View style={styles.section}>
            <PrimaryButton
              style={[styles.logoutButton, { borderColor: colors.redClose }] as any}
              backgroundColor={colors.redClose}
              onPress={handleLogout}
              loading={loading}
              disabled={loading}
            >
              <View style={styles.logoutButtonContent}>
                <SignOut size={20} color="#FFFFFF" weight="bold" />
                <Typo 
                  size={16}
                  color="#FFFFFF"
                  fontWeight="600"
                  style={styles.logoutText}
                >
                  Logout
                </Typo>
              </View>
            </PrimaryButton>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._24,
  },
  title: {
    marginBottom: spacingY._32,
  },
  section: {
    marginTop: spacingY._24,
  },
  logoutButton: {
    height: 50,
    borderRadius: radius._8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    marginLeft: spacingX._10,
  },
});

