import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import { Meeting } from '@/services/meetingService';
import { router } from 'expo-router';
import { ArrowRight, Calendar, Clock, HourglassMedium, MapPin } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface UpcomingMeetingsProps {
  meetings: Meeting[];
}

export default function UpcomingMeetings({ meetings }: UpcomingMeetingsProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  if (meetings.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={[styles.meetingsCard, { backgroundColor: colors.brightOrange + '80' }]}>
        <View style={styles.meetingsCardHeader}>
          <View style={styles.meetingsHeaderLeft}>
            <Calendar size={24} color={colors.primary} weight="regular" />
            <Typo size={18} color={colors.titleText} fontWeight="600">
              {t('upcomingMeetings')}
            </Typo>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/ui/apartment/meetings-list')}
            style={styles.seeMoreButton}
          >
            <Typo size={14} color={colors.primary} fontWeight="500">
              {t('seeMore')}
            </Typo>
            <ArrowRight size={16} color={colors.primary} weight="regular" />
          </TouchableOpacity>
        </View>

        {/* separator */}
        <View style={{ height: spacingY._1, backgroundColor: colors.neutral700, marginBottom: spacingY._12 }} />

        {meetings.length > 0 && (
          <View style={[styles.meetingCard]}>
            <View style={styles.meetingHeader}>
              <View style={[styles.meetingIconContainer, { backgroundColor: colors.white }]}>
                <HourglassMedium size={20} color={colors.brightOrange} weight="regular" />
              </View>
              <View style={styles.meetingInfo}>
                <Typo size={16} color={colors.titleText} fontWeight="600">
                  {meetings[0].reason}
                </Typo>
                <View style={styles.meetingDetails}>
                  <View style={styles.meetingDetailRow}>
                    <MapPin size={14} color={colors.subtitleText} weight="regular" />
                    <Typo size={12} color={colors.subtitleText}>
                      {meetings[0].place}
                    </Typo>
                  </View>
                  <View style={styles.meetingDetailRow}>
                    <Clock size={14} color={colors.primary} weight="regular" />
                    <Typo size={12} color={colors.primary}>
                      {meetings[0].date} at {meetings[0].time}
                    </Typo>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacingY._24,
  },
  meetingsCard: {
    borderRadius: radius._16,
    padding: spacingX._20,
  },
  meetingsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingY._16,
  },
  meetingsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._12,
    flex: 1,
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._5,
  },
  meetingCard: {
    borderRadius: radius._12,
  },
  meetingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacingX._12,
  },
  meetingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: radius._20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meetingInfo: {
    flex: 1,
    gap: spacingY._8,
  },
  meetingDetails: {
    gap: spacingY._5,
  },
  meetingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._5,
  },
});

