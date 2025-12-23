import AppHeader from '@/components/AppHeader';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { getApartmentIssues, Issue } from '@/services/issueService';
import { useFocusEffect } from 'expo-router';
import {
    Broom,
    CheckCircle,
    Clock,
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
    ActivityIndicator,
    Image as RNImage,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IssuesListScreen() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { apartmentId } = useOnboarding();
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

  const getStatusIcon = (status: Issue['status']) => {
    const iconProps = { size: 16, weight: 'fill' as const };
    switch (status) {
      case 'resolved':
        return <CheckCircle {...iconProps} color={colors.green} />;
      case 'in_progress':
        return <Clock {...iconProps} color={colors.brightOrange} />;
      default:
        return <XCircle {...iconProps} color={colors.redClose} />;
    }
  };

  const getStatusLabel = (status: Issue['status']) => {
    switch (status) {
      case 'resolved':
        return t('resolved') || 'Resolved';
      case 'in_progress':
        return t('inProgress') || 'In Progress';
      default:
        return t('pending') || 'Pending';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
            <View style={styles.emptyContainer}>
              <WarningCircle size={48} color={colors.subtitleText} weight="regular" />
              <Typo size={16} color={colors.subtitleText} style={styles.emptyText}>
                {t('noIssues') || 'No issues reported'}
              </Typo>
            </View>
          ) : (
            <View style={styles.issuesList}>
              {issues.map((issue) => (
                <View 
                  key={issue.id} 
                  style={[styles.issueCard, { backgroundColor: colors.neutral800 }]}
                >
                  <View style={styles.issueHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                      {getIssueTypeIcon(issue.type)}
                    </View>
                    <View style={styles.issueInfo}>
                      <Typo size={16} color={colors.titleText} fontWeight="600">
                        {getIssueTypeLabel(issue.type)}
                      </Typo>
                      <View style={styles.statusRow}>
                        {getStatusIcon(issue.status)}
                        <Typo size={12} color={colors.subtitleText} style={styles.statusText}>
                          {getStatusLabel(issue.status)}
                        </Typo>
                      </View>
                    </View>
                  </View>
                  
                  <Typo size={14} color={colors.text} style={styles.description}>
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
                  
                  <Typo size={12} color={colors.subtitleText} style={styles.dateText}>
                    {formatDate(issue.createdAt)}
                  </Typo>
                </View>
              ))}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacingY._40,
    gap: spacingY._12,
  },
  emptyText: {
    marginTop: spacingY._8,
  },
  issuesList: {
    gap: spacingY._16,
  },
  issueCard: {
    padding: spacingX._16,
    borderRadius: radius._12,
    gap: spacingY._12,
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius._10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  issueInfo: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._5,
    marginTop: spacingY._5,
  },
  statusText: {
    marginLeft: spacingX._5,
  },
  description: {
    marginTop: spacingY._5,
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
});

