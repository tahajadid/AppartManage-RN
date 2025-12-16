import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import { Bill } from '@/services/paymentService';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

interface BillWithResidentName extends Bill {
  residentName: string;
}

interface ChangePaymentStatusModalProps {
  visible: boolean;
  bill: BillWithResidentName | null;
  updatingStatus: boolean;
  onClose: () => void;
  onStatusChange: (newStatus: 'not_paid' | 'payment_requested' | 'paid') => void;
}

export default function ChangePaymentStatusModal({
  visible,
  bill,
  updatingStatus,
  onClose,
  onStatusChange,
}: ChangePaymentStatusModalProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();

  const getStatusColor = (status: Bill['status']) => {
    switch (status) {
      case 'paid':
        return colors.greenAdd;
      case 'payment_requested':
        return colors.brightOrange;
      case 'not_paid':
        return colors.redClose;
      default:
        return colors.subtitleText;
    }
  };

  const getStatusLabel = (status: Bill['status']) => {
    switch (status) {
      case 'paid':
        return t('paid') || 'Paid';
      case 'payment_requested':
        return t('paymentRequested') || 'Payment Requested';
      case 'not_paid':
        return t('notPaid') || 'Not Paid';
      default:
        return status;
    }
  };

  if (!bill) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        if (!updatingStatus) {
          onClose();
        }
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.neutral800 }]}>
          <View style={styles.modalHeader}>
            <Typo size={20} color={colors.titleText} fontWeight="700">
              {t('changeStatus') || 'Change Status'}
            </Typo>
            <TouchableOpacity
              onPress={() => {
                if (!updatingStatus) {
                  onClose();
                }
              }}
              disabled={updatingStatus}
            >
              <Typo size={24} color={colors.subtitleText}>
                ×
              </Typo>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBillInfo}>
            <Typo size={16} color={colors.titleText} fontWeight="600">
              {bill.residentName}
            </Typo>
            <Typo size={14} color={colors.subtitleText}>
              {bill.date} • {bill.amount} MAD
            </Typo>
            <View style={styles.currentStatusContainer}>
              <Typo size={14} color={colors.subtitleText}>
                {t('currentStatus') || 'Current Status'}:{' '}
              </Typo>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(bill.status) + '20' },
                ]}
              >
                <Typo
                  size={12}
                  color={getStatusColor(bill.status)}
                  fontWeight="600"
                >
                  {getStatusLabel(bill.status)}
                </Typo>
              </View>
            </View>
          </View>

          <View style={styles.statusButtons}>
            <TouchableOpacity
              style={[
                styles.statusButton,
                {
                  backgroundColor:
                    bill.status === 'not_paid'
                      ? colors.redClose
                      : colors.neutral700,
                },
              ]}
              onPress={() => onStatusChange('not_paid')}
              disabled={updatingStatus || bill.status === 'not_paid'}
            >
              <Typo
                size={14}
                color={
                  bill.status === 'not_paid' ? colors.white : colors.subtitleText
                }
                fontWeight="600"
              >
                {t('notPaid') || 'Not Paid'}
              </Typo>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statusButton,
                {
                  backgroundColor:
                    bill.status === 'payment_requested'
                      ? colors.brightOrange
                      : colors.neutral700,
                },
              ]}
              onPress={() => onStatusChange('payment_requested')}
              disabled={updatingStatus || bill.status === 'payment_requested'}
            >
              <Typo
                size={14}
                color={
                  bill.status === 'payment_requested'
                    ? colors.white
                    : colors.subtitleText
                }
                fontWeight="600"
              >
                {t('requestPayment') || 'Request Payment'}
              </Typo>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statusButton,
                {
                  backgroundColor:
                    bill.status === 'paid' ? colors.greenAdd : colors.neutral700,
                },
              ]}
              onPress={() => onStatusChange('paid')}
              disabled={updatingStatus || bill.status === 'paid'}
            >
              <Typo
                size={14}
                color={
                  bill.status === 'paid' ? colors.white : colors.subtitleText
                }
                fontWeight="600"
              >
                {t('paid') || 'Paid'}
              </Typo>
            </TouchableOpacity>
          </View>

          {updatingStatus && (
            <View style={styles.updatingIndicator}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacingX._20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: radius._16,
    padding: spacingX._20,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingY._20,
  },
  modalBillInfo: {
    marginBottom: spacingY._20,
    gap: spacingY._8,
  },
  currentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._8,
    marginTop: spacingY._8,
  },
  statusBadge: {
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._5,
    borderRadius: radius._8,
  },
  statusButtons: {
    gap: spacingY._12,
  },
  statusButton: {
    paddingVertical: spacingY._12,
    paddingHorizontal: spacingX._16,
    borderRadius: radius._10,
    alignItems: 'center',
  },
  updatingIndicator: {
    marginTop: spacingY._16,
    alignItems: 'center',
  },
});

