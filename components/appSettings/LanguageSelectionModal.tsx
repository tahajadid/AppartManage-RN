import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { Fonts } from '@/hooks/fonts';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'ar', name: 'العربية' },
];

interface LanguageSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onLanguageSelect: (langCode: 'en' | 'ar' | 'fr') => void;
}

export default function LanguageSelectionModal({
  visible,
  onClose,
  onLanguageSelect,
}: LanguageSelectionModalProps) {
  const colors = useThemeColors();
  const { currentLanguage } = useRTL();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.neutral900, paddingBottom: insets.bottom + spacingY._32 },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.modalHeader}>
            <Typo size={20} color={colors.titleText} fontWeight="700">
              {t('selectLanguage')}
            </Typo>
            <TouchableOpacity onPress={onClose}>
              <Typo size={16} color={colors.primary} fontWeight="600">
                {t('done')}
              </Typo>
            </TouchableOpacity>
          </View>
          <View style={styles.languageList}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageItem,
                  currentLanguage === lang.code && {
                    backgroundColor: `${colors.primary}20`,
                  },
                ]}
                onPress={() => onLanguageSelect(lang.code as 'en' | 'ar' | 'fr')}
              >
                <Typo
                  size={16}
                  color={currentLanguage === lang.code ? colors.primary : colors.titleText}
                  fontWeight={currentLanguage === lang.code ? '700' : '400'}
                  style={lang.code === 'ar' ? { fontFamily: Fonts.ARABIC } :  { fontFamily: Fonts.ENGLISH }}
                >
                  {lang.name}
                </Typo>
                {currentLanguage === lang.code && (
                  <View style={[styles.checkIndicator, { backgroundColor: colors.primary }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: radius._20,
    borderTopRightRadius: radius._20,
    paddingTop: spacingY._20,
    paddingHorizontal: spacingX._20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingY._20,
  },
  languageList: {
    gap: spacingY._8,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacingX._16,
    borderRadius: radius._12,
  },
  checkIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

