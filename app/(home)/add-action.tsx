import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import useThemeColors from '@/contexts/useThemeColors';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function AddActionScreen() {
  const colors = useThemeColors();

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
        <Typo size={24} color={colors.text}>
          Add Action
        </Typo>
        <Typo size={16} color={colors.subtitleText} style={styles.subtitle}>
          This screen will be used for creating new actions
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
    paddingHorizontal: 20,
  },
  subtitle: {
    marginTop: 12,
    textAlign: 'center',
  },
});

