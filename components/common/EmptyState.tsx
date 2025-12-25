import Typo from '@/components/Typo';
import { spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import LottieView from 'lottie-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  const colors = useThemeColors();
  
  return (
    <View style={styles.container}>
      <LottieView
        source={require('@/assets/animations/empty_list.json')}
        autoPlay
        loop
        style={styles.lottieAnimation}
      />
      <Typo size={16} color={colors.subtitleText} style={styles.emptyText}>
        {message}
      </Typo>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacingY._40,
    gap: spacingY._12,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  emptyText: {
    marginTop: spacingY._8,
  },
});

