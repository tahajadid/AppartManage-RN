import { radius, spacingX, spacingY } from '@/constants/theme';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { Fonts } from '@/hooks/fonts';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LanguageSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isRTL, currentLanguage, changeLanguage, refreshKey } = useRTL();

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
          backgroundColor: colors.neutral800,
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
                currentLanguage === 'ar' && {backgroundColor: colors.neutral700},
              ]}
              onPress={() => handleLanguageChange('ar')}
            >
              <Text style={[styles.buttonText, { color: textColor, fontFamily: Fonts.ARABIC  }]}>العربية</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                currentLanguage === 'en' && {backgroundColor: colors.neutral700},
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={[styles.buttonText, {color: textColor, fontFamily: Fonts.ENGLISH }]}>English</Text>
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
                currentLanguage === 'en' && {backgroundColor: colors.neutral700},
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={[styles.buttonText, { color: textColor, fontFamily: Fonts.ENGLISH }]}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                currentLanguage === 'ar' && {backgroundColor: colors.neutral700},
              ]}
              onPress={() => handleLanguageChange('ar')}
            >
              <Text style={[styles.buttonText, { color: textColor, fontFamily: Fonts.ARABIC  }]}>العربية</Text>
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
    alignSelf: 'flex-start',
    alignItems: 'center',
    marginBottom: spacingY._24,
    padding: spacingX._5,
    borderRadius: radius._8,
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
  },
  buttonText: {
    fontSize: 14,
    alignContent:"center",
    justifyContent:"center",
    alignItems:"center",
    textAlign:"center",
    textAlignVertical:"auto",
  },
});

