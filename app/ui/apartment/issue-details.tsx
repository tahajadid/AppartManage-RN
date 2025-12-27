import AppHeader from '@/components/AppHeader';
import InfoModal from '@/components/common/InfoModal';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { getApartmentIssues, Issue, updateIssueStatus } from '@/services/issueService';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
    Broom,
    CheckCircle,
    Elevator,
    Plug,
    Shield,
    Thermometer,
    WarningCircle,
    Wrench,
    XCircle
} from 'phosphor-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dimensions,
    Modal,
    Image as RNImage,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IssueDetailsScreen() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { apartmentId, role } = useOnboarding();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { issueId } = useLocalSearchParams<{ issueId: string }>();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [successModalVisible, setSuccessModalVisible] = useState<boolean>(false);
  const [errorModalVisible, setErrorModalVisible] = useState<boolean>(false);
  const [errorModalMessage, setErrorModalMessage] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isSyndic = role === 'syndic' || role === 'syndic_resident';

  useEffect(() => {
    if (apartmentId && issueId) {
      loadIssue();
    } else {
      setLoading(false);
      setError('Issue not found');
    }
  }, [apartmentId, issueId]);

  useFocusEffect(
    useCallback(() => {
      if (apartmentId && issueId) {
        loadIssue();
      }
    }, [apartmentId, issueId])
  );

  const loadIssue = async () => {
    if (!apartmentId || !issueId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getApartmentIssues(apartmentId);

      if (result.success && result.issues) {
        const foundIssue = result.issues.find((i) => i.id === issueId);
        if (foundIssue) {
          setIssue(foundIssue);
        } else {
          setError('Issue not found');
        }
      } else {
        setError(result.error || 'Failed to load issue');
      }
    } catch (err: any) {
      console.log('Error loading issue:', err);
      setError('An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseIssue = async () => {
    if (!apartmentId || !issue || issue.status === 'closed') return;

    setUpdatingStatus(true);
    setError(null);

    try {
      const result = await updateIssueStatus(apartmentId, issue.id, 'closed');

      if (result.success) {
        setSuccessModalVisible(true);
        await loadIssue(); // Reload to show updated status
      } else {
        setErrorModalMessage(result.error || 'Failed to close issue');
        setErrorModalVisible(true);
      }
    } catch (err: any) {
      console.log('Error closing issue:', err);
      setErrorModalMessage(t('errorOccurred') || 'An error occurred, please try again');
      setErrorModalVisible(true);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getIssueTypeIcon = (type: Issue['type']) => {
    const iconProps = { size: 32, weight: 'regular' as const };
    switch (type) {
      case 'plumbing':
        return <Wrench {...iconProps} color={colors.primary} />;
      case 'electrical':
        return <Plug {...iconProps} color={colors.primary} />;
      case 'heating':
        return <Thermometer {...iconProps} color={colors.primary} />;
      case 'elevator':
        return <Elevator {...iconProps} color={colors.primary} />;
      case 'security':
        return <Shield {...iconProps} color={colors.primary} />;
      case 'cleaning':
        return <Broom {...iconProps} color={colors.primary} />;
      default:
        return <WarningCircle {...iconProps} color={colors.primary} />;
    }
  };

  const getIssueTypeLabel = (type: Issue['type']) => {
    return t(type) || type;
  };

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'closed':
        return colors.greenAdd;
      default:
        return colors.redClose;
    }
  };

  const getStatusLabel = (status: Issue['status']) => {
    switch (status) {
      case 'closed':
        return t('closedIssue') || 'Closed';
      default:
        return t('openIssue') || 'Open';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
          <AppHeader title={t('issueDetails') || 'Issue Details'} />
          <View style={styles.loadingContainer}>
            <Typo size={16} color={colors.subtitleText}>
              {t('loading') || 'Loading...'}
            </Typo>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  if (error || !issue) {
    return (
      <ScreenWrapper>
        <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
          <AppHeader title={t('issueDetails') || 'Issue Details'} />
          <View style={styles.errorContainer}>
            <Typo size={16} color={colors.redClose}>
              {error || 'Issue not found'}
            </Typo>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  const statusColor = getStatusColor(issue.status);
  const StatusIcon = issue.status === 'closed' ? CheckCircle : XCircle;
  const canClose = isSyndic && issue.status === 'open';

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
        <AppHeader title={t('issueDetails') || 'Issue Details'} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacingY._20 },
            { direction: isRTL ? 'rtl' : 'ltr' },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Issue Header Card */}
          <View style={[styles.headerCard, { backgroundColor: colors.neutral800 }]}>
            <View style={styles.issueTypeRow}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                {getIssueTypeIcon(issue.type)}
              </View>
              <View style={styles.issueTypeInfo}>
                <Typo size={20} color={colors.primary} fontWeight="700">
                  {getIssueTypeLabel(issue.type)}
                </Typo>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                  <StatusIcon size={16} color={statusColor} weight="fill" />
                  <Typo size={14} color={statusColor} fontWeight="600" style={styles.statusText}>
                    {getStatusLabel(issue.status)}
                  </Typo>
                </View>
              </View>
            </View>
          </View>

          {/* Issue Information */}
          <View style={[styles.infoCard, { backgroundColor: colors.neutral800 }]}>
            <View style={styles.infoRow}>
              <Typo size={14} color={colors.neutral400} fontWeight="500">
                {t('reportedBy') || 'Reported by'}
              </Typo>
              <Typo size={16} color={colors.titleText} fontWeight="600">
                {issue.nameOfReported}
              </Typo>
            </View>

            <View style={[styles.separator, { backgroundColor: colors.neutral700 }]} />

            <View style={styles.infoRow}>
              <Typo size={14} color={colors.neutral400} fontWeight="500">
                {t('description') || 'Description'}
              </Typo>
              <Typo size={16} color={colors.text} style={styles.descriptionText}>
                {issue.description}
              </Typo>
            </View>

            <View style={[styles.separator, { backgroundColor: colors.neutral700 }]} />

            <View style={styles.infoRow}>
              <Typo size={14} color={colors.neutral400} fontWeight="500">
                {t('reportedDate') || 'Reported Date'}
              </Typo>
              <Typo size={16} color={colors.titleText} fontWeight="600">
                {formatDate(issue.createdAt)}
              </Typo>
            </View>
          </View>

          {/* Images Section */}
          {issue.images && issue.images.length > 0 && (
            <View style={[styles.imagesCard, { backgroundColor: colors.neutral800 }]}>
              <Typo size={18} color={colors.titleText} fontWeight="600" style={styles.sectionTitle}>
                {t('imagesTitle')}
              </Typo>
              <View style={styles.imagesGrid}>
                {issue.images.map((imageUri, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.imageContainer}
                    onPress={() => setSelectedImage(imageUri)}
                    activeOpacity={0.8}
                  >
                    <RNImage source={{ uri: imageUri }} style={styles.image} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Close Issue Button (Syndic only, if issue is open) */}
          {canClose && (
            <View style={styles.actionContainer}>
              <PrimaryButton
                onPress={handleCloseIssue}
                backgroundColor={colors.greenAdd}
                loading={updatingStatus}
                style={styles.closeButton}
              >
                <CheckCircle size={20} color={colors.white} weight="bold" />
                <Typo size={16} color={colors.white} fontWeight="600" style={styles.buttonText}>
                  {t('closeIssue') || 'Close Issue'}
                </Typo>
              </PrimaryButton>
            </View>
          )}
        </ScrollView>

        {/* Success Modal */}
        <InfoModal
          visible={successModalVisible}
          type="success"
          title={t('success') || 'Success'}
          message={t('issueClosed') || 'Issue has been closed successfully'}
          onClose={() => {
            setSuccessModalVisible(false);
            router.back();
          }}
          showCancel={false}
        />

        {/* Error Modal */}
        <InfoModal
          visible={errorModalVisible}
          type="error"
          title={t('error') || 'Error'}
          message={errorModalMessage}
          onClose={() => setErrorModalVisible(false)}
          showCancel={false}
        />

        {/* Full Screen Image Modal */}
        <Modal
          visible={selectedImage !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedImage(null)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setSelectedImage(null)}
            style={[styles.fullScreenImageContainer, { backgroundColor: 'rgba(0, 0, 0, 0.95)' }]}
          >
            <TouchableOpacity
              style={[styles.closeImageButton, { top: insets.top + spacingY._20 }]}
              onPress={() => setSelectedImage(null)}
              activeOpacity={0.7}
            >
              <XCircle size={32} color={colors.white} weight="fill" />
            </TouchableOpacity>
            {selectedImage && (
              <ScrollView
                style={styles.fullScreenImageScrollView}
                contentContainerStyle={styles.fullScreenImageScrollContent}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                bounces={true}
                centerContent={true}
              >
                <View style={styles.fullScreenImageWrapper}>
                  <RNImage
                    source={{ uri: selectedImage }}
                    style={styles.fullScreenImage}
                    resizeMode="contain"
                    onError={(error) => {
                      console.log('Image load error:', error);
                      console.log('Image URI:', selectedImage);
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', selectedImage);
                    }}
                  />
                </View>
              </ScrollView>
            )}
          </TouchableOpacity>
        </Modal>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacingY._24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacingX._20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacingX._20,
  },
  headerCard: {
    borderRadius: radius._12,
    padding: spacingX._16,
    marginBottom: spacingY._16,
  },
  issueTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: radius._12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  issueTypeInfo: {
    flex: 1,
    gap: spacingY._8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._5,
    borderRadius: radius._8,
    gap: spacingX._5,
  },
  statusText: {
    marginLeft: spacingX._5,
  },
  infoCard: {
    borderRadius: radius._12,
    padding: spacingX._16,
    marginBottom: spacingY._16,
  },
  infoRow: {
    gap: spacingY._8,
  },
  separator: {
    height: 1,
    marginVertical: spacingY._12,
  },
  descriptionText: {
    lineHeight: 24,
    marginTop: spacingY._5,
  },
  imagesCard: {
    borderRadius: radius._12,
    padding: spacingX._16,
    marginBottom: spacingY._16,
  },
  sectionTitle: {
    marginBottom: spacingY._12,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacingX._12,
  },
  imageContainer: {
    width: '46%',
    aspectRatio: 1,
    borderRadius: radius._10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  actionContainer: {
    marginTop: spacingY._8,
    marginBottom: spacingY._16,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingX._8,
  },
  buttonText: {
    marginLeft: spacingX._5,
  },
  fullScreenImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  closeImageButton: {
    position: 'absolute',
    right: spacingX._20,
    top: spacingY._20,
    zIndex: 10,
    padding: spacingX._8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: radius._20,
  },
  fullScreenImageScrollView: {
    flex: 1,
    width: '100%',
  },
  fullScreenImageScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Dimensions.get('window').height,
  },
  fullScreenImageWrapper: {
    width: Dimensions.get('window').width,
    minHeight: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._60,
  },
  fullScreenImage: {
    width: Dimensions.get('window').width - spacingX._40,
    height: Dimensions.get('window').height - (spacingY._60 * 2),
    minHeight: 300,
  },
});

