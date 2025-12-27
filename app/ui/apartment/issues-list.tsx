import AppHeader from '@/components/AppHeader';
import EmptyState from '@/components/common/EmptyState';
import Shimmer from '@/components/common/Shimmer';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { getApartmentIssues, Issue } from '@/services/issueService';
import { router, useFocusEffect } from 'expo-router';
import {
    ArrowRight,
    Broom,
    Elevator,
    Plug,
    Shield,
    Thermometer,
    WarningCircle,
    Wrench
} from 'phosphor-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
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
    router.push({
      pathname: '/ui/apartment/issue-details',
      params: { issueId: issue.id },
    } as any);
  };

  // Render shimmer loading state
  const renderShimmerItems = () => {
    return Array.from({ length: 3 }).map((_, index) => (
      <View key={`shimmer-${index}`} style={[styles.issueCard, { backgroundColor: colors.neutral800 }]}>
        <View style={styles.issueContent}>
          <View style={styles.issueHeader}>
            <View style={styles.issueInfo}>
              <View style={styles.issueTypeRow}>
                <Shimmer width={40} height={40} borderRadius={radius._8} />
                <Shimmer width={100} height={18} borderRadius={radius._8} />
              </View>
            </View>
            <Shimmer width={60} height={24} borderRadius={radius._8} />
          </View>
          <View style={styles.issueDetails}>
            <Shimmer width={150} height={14} borderRadius={radius._8} style={{ marginBottom: spacingY._8 }} />
            <Shimmer width="100%" height={60} borderRadius={radius._8} style={{ marginBottom: spacingY._8 }} />
            <Shimmer width={100} height={12} borderRadius={radius._8} />
          </View>
        </View>
      </View>
    ));
  };

  if (error && !issues.length && !loading) {
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
          {loading && issues.length === 0 ? (
            <View style={styles.issuesList}>
              {renderShimmerItems()}
            </View>
          ) : issues.length === 0 ? (
            <EmptyState message={t('noIssuesFound') || 'No issues found'} />
          ) : (
            <View style={styles.issuesList}>
              {issues.map((issue) => {
                const statusColor = getStatusColor(issue.status);

                return (
                  <TouchableOpacity
                    key={issue.id}
                    onPress={() => handleIssuePress(issue)}
                    activeOpacity={0.7}
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
                        
                        <Typo size={12} color={colors.primaryBigTitle} style={styles.dateText}>
                          {formatDate(issue.createdAt)}
                        </Typo>
                      </View>
                    </View>
                    
                    {/* See Details Indicator */}
                    <View style={styles.seeDetailsContainer}>
                      <Typo size={14} color={colors.primary} fontWeight="600">
                        {t('seeDetails') || 'See details'}
                      </Typo>
                      <ArrowRight size={16} color={colors.primary} weight="bold" />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
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
  seeDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacingX._5,
    marginTop: spacingY._12,
    paddingTop: spacingY._12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
});

