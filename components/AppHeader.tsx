import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { AppHeaderProps } from '@/data/types';
import { router } from 'expo-router';
import { CaretLeft, CaretRight } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';


export default function AppHeader({ 
  title, 
  onBack,
  showBackButton = true 
}: AppHeaderProps) {
  const colors = useThemeColors();
  const { isRTL } = useRTL();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Use router.back() to navigate back in the navigation stack
      if (router.canGoBack()) {
        router.back();
      } else {
        // Fallback to home if there's no history
        router.push('/(home)' as any);
      }
    }
  };

  // Use CaretRight for RTL (Arabic) and CaretLeft for LTR (English)
  const BackIcon = isRTL ? CaretRight : CaretLeft;

  return (
    <View style={[styles.header, { flexDirection: 'row', direction: isRTL ? 'rtl' : 'ltr' }]}>
      {showBackButton ? (
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.backButton, { backgroundColor: colors.primary }]}
        >
          <BackIcon size={24} color={colors.white} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backButtonPlaceholder} />
      )}
      <Typo 
        size={24} 
        color={colors.primary} 
        fontWeight="600" 
        style={styles.title}
      >
        {title}
      </Typo>
      <View style={styles.headerSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._20,
  },
  backButton: {
    borderRadius: radius._8,
    borderCurve: 'continuous',
    padding: 5,
  },
  backButtonPlaceholder: {
    width: 30,
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    flex: 1,
    marginTop: spacingY._5,
    alignSelf: "center",
    textAlign: "left",
    marginStart: spacingX._16,
  },
});
