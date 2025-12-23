import ResidentItem from '@/components/apartment/ResidentItem';
import AppHeader from '@/components/AppHeader';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { spacingX, spacingY } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { getApartmentData, Resident } from '@/services/apartmentService';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ListOfResidentsScreen() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { apartmentId, role } = useOnboarding();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is syndic (can edit residents)
  const isSyndic = role === 'syndic' || role === 'syndic_resident';

  useEffect(() => {
    if (apartmentId) {
      loadResidents();
    } else {
      setLoading(false);
      setError('No apartment found');
    }
  }, [apartmentId]);

  useFocusEffect(
    useCallback(() => {
      if (apartmentId) {
        loadResidents();
      }
    }, [apartmentId])
  );

  const loadResidents = async () => {
    if (!apartmentId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getApartmentData(apartmentId);
      
      if (result.success && result.apartment) {
        setResidents(result.apartment.residents);
      } else {
        setError(result.error || 'Failed to load residents');
      }
    } catch (err: any) {
      console.log('Error loading residents:', err);
      setError('An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleEditResident = (residentId: string) => {
    router.push({
      pathname: '/ui/apartment/syndic/modify-resident',
      params: { residentId },
    } as any);
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
          <AppHeader title={t('listOfResidents') || 'List of Residents'} />
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
          <AppHeader title={t('listOfResidents') || 'List of Residents'} />
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
        <AppHeader title={t('listOfResidents') || 'List of Residents'} />
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacingY._20 },
            { direction: isRTL ? 'rtl' : 'ltr' },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {residents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Typo size={16} color={colors.subtitleText}>
                {t('noResidents') || 'No residents found'}
              </Typo>
            </View>
          ) : (
            <View style={styles.residentsList}>
              {residents.map((resident) => (
                <ResidentItem 
                  key={resident.id} 
                  resident={resident} 
                  onPress={isSyndic ? handleEditResident : undefined}
                  editable={isSyndic}
                />
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
  },
  residentsList: {
    gap: spacingY._12,
  },
});

