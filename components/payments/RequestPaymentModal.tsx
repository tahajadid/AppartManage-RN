import PrimaryButton from '@/components/PrimaryButton';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import { Bill } from '@/services/paymentService';
import { Money } from 'phosphor-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Modal,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

interface RequestPaymentModalProps {
  visible: boolean;
  bill: Bill | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function RequestPaymentModal({
  visible,
  bill,
  loading = false,
  onClose,
  onConfirm,
}: RequestPaymentModalProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        if (!loading) {
          onClose();
        }
      }}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.neutral800 }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Money size={48} color={colors.primary} weight="bold" />
          </View>

          <Typo size={20} color={colors.titleText} fontWeight="700" style={styles.title}>
            {t('requestPayment') || 'Request Payment'}
          </Typo>

          <Typo size={14} color={colors.subtitleText} style={styles.message}>
            {t('requestPaymentMessage') || 'Please transfer the payment amount to the syndic. Once the transfer is complete, click confirm to notify the syndic.'}
          </Typo>

          {bill && (
            <View style={[styles.amountContainer, { backgroundColor: colors.primary + '20' }]}>
              <Typo size={14} color={colors.subtitleText} style={styles.amountLabel}>
                {t('amountToPay') || 'Amount to Pay'}
              </Typo>
              <Typo size={24} color={colors.text} fontWeight="700">
                {bill.amount} MAD
              </Typo>
            </View>
          )}

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
              backgroundColor={colors.primary}
              loading={loading}
              disabled={loading}
              style={styles.confirmButton}
            >
              <Typo size={16} color={colors.white} fontWeight="600">
                {t('confirm') || 'Confirm'}
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
  amountContainer: {
    width: '100%',
    padding: spacingX._16,
    borderRadius: radius._12,
    alignItems: 'center',
    marginBottom: spacingY._24,
  },
  amountLabel: {
    marginBottom: spacingY._8,
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

