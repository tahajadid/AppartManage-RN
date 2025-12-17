import PrimaryButton from '@/components/PrimaryButton';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { Trash } from 'phosphor-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DeleteConfirmationModalProps {
  visible: boolean;
  loading?: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmationModal({
  visible,
  loading = false,
  title,
  message,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.neutral800 }]}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: colors.redClose + '20' }]}>
            <Trash size={48} color={colors.redClose} weight="bold" />
          </View>

          {/* Title */}
          <Typo size={20} color={colors.titleText} fontWeight="700" style={styles.title}>
            {title || t('delete') || 'Delete'}
          </Typo>

          {/* Message */}
          <Typo size={16} color={colors.subtitleText} style={styles.message}>
            {message}
          </Typo>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.cancelButton, { backgroundColor: colors.neutral700 }]}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Typo size={16} color={colors.text} fontWeight="600">
                {t('cancel') || 'Cancel'}
              </Typo>
            </TouchableOpacity>

            <PrimaryButton
              onPress={onConfirm}
              backgroundColor={colors.redClose}
              loading={loading}
              disabled={loading}
              style={styles.confirmButton}
            >
              <Typo size={16} color={colors.white} fontWeight="600">
                {t('delete') || 'Delete'}
              </Typo>
            </PrimaryButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacingX._20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    borderRadius: radius._16,
    padding: spacingX._24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacingY._20,
  },
  title: {
    marginBottom: spacingY._12,
    textAlign: 'center',
  },
  message: {
    marginBottom: spacingY._24,
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: spacingX._12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacingY._16,
    borderRadius: radius._10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    flex: 1,
  },
});

