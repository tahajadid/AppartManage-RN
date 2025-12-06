import { useRTL } from '@/contexts/RTLContext';

/**
 * Font family names as registered in expo-font
 */
export const Fonts = {
  ENGLISH: 'Rubik',
  ARABIC: 'NotoKufiArabic',
} as const;

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

