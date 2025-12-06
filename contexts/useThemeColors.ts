// hooks/useThemeColors.ts
import { darkTheme, lightTheme } from '@/constants/theme';
import { useTheme } from '@/contexts/themeContext';

export default function useThemeColors() {
  const { theme } = useTheme();
  return theme === 'dark' ? darkTheme : lightTheme;
}