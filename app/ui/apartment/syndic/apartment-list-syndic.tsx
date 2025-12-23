import ApartmentInfo from '@/components/apartment/ApartmentInfo';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from '@/contexts/authContext';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { getApartmentData, Resident } from '@/services/apartmentService';
import { createMonthlyBills } from '@/services/paymentService';
import { scale } from '@/utils/styling';
import { router, useFocusEffect } from 'expo-router';
import { HouseLineIcon, Users, WarningCircle } from 'phosphor-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ApartmentListSyndic() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { apartmentId } = useOnboarding();
  const { user } = useAuth();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  
  const [apartmentName, setApartmentName] = useState<string>('');
  const [residents, setResidents] = useState<Resident[]>([]);
  const [syndicName, setSyndicName] = useState<string>('');
  const [joinCode, setJoinCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingPayments, setCreatingPayments] = useState<boolean>(false);
  const [syndicResidentId, setSyndicResidentId] = useState<string>('');

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
        setSyndicResidentId(syndicResident?.id || '');
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

  const handleCreatePayments = async () => {
    if (!apartmentId || !syndicResidentId || residents.length === 0) {
      Alert.alert(t('error') || 'Error', t('missingData') || 'Missing required data');
      return;
    }

    setCreatingPayments(true);
    setError(null);

    try {
      // Prepare residents data for bill creation
      const residentsData = residents.map((resident) => ({
        id: resident.id,
        monthlyFee: resident.monthlyFee,
      }));

      const result = await createMonthlyBills(
        apartmentId,
        residentsData,
        syndicResidentId
      );

      if (result.success) {
        Alert.alert(
          t('success') || 'Success',
          t('billsCreated', { count: result.billsCreated || 0 }) || 
          `${result.billsCreated || 0} bills created successfully`
        );
      } else {
        Alert.alert(
          t('error') || 'Error',
          result.error || 'Failed to create bills'
        );
      }
    } catch (err: any) {
      console.log('Error creating payments:', err);
      Alert.alert(
        t('error') || 'Error',
        t('errorOccurred') || 'An error occurred, please try again'
      );
    } finally {
      setCreatingPayments(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
        <Typo size={28} color={colors.text} style={styles.title} fontWeight="700">
            {t('tabApartment')}
            </Typo>
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
        <Typo size={28} color={colors.text} style={styles.title} fontWeight="700">
            {t('tabApartment')}
            </Typo>
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

        <Typo size={28} color={colors.text} style={styles.title} fontWeight="700">
            {t('tabApartment')}
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
        <View style={{flexDirection: 'row', alignItems: 'center', gap: spacingX._12}}>
          <HouseLineIcon size={24} color={colors.primary} style={{marginBottom: scale(13)}} weight="regular" />
          <Typo size={24} color={colors.primary} style={styles.apartmentName} fontWeight="700">
              {apartmentName || t('tabApartment')}
          </Typo>
        </View>

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

          {/* Create Payments Button - Temporary */}
          {apartmentId && syndicResidentId && residents.length > 0 && (
            <View style={styles.createPaymentsContainer}>
              <PrimaryButton
                onPress={handleCreatePayments}
                backgroundColor={colors.primary}
                loading={creatingPayments}
                style={styles.createPaymentsButton}
              >
                <Typo size={16} color={colors.white} fontWeight="600">
                  {t('createPayments') || 'Create Payments'}
                </Typo>
              </PrimaryButton>
            </View>
          )}

          {/* List of Residents Section */}
          <TouchableOpacity
            style={[styles.sectionCard, { backgroundColor: colors.primary + '20' }]}
            onPress={() => router.push('/ui/apartment/list-of-residents')}
            activeOpacity={0.7}
          >
            <View style={styles.sectionContent}>
              <View style={[styles.sectionIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Users size={24} color={colors.primary} weight="regular" />
              </View>
              <View style={styles.sectionTextContainer}>
                <Typo size={16} color={colors.titleText} fontWeight="600">
                  {t('listOfResidents')}
                </Typo>
                <Typo size={14} color={colors.subtitleText}>
                  {residents.length} {residents.length === 1 ? t('resident') : t('residents')}
                </Typo>
              </View>
            </View>
            <Typo size={18} color={colors.subtitleText}>›</Typo>
          </TouchableOpacity>

          {/* Apartment Issues Section */}
          <TouchableOpacity
            style={[styles.sectionCard, { backgroundColor: colors.rose + '20'  }]}
            onPress={() => router.push('/ui/apartment/issues-list')}
            activeOpacity={0.7}
          >
            <View style={styles.sectionContent}>
              <View style={[styles.sectionIconContainer, { backgroundColor: colors.rose + '20' }]}>
                <WarningCircle size={24} color={colors.rose} weight="regular" />
              </View>
              <View style={styles.sectionTextContainer}>
                <Typo size={16} color={colors.titleText} fontWeight="600">
                  {t('apartmentIssues')}
                </Typo>
                <Typo size={14} color={colors.subtitleText}>
                  {t('viewIssues') || 'View all reported issues'}
                </Typo>
              </View>
            </View>
            <Typo size={18} color={colors.subtitleText}>›</Typo>
          </TouchableOpacity>
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
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._20,
  },
  title: {
    marginStart: spacingX._20,
    textAlign: 'left',
    marginBottom: spacingY._16,
  },
  apartmentName: {
    textAlign: 'left',
    marginBottom: spacingY._16,
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
  createPaymentsContainer: {
    marginBottom: spacingY._20,
  },
  createPaymentsButton: {
    width: '100%',
  },
  residentsList: {
    gap: spacingY._12,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacingX._16,
    borderRadius: radius._12,
    marginBottom: spacingY._12,
  },
  sectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacingX._12,
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius._10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTextContainer: {
    flex: 1,
  },
});

