import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import useThemeColors from '@/contexts/useThemeColors';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function PaymentsScreen() {
  const colors = useThemeColors();

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
        <Typo size={24} color={colors.text}>
          Payments
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

