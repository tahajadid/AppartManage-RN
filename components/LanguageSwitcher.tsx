import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { useFontFamily } from '@/hooks/fonts';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LanguageSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isRTL, currentLanguage, changeLanguage, refreshKey } = useRTL();
  const fontFamily = useFontFamily();

  const textColor = colors.neutral300;
  const tintColor = colors.neutral100;

  const handleLanguageChange = React.useCallback(async (lang: 'en' | 'ar') => {
    await changeLanguage(lang);
  }, [changeLanguage]);

  // Force re-render when language or RTL changes
  React.useEffect(() => {
    // This effect ensures the component updates when RTL state changes
  }, [isRTL, currentLanguage, refreshKey]);

  return (
    <View
      key={`lang-switcher-${refreshKey}-${currentLanguage}-${isRTL ? 'rtl' : 'ltr'}`}
      style={[
        styles.container,
        {
          flexDirection: 'row',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
      ]}
    >
      {isRTL ? (
        <>
          <View 
            style={[
              styles.buttonsContainer,
              { flexDirection: 'row' },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.button,
                currentLanguage === 'ar' && styles.buttonActive,
                { borderColor: tintColor },
              ]}
              onPress={() => handleLanguageChange('ar')}
            >
              <Text style={[styles.buttonText, { color: textColor, fontFamily }]}>العربية</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                currentLanguage === 'en' && styles.buttonActive,
                { borderColor: tintColor },
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={[styles.buttonText, { color: textColor, fontFamily }]}>English</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View 
            style={[
              styles.buttonsContainer,
              { flexDirection: 'row' },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.button,
                currentLanguage === 'en' && styles.buttonActive,
                { borderColor: tintColor },
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={[styles.buttonText, { color: textColor, fontFamily }]}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                currentLanguage === 'ar' && styles.buttonActive,
                { borderColor: tintColor },
              ]}
              onPress={() => handleLanguageChange('ar')}
            >
              <Text style={[styles.buttonText, { color: textColor, fontFamily }]}>العربية</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default LanguageSwitcher;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    padding: 12,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonsContainer: {
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  buttonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonText: {
    fontSize: 14,
  },
});

