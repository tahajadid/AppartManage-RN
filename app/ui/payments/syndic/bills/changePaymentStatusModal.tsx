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
  onStatusChange: (newStatus: 'unpaid' | 'pending' | 'paid') => void;
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
      case 'pending':
        return colors.brightOrange;
      case 'unpaid':
        return colors.redClose;
      default:
        return colors.subtitleText;
    }
  };

  const getStatusLabel = (status: Bill['status']) => {
    switch (status) {
      case 'paid':
        return t('paid') || 'Paid';
      case 'pending':
        return t('pending') || 'Pending';
      case 'unpaid':
        return t('unpaid') || 'Unpaid';
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
            <Typo size={18} color={colors.titleText} fontWeight="600">
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

          <View style={{backgroundColor: colors.neutral700, marginTop:spacingY._5,
           marginBottom:spacingY._16, borderRadius: radius._1, height:spacingX._1}}>
          </View>

          <View style={styles.modalBillInfo}>
            <Typo size={18} color={colors.primaryBigTitle} fontWeight="700">
              {bill.residentName}
            </Typo>
            <Typo size={16} color={colors.text}>
               {t('date')} : {bill.date}
            </Typo>
            <Typo size={16} color={colors.text}>
               {t('amount')} : {bill.amount} MAD
            </Typo>
            <View style={styles.currentStatusContainer}>
              <Typo size={14} color={colors.primary}>
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
                    bill.status === 'unpaid'
                      ? colors.redClose
                      : colors.neutral700,
                },
              ]}
              onPress={() => onStatusChange('unpaid')}
              disabled={updatingStatus || bill.status === 'unpaid'}
            >
              <Typo
                size={14}
                color={
                  bill.status === 'unpaid' ? colors.white : colors.subtitleText
                }
                fontWeight="600"
              >
                {t('unpaid') || 'Unpaid'}
              </Typo>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statusButton,
                {
                  backgroundColor:
                    bill.status === 'pending'
                      ? colors.brightOrange
                      : colors.neutral700,
                },
              ]}
              onPress={() => onStatusChange('pending')}
              disabled={updatingStatus || bill.status === 'pending'}
            >
              <Typo
                size={14}
                color={
                  bill.status === 'pending'
                    ? colors.white
                    : colors.subtitleText
                }
                fontWeight="600"
              >
                {t('pending') || 'Pending'}
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
    marginBottom: spacingY._8,
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

