import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { useOnboarding } from '@/contexts/onboardingContext';
import useThemeColors from '@/contexts/useThemeColors';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const colors = useThemeColors();
  const { role } = useOnboarding();

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
        <Typo size={24} color={colors.text}>
          {role === 'syndic' ? 'Syndic Dashboard' : 'Resident Home'}
        </Typo>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

