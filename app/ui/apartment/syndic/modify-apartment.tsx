import ResidentItem from '@/components/apartment/ResidentItem';
import AppHeader from '@/components/AppHeader';
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal';
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
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { arrayRemove, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Plus } from 'phosphor-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
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
  const [residents, setResidents] = useState<Resident[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [residentToDelete, setResidentToDelete] = useState<{ id: string; name: string } | null>(null);

  // Track initial values to know when user has modified something
  const [initialValues, setInitialValues] = useState({
    apartmentName: '',
  });

  useEffect(() => {
    if (apartmentId) {
      loadApartmentData();
    } else {
      setError('Apartment ID is required');
      setLoading(false);
    }
  }, [apartmentId]);

  // Reload data when screen comes into focus (e.g., after adding a resident)
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
        const loadedName = result.apartment.name || '';

        setApartmentName(loadedName);
        setResidents(result.apartment.residents);

        setInitialValues({
          apartmentName: loadedName,
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

    // Auto-calculate number of residents from residents array
    const numberOfResidentsNum = residents.length;

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

  const handleDeleteResident = (residentId: string) => {
    const resident = residents.find(r => r.id === residentId);
    if (!resident) return;

    setResidentToDelete({ id: residentId, name: resident.name });
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!residentToDelete) return;
    
    await deleteResident(residentToDelete.id);
    setDeleteModalVisible(false);
    setResidentToDelete(null);
  };

  const deleteResident = async (residentId: string) => {
    if (!apartmentId) return;

    setDeleting(residentId);
    setError(null);

    try {
      // Delete resident document
      const residentDocRef = doc(firestore, 'residents', residentId);
      await deleteDoc(residentDocRef);

      // Remove resident from apartment's residents array and update numberOfResidents
      const apartmentDocRef = doc(firestore, 'apartments', apartmentId);
      const newNumberOfResidents = residents.length - 1;
      await updateDoc(apartmentDocRef, {
        residents: arrayRemove(residentId),
        numberOfResidents: newNumberOfResidents,
        updatedAt: new Date().toISOString(),
      });

      // Reload data from Firestore to ensure consistency
      await loadApartmentData();
    } catch (err: any) {
      console.log('Error deleting resident:', err);
      setError('An error occurred while deleting resident');
    } finally {
      setDeleting(null);
    }
  };

  const handleAddResident = () => {
    // Navigate to add resident screen or show form
    // For now, we'll create a simple inline form or navigate
    router.push({
      pathname: '/ui/apartment/syndic/add-resident',
      params: { apartmentId },
    } as any);
  };

  const isDirty = apartmentName !== initialValues.apartmentName;

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

              {/* Number of Residents - Auto-calculated */}
              <View style={styles.inputGroup}>
                <Typo size={16} color={colors.titleText} fontWeight="600" style={styles.label}>
                  {t('numberOfResidents')}
                </Typo>
                <View style={[styles.readOnlyField, 
                    { backgroundColor: colors.neutral800, opacity: 0.5 }]}>
                  <Typo size={16} color={colors.subtitleText}>
                    {residents.length} {residents.length === 1 ? t('resident') : t('residents')}
                  </Typo>
                </View>
              </View>
            </View>

            {/* Residents List Header */}
            <View style={styles.sectionHeader}>
              <Typo size={16} color={colors.titleText} fontWeight="600">
                {t('listOfResidents')}
              </Typo>
            </View>

            {/* Add New Resident Button */}
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.neutral800 }]}
              onPress={handleAddResident}
            >
              <Plus size={20} color={colors.primary} weight="bold" />
              <Typo size={16} color={colors.primary} fontWeight="600" style={styles.addButtonText}>
                {t('addNewResident')}
              </Typo>
            </TouchableOpacity>

            {/* Residents List */}
            <View style={styles.residentsList}>
              {residents.map((resident) => (
                <ResidentItem 
                  key={resident.id} 
                  resident={resident}
                  editable={false}
                  showDelete={true}
                  onDelete={handleDeleteResident}
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

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          visible={deleteModalVisible}
          loading={deleting === residentToDelete?.id}
          title={t('deleteResident') || 'Delete Resident'}
          message={
            residentToDelete
              ? t('deleteResidentConfirm', { name: residentToDelete.name }) ||
                `Are you sure you want to delete ${residentToDelete.name}?`
              : ''
          }
          onClose={() => {
            setDeleteModalVisible(false);
            setResidentToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
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
  readOnlyField: {
    padding: spacingX._16,
    borderRadius: radius._8,
    minHeight: 50,
    justifyContent: 'center',
  },
  sectionHeader: {
    marginBottom: spacingY._16,
  },
  addButton: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingVertical: spacingY._10,
    paddingHorizontal: spacingX._16,
    borderRadius: radius._30,
    marginBottom: spacingY._12,
    gap: spacingX._10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  addButtonText: {
    marginLeft: spacingX._5,
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
