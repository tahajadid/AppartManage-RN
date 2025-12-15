import ResidentItem from '@/components/apartment/ResidentItem';
import AppHeader from '@/components/AppHeader';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { spacingX, spacingY } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { getApartmentData, Resident } from '@/services/apartmentService';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ApartmentListResident() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { apartmentId } = useOnboarding();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  
  const [apartmentName, setApartmentName] = useState<string>('');
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (apartmentId) {
      loadApartmentData();
    } else {
      setLoading(false);
      setError('No apartment found');
    }
  }, [apartmentId]);

  const loadApartmentData = async () => {
    if (!apartmentId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getApartmentData(apartmentId);
      
      if (result.success && result.apartment) {
        setApartmentName(result.apartment.name);
        setResidents(result.apartment.residents);
      } else {
        setError(result.error || 'Failed to load apartment data');
      }
    } catch (err: any) {
      console.log('Error loading apartment:', err);
      setError('An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <ScreenWrapper>
        <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
          <AppHeader title={t('tabApartment')} />
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacingY._20 },
            { direction: isRTL ? 'rtl' : 'ltr' },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Residents List Header */}
          <View style={styles.sectionHeader}>
            <Typo size={20} color={colors.titleText} fontWeight="700">
              {t('residents')}
            </Typo>
            <Typo size={14} color={colors.subtitleText}>
              {residents.length} {residents.length === 1 ? t('resident') : t('residents')}
            </Typo>
          </View>

          {/* Residents List - Read Only */}
          <View style={styles.residentsList}>
            {residents.map((resident) => (
              <ResidentItem 
                key={resident.id} 
                resident={resident} 
                editable={false}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacingX._20,
  },
  sectionHeader: {
    marginBottom: spacingY._16,
  },
  residentsList: {
    gap: spacingY._12,
  },
});

