import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import { Issue } from '@/services/issueService';
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

interface ChangeIssueStatusModalProps {
  visible: boolean;
  issue: Issue | null;
  updatingStatus: boolean;
  onClose: () => void;
  onStatusChange: (newStatus: 'open' | 'closed') => void;
}

export default function ChangeIssueStatusModal({
  visible,
  issue,
  updatingStatus,
  onClose,
  onStatusChange,
}: ChangeIssueStatusModalProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'closed':
        return colors.greenAdd;
      case 'open':
        return colors.redClose;
      default:
        return colors.subtitleText;
    }
  };

  const getStatusLabel = (status: Issue['status']) => {
    switch (status) {
      case 'closed':
        return t('closedIssue') || 'Closed';
      case 'open':
        return t('openIssue') || 'Open';
      default:
        return status;
    }
  };

  if (!issue) return null;

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

          <View style={styles.modalIssueInfo}>
            <Typo size={18} color={colors.primaryBigTitle} fontWeight="700">
              {t(issue.type) || issue.type}
            </Typo>
            <Typo size={16} color={colors.text}>
              {t('reportedBy') || 'Reported by'}: {issue.nameOfReported}
            </Typo>
            <Typo size={14} color={colors.subtitleText} style={styles.description}>
              {issue.description}
            </Typo>
            <View style={styles.currentStatusContainer}>
              <Typo size={14} color={colors.primary}>
                {t('currentStatus') || 'Current Status'}:{' '}
              </Typo>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(issue.status) + '20' },
                ]}
              >
                <Typo
                  size={12}
                  color={getStatusColor(issue.status)}
                  fontWeight="600"
                >
                  {getStatusLabel(issue.status)}
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
                    issue.status === 'open'
                      ? colors.redClose
                      : colors.neutral700,
                },
              ]}
              onPress={() => onStatusChange('open')}
              disabled={updatingStatus || issue.status === 'open'}
            >
              <Typo
                size={14}
                color={
                  issue.status === 'open' ? colors.white : colors.subtitleText
                }
                fontWeight="600"
              >
                {t('openIssue') || 'Open'}
              </Typo>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statusButton,
                {
                  backgroundColor:
                    issue.status === 'closed' ? colors.greenAdd : colors.neutral700,
                },
              ]}
              onPress={() => onStatusChange('closed')}
              disabled={updatingStatus || issue.status === 'closed'}
            >
              <Typo
                size={14}
                color={
                  issue.status === 'closed' ? colors.white : colors.subtitleText
                }
                fontWeight="600"
              >
                {t('closedIssue') || 'Closed'}
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
  modalIssueInfo: {
    marginBottom: spacingY._20,
    gap: spacingY._8,
  },
  description: {
    marginTop: spacingY._8,
    lineHeight: 20,
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

