import AppHeader from '@/components/AppHeader';
import EmptyState from '@/components/common/EmptyState';
import Shimmer from '@/components/common/Shimmer';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { getApartmentMeetings, Meeting } from '@/services/meetingService';
import { useFocusEffect } from 'expo-router';
import { Calendar, Clock, MapPin } from 'phosphor-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MeetingsListScreen() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { apartmentId } = useOnboarding();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (apartmentId) {
      loadMeetings();
    } else {
      setLoading(false);
      setError('No apartment found');
    }
  }, [apartmentId]);

  useFocusEffect(
    useCallback(() => {
      if (apartmentId) {
        loadMeetings();
      }
    }, [apartmentId])
  );

  const loadMeetings = async () => {
    if (!apartmentId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getApartmentMeetings(apartmentId);
      
      if (result.success && result.meetings) {
        // Sort by date and time (newest first)
        const sortedMeetings = [...result.meetings].sort((a, b) => {
          // Parse date "DD/MM/YYYY" and time "HH:mm"
          const parseDate = (dateStr: string, timeStr: string) => {
            const [day, month, year] = dateStr.split('/').map(Number);
            const [hours, minutes] = timeStr.split(':').map(Number);
            return new Date(year, month - 1, day, hours, minutes);
          };
          
          const dateA = parseDate(a.date, a.time);
          const dateB = parseDate(b.date, b.time);
          return dateB.getTime() - dateA.getTime(); // Newest first
        });
        setMeetings(sortedMeetings);
      } else {
        setError(result.error || 'Failed to load meetings');
      }
    } catch (err: any) {
      console.log('Error loading meetings:', err);
      setError('An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  // Render shimmer loading state
  const renderShimmerItems = () => {
    return Array.from({ length: 3 }).map((_, index) => (
      <View key={`shimmer-${index}`} style={[styles.meetingCard, { backgroundColor: colors.neutral800 }]}>
        <View style={styles.meetingContent}>
          <View style={styles.meetingHeader}>
            <View style={styles.meetingInfo}>
              <Shimmer width={40} height={40} borderRadius={radius._8} />
              <Shimmer width={150} height={14} borderRadius={radius._8} />
            </View>
          </View>
          <View style={styles.meetingDetails}>
            <View style={styles.detailRow}>
              <Shimmer width={16} height={16} borderRadius={radius._4} />
              <Shimmer width={200} height={14} borderRadius={radius._8} />
            </View>
            <View style={styles.detailRow}>
              <Shimmer width={16} height={16} borderRadius={radius._4} />
              <Shimmer width={150} height={14} borderRadius={radius._8} />
            </View>
            <View style={styles.detailRow}>
              <Shimmer width={16} height={16} borderRadius={radius._4} />
              <Shimmer width={100} height={14} borderRadius={radius._8} />
            </View>
          </View>
        </View>
      </View>
    ));
  };

  if (error && !meetings.length && !loading) {
    return (
      <ScreenWrapper>
        <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
          <AppHeader title={t('meetings') || 'Meetings'} />
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
        <AppHeader title={t('meetings') || 'Meetings'} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacingY._20 },
            { direction: isRTL ? 'rtl' : 'ltr' },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.redClose + '20' }]}>
              <Typo size={14} color={colors.redClose}>
                {error}
              </Typo>
            </View>
          )}

          {loading && meetings.length === 0 ? (
            <View style={styles.meetingsList}>
              {renderShimmerItems()}
            </View>
          ) : meetings.length === 0 ? (
            <EmptyState message={t('noMeetings') || 'No meetings scheduled'} />
          ) : (
            <View style={styles.meetingsList}>
              {meetings.map((meeting) => (
                <View
                  key={meeting.id}
                  style={[styles.meetingCard, { backgroundColor: colors.neutral800 }]}
                >
                  <View style={styles.meetingContent}>
                    <View style={styles.meetingHeader}>
                      <View style={styles.meetingInfo}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                          <Calendar size={20} color={colors.primary} weight="regular" />
                        </View>
                        <Typo size={14} color={colors.text} style={styles.detailText}>
                          {meeting.reason}
                        </Typo>
                      </View>
                    </View>


                    {/* Separator */}
                    <View style={[styles.separator, { backgroundColor: colors.primary + '20' }]} />

                    <View style={styles.meetingDetails}>
                      <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                          <MapPin size={16} color={colors.primary} weight="bold" />
                        </View>
                        <Typo size={14} color={colors.text} style={styles.detailText}>
                          <Typo size={14} color={colors.primary} style={{fontWeight:'700'}}>
                            {t('meetingPlace')} :
                          </Typo> {meeting.place}
                        </Typo>
                      </View>

                      <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                          <Calendar size={16} color={colors.primary} weight="bold" />
                        </View>
                        <Typo size={14} color={colors.text} style={styles.detailText}>
                          <Typo size={14} color={colors.primary} style={{fontWeight:'700'}}>
                            {t('meetingDate')} :
                          </Typo> {meeting.date}
                        </Typo>
                      </View>

                      <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                          <Clock size={16} color={colors.primary} weight="bold" />
                        </View>
                        <Typo size={14} color={colors.text} style={styles.detailText}>
                          <Typo size={14} color={colors.primary} style={{fontWeight:'700'}}>
                            {t('meetingTime')} :
                          </Typo> {meeting.time}
                        </Typo>
                      </View>
                    </View>
                  </View>
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
    paddingTop: spacingY._24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacingX._20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: spacingX._12,
    borderRadius: radius._8,
    marginBottom: spacingY._16,
  },
  meetingsList: {
    gap: spacingY._12,
  },
  meetingCard: {
    borderRadius: radius._12,
    marginBottom: spacingY._12,
    overflow: 'hidden',
  },
  meetingContent: {
    padding: spacingX._16,
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacingY._12,
  },
  meetingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius._8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meetingDetails: {
    gap: spacingY._8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacingX._8,
  },
  detailIconContainer: {
    marginTop: spacingY._2,
  },
  detailText: {
    flex: 1,
  },
  separator: {
    height: spacingY._1,
    marginBottom: spacingY._16,
  }
});

