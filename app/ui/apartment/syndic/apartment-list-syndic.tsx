import ApartmentInfo from '@/components/apartment/ApartmentInfo';
import ResidentItem from '@/components/apartment/ResidentItem';
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

export default function ApartmentListSyndic() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { apartmentId } = useOnboarding();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  
  const [apartmentName, setApartmentName] = useState<string>('');
  const [residents, setResidents] = useState<Resident[]>([]);
  const [syndicName, setSyndicName] = useState<string>('');
  const [joinCode, setJoinCode] = useState<string>('');
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

  // Reload data when screen comes into focus (e.g., after editing apartment or residents)
  useFocusEffect(
    useCallback(() => {
      if (apartmentId) {
        loadApartmentData();
      }
    }, [apartmentId])
  );

  const loadApartmentData = async () => {
    if (!apartmentId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getApartmentData(apartmentId);
      
      if (result.success && result.apartment) {
        setApartmentName(result.apartment.name);
        setResidents(result.apartment.residents);
        setJoinCode(result.apartment.joinCode || '');
        
        // Find syndic resident
        const syndicResident = result.apartment.residents.find(r => r.isSyndic);
        setSyndicName(syndicResident?.name || '');
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

        <Typo size={28} color={colors.primary} style={styles.apartmentName} fontWeight="700">
            {apartmentName || t('tabApartment')}
        </Typo>
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacingY._20 },
            { direction: isRTL ? 'rtl' : 'ltr' },
          ]}
          showsVerticalScrollIndicator={false}
        >

        {/* Apartment Information Header */}
        <View style={styles.sectionHeader}>
            <Typo size={18} color={colors.titleText} fontWeight="600">
              {t('appartmentInformation')}
            </Typo>
          </View>
          {/* Apartment Information */}
          {apartmentId && syndicName && (
            <ApartmentInfo
              syndicName={syndicName}
              residentsCount={residents.length}
              apartmentId={apartmentId}
              joinCode={joinCode}
            />
          )}

          {/* Residents List Header */}
          <View style={styles.sectionHeader}>
            <Typo size={18} color={colors.titleText} fontWeight="600">
              {t('listOfResidents')}
            </Typo>
          </View>

          {/* Residents List */}
          <View style={styles.residentsList}>
            {residents.map((resident) => (
              <ResidentItem 
                key={resident.id} 
                resident={resident} 
                onPress={handleEditResident}
                editable={true}
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
    paddingTop: spacingY._24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacingX._20,
  },
  apartmentName: {
    marginStart: spacingX._20,
    textAlign: 'left',
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

