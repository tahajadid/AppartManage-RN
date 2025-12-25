import AppHeader from '@/components/AppHeader';
import EmptyState from '@/components/common/EmptyState';
import InfoModal from '@/components/common/InfoModal';
import ChangeIssueStatusModal from '@/components/issues/ChangeIssueStatusModal';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { getApartmentIssues, Issue, updateIssueStatus } from '@/services/issueService';
import { useFocusEffect } from 'expo-router';
import {
    Broom,
    Elevator,
    Plug,
    Shield, Swap, Thermometer,
    WarningCircle,
    Wrench
} from 'phosphor-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Image as RNImage,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IssuesListScreen() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { apartmentId, role } = useOnboarding();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [errorModalVisible, setErrorModalVisible] = useState<boolean>(false);
  const [errorModalMessage, setErrorModalMessage] = useState<string>('');

  const isSyndic = role === 'syndic' || role === 'syndic_resident';

  useEffect(() => {
    if (apartmentId) {
      loadIssues();
    } else {
      setLoading(false);
      setError('No apartment found');
    }
  }, [apartmentId]);

  useFocusEffect(
    useCallback(() => {
      if (apartmentId) {
        loadIssues();
      }
    }, [apartmentId])
  );

  const loadIssues = async () => {
    if (!apartmentId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getApartmentIssues(apartmentId);
      
      if (result.success && result.issues) {
        // Sort by date (newest first)
        const sortedIssues = [...result.issues].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setIssues(sortedIssues);
      } else {
        setError(result.error || 'Failed to load issues');
      }
    } catch (err: any) {
      console.log('Error loading issues:', err);
      setError('An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  const getIssueTypeIcon = (type: Issue['type']) => {
    const iconProps = { size: 24, weight: 'regular' as const };
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
    return `${day}/${month}/${year}`;
  };

  const handleIssuePress = (issue: Issue) => {
    if (isSyndic) {
      setSelectedIssue(issue);
      setModalVisible(true);
    }
  };

  const handleStatusChange = async (newStatus: 'open' | 'closed') => {
    if (!apartmentId || !selectedIssue) return;

    setUpdatingStatus(true);

    try {
      const result = await updateIssueStatus(
        apartmentId,
        selectedIssue.id,
        newStatus
      );

      if (result.success) {
        setModalVisible(false);
        setSelectedIssue(null);
        // Reload issues to show updated status
        await loadIssues();
      } else {
        setErrorModalMessage(result.error || 'Failed to update status');
        setErrorModalVisible(true);
      }
    } catch (err: any) {
      console.log('Error updating status:', err);
      setErrorModalMessage(t('errorOccurred') || 'An error occurred, please try again');
      setErrorModalVisible(true);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
          <AppHeader title={t('apartmentIssues') || 'Apartment Issues'} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper>
        <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
          <AppHeader title={t('apartmentIssues') || 'Apartment Issues'} />
          <View style={styles.errorContainer}>
            <Typo size={16} color={colors.redClose}>
              {error}
            </Typo>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
        <AppHeader title={t('apartmentIssues') || 'Apartment Issues'} />
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacingY._20 },
            { direction: isRTL ? 'rtl' : 'ltr' },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {issues.length === 0 ? (
            <EmptyState message={t('noIssuesFound') || 'No issues found'} />
          ) : (
            <View style={styles.issuesList}>
              {issues.map((issue) => {
                const statusColor = getStatusColor(issue.status);

                return (
                  <View 
                    key={issue.id} 
                    style={[styles.issueCard, { backgroundColor: colors.neutral800 }]}
                  >
                    <View style={[styles.issueContent, { backgroundColor: colors.neutral800 }]}>
                      <View style={styles.issueHeader}>
                        <View style={styles.issueInfo}>
                          <View style={styles.issueTypeRow}>
                            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                              {getIssueTypeIcon(issue.type)}
                            </View>
                            <Typo size={18} color={colors.primary} fontWeight="600">
                              {getIssueTypeLabel(issue.type)}
                            </Typo>
                          </View>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                          <Typo size={12} color={statusColor} fontWeight="600">
                            {getStatusLabel(issue.status)}
                          </Typo>
                        </View>
                      </View>

                      <View style={styles.issueDetails}>
                        <Typo size={14} color={colors.subtitleText} style={styles.reportedBy}>
                          {t('reportedBy') || 'Reported by'}: {issue.nameOfReported}
                        </Typo>
                        
                        <Typo size={14} color={colors.text} 
                        style={{ color: colors.text, lineHeight: 20, backgroundColor: colors.neutral850,
                         borderRadius: radius._4, padding: spacingX._8}}>
                          {issue.description}
                        </Typo>
                        
                        {issue.images && issue.images.length > 0 && (
                          <View style={styles.imagesContainer}>
                            {issue.images.slice(0, 2).map((imageUri, index) => (
                              <RNImage
                                key={index}
                                source={{ uri: imageUri }}
                                style={styles.issueImage}
                              />
                            ))}
                          </View>
                        )}
                        
                        <Typo size={12} color={colors.primaryBigTitle} style={styles.dateText}>
                          {formatDate(issue.createdAt)}
                        </Typo>
                      </View>
                    </View>

                    {isSyndic && (
                      <TouchableOpacity
                        onPress={() => handleIssuePress(issue)}
                        style={[styles.changeStatusButton, { backgroundColor: colors.neutral400 }]}
                        activeOpacity={0.7}
                      >
                        <Swap size={16} color={colors.white} weight="regular" />
                        <Typo size={14} color={colors.white} fontWeight="600" style={styles.changeStatusText}>
                          {t('changeState') || 'Change State'}
                        </Typo>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Change Issue Status Modal */}
        <ChangeIssueStatusModal
          visible={modalVisible}
          issue={selectedIssue}
          updatingStatus={updatingStatus}
          onClose={() => {
            setModalVisible(false);
            setSelectedIssue(null);
          }}
          onStatusChange={handleStatusChange}
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
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacingY._24
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacingX._20,
  },
  issuesList: {
    gap: spacingY._16,
  },
  issueCard: {
    borderRadius: radius._12,
    marginBottom: spacingY._8,
    overflow: 'hidden',
  },
  issueContent: {
    padding: spacingX._12,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacingY._12,
  },
  statusBadge: {
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._5,
    borderRadius: radius._8,
    marginStart: spacingX._12,
  },
  issueInfo: {
    flex: 1,
  },
  issueTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: radius._8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  issueDetails: {
    gap: spacingY._8,
  },
  reportedBy: {
    fontStyle: 'italic',
  },
  description: {
    lineHeight: 20,
  },
  imagesContainer: {
    flexDirection: 'row',
    gap: spacingX._8,
    marginTop: spacingY._8,
  },
  issueImage: {
    width: 80,
    height: 80,
    borderRadius: radius._8,
    resizeMode: 'cover',
  },
  dateText: {
    marginTop: spacingY._5,
  },
  changeStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacingY._8,
    margin: spacingY._8,
    paddingHorizontal: spacingX._16,
    borderRadius: radius._10,
    gap: spacingX._8,
  },
  changeStatusText: {
    marginLeft: spacingX._5,
  },
});

