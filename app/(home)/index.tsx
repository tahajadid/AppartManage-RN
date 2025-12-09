import Typo from '@/components/Typo';
import useThemeColors from '@/contexts/useThemeColors';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
      <Typo size={24} color={colors.text}>
        Welcome Home
      </Typo>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

