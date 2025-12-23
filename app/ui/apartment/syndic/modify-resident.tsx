import AppHeader from '@/components/AppHeader';
import Input from '@/components/Input';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { firestore } from '@/config/firebase';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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

export default function ModifyResidentScreen() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { residentId } = useLocalSearchParams<{ residentId: string }>();

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState<string>('');
  const [monthlyFee, setMonthlyFee] = useState<string>('');
  const [remainingAmount, setRemainingAmount] = useState<string>('');

  // Track initial values to know when user has modified something
  const [initialValues, setInitialValues] = useState({
    name: '',
    monthlyFee: '',
    remainingAmount: '',
  });

  useEffect(() => {
    if (residentId) {
      loadResidentData();
    } else {
      setError('Resident ID is required');
      setLoading(false);
    }
  }, [residentId]);

  const loadResidentData = async () => {
    if (!residentId) return;

    setLoading(true);
    setError(null);

    try {
      const residentDocRef = doc(firestore, 'residents', residentId);
      const residentDoc = await getDoc(residentDocRef);

      if (!residentDoc.exists()) {
        setError('Resident not found');
        setLoading(false);
        return;
      }

      const residentData = residentDoc.data();
      const loadedName = residentData.name || '';
      const loadedMonthlyFee = residentData.monthlyFee?.toString() || '';
      const loadedRemainingAmount = residentData.remainingAmount?.toString() || '0';

      setName(loadedName);
      setMonthlyFee(loadedMonthlyFee);
      setRemainingAmount(loadedRemainingAmount);

      setInitialValues({
        name: loadedName,
        monthlyFee: loadedMonthlyFee,
        remainingAmount: loadedRemainingAmount,
      });
    } catch (err: any) {
      console.log('Error loading resident:', err);
      setError('An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!residentId) return;

    // Validation
    if (!name.trim()) {
      setError('Resident name is required');
      return;
    }

    const monthlyFeeNum = parseFloat(monthlyFee);
    if (isNaN(monthlyFeeNum) || monthlyFeeNum < 0) {
      setError('Please enter a valid monthly fee');
      return;
    }

    const remainingAmountNum = parseFloat(remainingAmount) || 0;

    setSaving(true);
    setError(null);

    try {
      const residentDocRef = doc(firestore, 'residents', residentId);
      await updateDoc(residentDocRef, {
        name: name.trim(),
        monthlyFee: monthlyFeeNum,
        remainingAmount: remainingAmountNum,
        updatedAt: new Date().toISOString(),
      });

      // Navigate back
      router.back();
    } catch (err: any) {
      console.log('Error updating resident:', err);
      setError('An error occurred, please try again');
    } finally {
      setSaving(false);
    }
  };

  const isDirty =
    name !== initialValues.name ||
    monthlyFee !== initialValues.monthlyFee ||
    remainingAmount !== initialValues.remainingAmount;

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
          <AppHeader title={t('editResident')} />
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
        <AppHeader title={t('editResident')} />

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
                  {t('remainingAmount')} {t('optional')}
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

