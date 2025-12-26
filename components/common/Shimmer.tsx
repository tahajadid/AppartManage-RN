import { radius } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface ShimmerProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export default function Shimmer({ width = '100%', height = 20, borderRadius = radius._8, style }: ShimmerProps) {
  const colors = useThemeColors();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[{ width, height, borderRadius, overflow: 'hidden' }, style]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            backgroundColor: colors.neutral700,
            opacity,
            borderRadius,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shimmer: {
    width: '100%',
    height: '100%',
  },
});


