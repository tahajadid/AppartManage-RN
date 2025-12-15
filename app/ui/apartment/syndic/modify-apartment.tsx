import ResidentItem from '@/components/apartment/ResidentItem';
import AppHeader from '@/components/AppHeader';
import Input from '@/components/Input';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { firestore } from '@/config/firebase';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { getApartmentData, Resident } from '@/services/apartmentService';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ModifyApartmentScreen() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { apartmentId: paramApartmentId } = useLocalSearchParams<{ apartmentId: string }>();
  const { apartmentId: contextApartmentId } = useOnboarding();
  
  // Use param if available, otherwise fall back to context
  const apartmentId = paramApartmentId || contextApartmentId;

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [apartmentName, setApartmentName] = useState<string>('');
  const [numberOfResidents, setNumberOfResidents] = useState<string>('');
  const [residents, setResidents] = useState<Resident[]>([]);

  // Track initial values to know when user has modified something
  const [initialValues, setInitialValues] = useState({
    apartmentName: '',
    numberOfResidents: '',
  });

  useEffect(() => {
    if (apartmentId) {
      loadApartmentData();
    } else {
      setError('Apartment ID is required');
      setLoading(false);
    }
  }, [apartmentId]);

  const loadApartmentData = async () => {
    if (!apartmentId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getApartmentData(apartmentId);
      
      if (result.success && result.apartment) {
        const loadedName = result.apartment.name || '';
        const loadedNumberOfResidents = result.apartment.numberOfResidents?.toString() || '0';

        setApartmentName(loadedName);
        setNumberOfResidents(loadedNumberOfResidents);
        setResidents(result.apartment.residents);

        setInitialValues({
          apartmentName: loadedName,
          numberOfResidents: loadedNumberOfResidents,
        });
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

  const handleSave = async () => {
    if (!apartmentId) return;

    // Validation
    if (!apartmentName.trim()) {
      setError('Apartment name is required');
      return;
    }

    const numberOfResidentsNum = parseInt(numberOfResidents);
    if (isNaN(numberOfResidentsNum) || numberOfResidentsNum < 1) {
      setError('Please enter a valid number of residents (at least 1)');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const apartmentDocRef = doc(firestore, 'apartments', apartmentId);
      await updateDoc(apartmentDocRef, {
        name: apartmentName.trim(),
        numberOfResidents: numberOfResidentsNum,
        updatedAt: new Date().toISOString(),
      });

      // Navigate back
      router.back();
    } catch (err: any) {
      console.log('Error updating apartment:', err);
      setError('An error occurred, please try again');
    } finally {
      setSaving(false);
    }
  };

  const handleEditResident = (residentId: string) => {
    router.push({
      pathname: '/ui/apartment/syndic/modify-resident',
      params: { residentId },
    } as any);
  };

  const isDirty =
    apartmentName !== initialValues.apartmentName ||
    numberOfResidents !== initialValues.numberOfResidents;

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
          <AppHeader title={t('editApartment')} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
      <AppHeader title={t('editApartment')} />

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { direction: isRTL ? 'rtl' : 'ltr' },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: colors.redClose + '20' }]}>
                <Typo size={14} color={colors.redClose}>
                  {error}
                </Typo>
              </View>
            )}

            <View style={styles.form}>
              {/* Apartment Name */}
              <View style={styles.inputGroup}>
                <Typo size={16} color={colors.titleText} fontWeight="600" style={styles.label}>
                  {t('apartmentName')}
                </Typo>
                <Input
                  placeholder={t('apartmentNamePlaceholder')}
                  value={apartmentName}
                  onChangeText={setApartmentName}
                  containerStyle={styles.input}
                />
              </View>

              {/* Number of Residents */}
              <View style={styles.inputGroup}>
                <Typo size={16} color={colors.titleText} fontWeight="600" style={styles.label}>
                  {t('numberOfResidents')}
                </Typo>
                <Input
                  placeholder={t('numberOfResidentsPlaceholder')}
                  value={numberOfResidents}
                  onChangeText={setNumberOfResidents}
                  keyboardType="numeric"
                  containerStyle={styles.input}
                />
              </View>
            </View>

            {/* Residents List Header */}
            <View style={styles.sectionHeader}>
              <Typo size={16} color={colors.titleText} fontWeight="600">
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
        </KeyboardAvoidingView>

        <View
          style={[
            styles.buttonContainer,
            { paddingBottom: insets.bottom + spacingY._16 },
          ]}
        >
          <PrimaryButton
            onPress={handleSave}
            loading={saving}
            disabled={!isDirty || saving}
            backgroundColor={colors.primary}
          >
            <Typo size={16} color={colors.white} fontWeight="600">
              {t('saveChanges')}
            </Typo>
          </PrimaryButton>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacingY._24,
  },
  keyboardView: {
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
    padding: spacingX._12,
    borderRadius: radius._8,
    marginBottom: spacingY._16,
  },
  form: {
    gap: spacingY._20,
    marginBottom: spacingY._24,
  },
  inputGroup: {
    gap: spacingY._8,
  },
  label: {
    marginBottom: spacingY._5,
  },
  input: {
    marginBottom: 0,
  },
  sectionHeader: {
    marginBottom: spacingY._16,
  },
  residentsList: {
    gap: spacingY._12,
  },
  buttonContainer: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._16,
    backgroundColor: 'transparent',
  },
});
