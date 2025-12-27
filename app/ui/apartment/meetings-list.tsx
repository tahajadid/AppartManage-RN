import AppHeader from '@/components/AppHeader';
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal';
import EmptyState from '@/components/common/EmptyState';
import Shimmer from '@/components/common/Shimmer';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { deleteMeeting, getApartmentMeetings, Meeting, MeetingType } from '@/services/meetingService';
import { useFocusEffect } from 'expo-router';
import { Calendar, Clock, MapPin, Trash } from 'phosphor-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MeetingsListScreen() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { apartmentId, role } = useOnboarding();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
  
  const isSyndic = role === 'syndic' || role === 'syndic_resident';

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

  const getMeetingTypeInfo = (type: MeetingType | undefined) => {
    if (!type) return { labelKey: 'general', color: '#30b8e6' };
    
    const typeMap: Record<MeetingType, { labelKey: string; color: string }> = {
      general: { labelKey: 'meetingTypeGeneral', color: '#30b8e6' },
      budget: { labelKey: 'meetingTypeBudget', color: '#32CD32' },
      administrative: { labelKey: 'meetingTypeAdministrative', color: '#9370DB' },
      urgent: { labelKey: 'meetingTypeUrgent', color: '#FF6347' },
    };
    
    return typeMap[type] || typeMap.general;
  };

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

  const handleDelete = (meeting: Meeting) => {
    setMeetingToDelete(meeting);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!apartmentId || !meetingToDelete) return;

    setDeleting(true);
    setError(null);

    try {
      const result = await deleteMeeting(apartmentId, meetingToDelete.id);

      if (result.success) {
        // Remove the meeting from the local state
        setMeetings((prevMeetings) =>
          prevMeetings.filter((meeting) => meeting.id !== meetingToDelete.id)
        );
        setDeleteModalVisible(false);
        setMeetingToDelete(null);
      } else {
        setError(result.error || t('errorOccurred') || 'An error occurred, please try again');
      }
    } catch (err: any) {
      console.log('Error deleting meeting:', err);
      setError(t('errorOccurred') || 'An error occurred, please try again');
    } finally {
      setDeleting(false);
    }
  };

  // Render shimmer loading state
  const renderShimmerItems = () => {
    return Array.from({ length: 3 }).map((_, index) => (
      <View key={`shimmer-${index}`} style={[styles.meetingCard, { backgroundColor: colors.neutral800 }]}>
        <View style={[styles.typeIndicator, { backgroundColor: colors.neutral700 }]} />
        <View style={styles.meetingContent}>
          <View style={styles.meetingInfo}>
            <Shimmer width={40} height={40} borderRadius={radius._8} />
            <Shimmer width={150} height={14} borderRadius={radius._8} />
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
              {meetings.map((meeting) => {
                const typeInfo = getMeetingTypeInfo(meeting.type || 'general');
                return (
                  <View
                    key={meeting.id}
                    style={[styles.meetingCard, { backgroundColor: colors.neutral800 }]}
                  >
                    {/* Vertical line indicator */}
                    <View style={[styles.typeIndicator, { backgroundColor: typeInfo.color }]} />
                    <View style={styles.meetingContent}>
                      <View style={styles.meetingInfo}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                          <Calendar size={20} color={colors.primary} weight="regular" />
                        </View>
                        <View style={styles.reasonContainer}>
                          <View style={styles.reasonRow}>
                            <Typo size={16} color={colors.text} fontWeight="600" style={styles.reasonText}>
                              {meeting.reason}
                            </Typo>
                            {isSyndic && (
                              <TouchableOpacity
                                onPress={() => handleDelete(meeting)}
                                style={styles.deleteButton}
                                activeOpacity={0.7}
                              >
                                <Trash size={18} color={colors.redClose} weight="regular" />
                              </TouchableOpacity>
                            )}
                          </View>
                          <View style={[styles.typeBadge, { backgroundColor: typeInfo.color + '20' }]}>
                            <Typo size={12} color={typeInfo.color} fontWeight="600">
                              {t(typeInfo.labelKey) || typeInfo.labelKey}
                            </Typo>
                          </View>
                        </View>
                      </View>

                      <View style={styles.meetingDetails}>
                        <View style={styles.detailRow}>
                          <MapPin size={16} color={colors.neutral400} weight="regular" />
                          <Typo size={14} color={colors.neutral400} style={styles.detailText}>
                            {meeting.place}
                          </Typo>
                        </View>

                        <View style={styles.detailRow}>
                          <Calendar size={16} color={colors.neutral400} weight="regular" />
                          <Typo size={14} color={colors.neutral400} style={styles.detailText}>
                            {meeting.date}
                          </Typo>
                        </View>

                        <View style={styles.detailRow}>
                          <Clock size={16} color={colors.neutral400} weight="regular" />
                          <Typo size={14} color={colors.neutral400} style={styles.detailText}>
                            {meeting.time}
                          </Typo>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          visible={deleteModalVisible}
          loading={deleting}
          title={t('deleteMeeting') || 'Delete Meeting'}
          message={
            meetingToDelete
              ? t('deleteMeetingConfirmation', { reason: meetingToDelete.reason }) ||
                `Are you sure you want to delete the meeting "${meetingToDelete.reason}"?`
              : t('deleteMeetingConfirmationGeneric') || 'Are you sure you want to delete this meeting?'
          }
          onClose={() => {
            setDeleteModalVisible(false);
            setMeetingToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
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
    flexDirection: 'row',
  },
  typeIndicator: {
    width: 4,
  },
  meetingContent: {
    flex: 1,
    padding: spacingX._16,
  },
  meetingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._12,
    marginBottom: spacingY._12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius._8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reasonContainer: {
    flex: 1,
    gap: spacingY._8,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._8,
  },
  reasonText: {
    flex: 1,
  },
  deleteButton: {
    padding: spacingX._8,
    borderRadius: radius._8,
  },
  typeBadge: {
    paddingHorizontal: spacingX._8,
    paddingVertical: spacingY._4,
    borderRadius: radius._6,
    alignSelf: 'flex-start',
  },
  meetingDetails: {
    marginStart: spacingX._40 + spacingX._12, // Align with reason text (icon width 40 + gap 12 = 52)
    gap: spacingY._8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
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

