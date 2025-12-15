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
import { router, useLocalSearchParams } from 'expo-router';
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddResidentScreen() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { apartmentId: paramApartmentId } = useLocalSearchParams<{ apartmentId: string }>();
  const { apartmentId: contextApartmentId } = useOnboarding();
  
  // Use param if available, otherwise fall back to context
  const apartmentId = paramApartmentId || contextApartmentId;

  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState<string>('');
  const [monthlyFee, setMonthlyFee] = useState<string>('');
  const [remainingAmount, setRemainingAmount] = useState<string>('0');

  const handleSave = async () => {
    if (!apartmentId) {
      setError('Apartment ID is required');
      return;
    }

    // Validation
    if (!name.trim()) {
      setError(t('residentNameRequired'));
      return;
    }

    const monthlyFeeNum = parseFloat(monthlyFee);
    if (!monthlyFee.trim() || isNaN(monthlyFeeNum) || monthlyFeeNum < 0) {
      setError(t('validMonthlyFeeRequired'));
      return;
    }

    const remainingAmountNum = parseFloat(remainingAmount) || 0;

    setSaving(true);
    setError(null);

    try {
      // Get apartment document to update residents array
      const apartmentDocRef = doc(firestore, 'apartments', apartmentId);
      const apartmentDoc = await getDoc(apartmentDocRef);

      if (!apartmentDoc.exists()) {
        setError('Apartment not found');
        setSaving(false);
        return;
      }

      const apartmentData = apartmentDoc.data();
      const currentResidents = apartmentData.residents || [];
      const currentNumberOfResidents = apartmentData.numberOfResidents || 0;

      // Create new resident document
      const residentId = `resident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const residentDocRef = doc(firestore, 'residents', residentId);
      await setDoc(residentDocRef, {
        id: residentId,
        apartmentId: apartmentId,
        name: name.trim(),
        monthlyFee: monthlyFeeNum,
        remainingAmount: remainingAmountNum,
        isSyndic: false,
        isLinkedWithUser: false,
        linkedUserId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Update apartment document: add resident ID to residents array and increment numberOfResidents
      await updateDoc(apartmentDocRef, {
        residents: arrayUnion(residentId),
        numberOfResidents: currentNumberOfResidents + 1,
        updatedAt: new Date().toISOString(),
      });

      // Navigate back
      router.back();
    } catch (err: any) {
      console.log('Error adding resident:', err);
      setError('An error occurred, please try again');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
        <AppHeader title={t('addNewResident')} />

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
              <View style={styles.inputGroup}>
                <Typo size={16} color={colors.titleText} fontWeight="600" style={styles.label}>
                  {t('residentName')}
                </Typo>
                <Input
                  placeholder={t('residentNamePlaceholder')}
                  value={name}
                  onChangeText={setName}
                  containerStyle={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Typo size={16} color={colors.titleText} fontWeight="600" style={styles.label}>
                  {t('monthlyFee')}
                </Typo>
                <Input
                  placeholder={t('monthlyFeePlaceholder')}
                  value={monthlyFee}
                  onChangeText={setMonthlyFee}
                  keyboardType="numeric"
                  containerStyle={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Typo size={16} color={colors.titleText} fontWeight="600" style={styles.label}>
                  {t('remainingAmount')} {t('optional') }
                </Typo>
                <Input
                  placeholder={t('remainingAmountPlaceholder')}
                  value={remainingAmount}
                  onChangeText={setRemainingAmount}
                  keyboardType="numeric"
                  containerStyle={styles.input}
                />
              </View>
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
            disabled={saving || !name.trim() || !monthlyFee.trim()}
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
  errorContainer: {
    padding: spacingX._12,
    borderRadius: radius._8,
    marginBottom: spacingY._16,
  },
  form: {
    gap: spacingY._20,
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
  buttonContainer: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._16,
    backgroundColor: 'transparent',
  },
});

