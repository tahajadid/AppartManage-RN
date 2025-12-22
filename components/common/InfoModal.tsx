import PrimaryButton from '@/components/PrimaryButton';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import { CheckCircle, Info, Warning, XCircle } from 'phosphor-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

export type InfoModalType = 'success' | 'error' | 'warning' | 'info';

interface InfoModalProps {
  visible: boolean;
  type: InfoModalType;
  title: string;
  message: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export default function InfoModal({
  visible,
  type,
  title,
  message,
  loading = false,
  onClose,
  onConfirm,
  confirmText,
  cancelText,
  showCancel = true,
}: InfoModalProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={48} color={colors.green} weight="bold" />;
      case 'error':
        return <XCircle size={48} color={colors.redClose} weight="bold" />;
      case 'warning':
        return <Warning size={48} color={colors.gold} weight="bold" />;
      case 'info':
        return <Info size={48} color={colors.primary} weight="bold" />;
      default:
        return <Info size={48} color={colors.primary} weight="bold" />;
    }
  };

  const getIconBackgroundColor = () => {
    switch (type) {
      case 'success':
        return colors.green + '20';
      case 'error':
        return colors.redClose + '20';
      case 'warning':
        return colors.gold + '20';
      case 'info':
        return colors.primary + '20';
      default:
        return colors.primary + '20';
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'success':
        return colors.green;
      case 'error':
        return colors.redClose;
      case 'warning':
        return colors.gold;
      case 'info':
        return colors.primary;
      default:
        return colors.primary;
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

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
          <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor() }]}>
            {getIcon()}
          </View>

          {/* Title */}
          <Typo size={20} color={colors.titleText} fontWeight="700" style={styles.title}>
            {title}
          </Typo>

          {/* Message */}
          <Typo size={16} color={colors.subtitleText} style={styles.message}>
            {message}
          </Typo>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            {showCancel && (
              <TouchableOpacity
                onPress={onClose}
                style={[styles.cancelButton, { backgroundColor: colors.neutral700 }]}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Typo size={16} color={colors.text} fontWeight="600">
                  {cancelText || t('cancel') || 'Cancel'}
                </Typo>
              </TouchableOpacity>
            )}

            <PrimaryButton
              onPress={handleConfirm}
              backgroundColor={getConfirmButtonColor()}
              loading={loading}
              disabled={loading}
              style={StyleSheet.flatten([styles.confirmButton, !showCancel && styles.fullWidthButton])}
            >
              <Typo size={16} color={colors.white} fontWeight="600">
                {confirmText || t('ok') || 'OK'}
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
  fullWidthButton: {
    flex: 1,
    width: '100%',
  },
});

