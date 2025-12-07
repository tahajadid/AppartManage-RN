import { useRTL } from '@/contexts/RTLContext';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

/**
 * Font family names as registered in expo-font
 */
export const Fonts = {
  ENGLISH: 'Rubik',
  ARABIC: 'Nawar',
} as const;

/**
 * Hook to load fonts and handle splash screen
 * @returns true if fonts are loaded, false otherwise
 */
export const useLoadFonts = (): boolean => {
  const [fontsLoaded, fontError] = useFonts({
    'Rubik': require('../assets/font/Rubik.ttf'),
    'Nawar': require('../assets/font/Nawar.otf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide splash screen once fonts are loaded or if there's an error
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  return fontsLoaded || !!fontError;
};

/**
 * Hook to get the appropriate font family based on current language
 * @returns The font family name for the current language
 */
export const useFontFamily = (): string => {
  const { currentLanguage } = useRTL();
  return currentLanguage === 'ar' ? Fonts.ARABIC : Fonts.ENGLISH;
};

/**
 * Get font family based on language (non-hook version for use outside components)
 * @param language - The language code ('en' or 'ar')
 * @returns The font family name for the given language
 */
export const getFontFamily = (language: string): string => {
  return language === 'ar' ? Fonts.ARABIC : Fonts.ENGLISH;
};

