import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { router } from 'expo-router';
import { CreditCard, Receipt } from 'phosphor-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

export default function PaymentsSyndic() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { t } = useTranslation();

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
        <Typo size={28} color={colors.text} style={styles.title} fontWeight="700">
          {t('tabPayments')}
        </Typo>

        {/* Navigation Items */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            onPress={() => router.push('/ui/payments/syndic/bills/payments-bills' as any)}
            style={[styles.navItem, { backgroundColor: colors.goldLightBackground}]}
            activeOpacity={0.7}
          >
            <View style={[styles.navIconContainer, { backgroundColor: colors.neutral800 + '50' }]}>
              <CreditCard size={24} color={colors.brightOrange} weight="bold" />
            </View>
            <View style={styles.navContent}>
              <Typo size={18} color={colors.titleText} fontWeight="600">
                {t('residentsBills') || 'Residents Bills'}
              </Typo>
              <Typo size={14} color={colors.subtitleText} style={styles.navSubtitle}>
                {t('viewBills') || 'View and manage resident bills'}
              </Typo>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/ui/payments/syndic/expenses/payments-expenses-list' as any)}
            style={[styles.navItem, { backgroundColor: colors.neutral600 }]}
            activeOpacity={0.7}
          >
            <View style={[styles.navIconContainer, { backgroundColor: colors.neutral800 + '50' }]}>
              <Receipt size={24} color={colors.brightOrange} weight="bold" />
            </View>
            <View style={styles.navContent}>
              <Typo size={18} color={colors.titleText} fontWeight="600">
                {t('expenses') || 'Expenses'}
              </Typo>
              <Typo size={14} color={colors.subtitleText} style={styles.navSubtitle}>
                {t('viewExpenses') || 'View apartment expenses'}
              </Typo>
            </View>
          </TouchableOpacity>
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
  title: {
    marginStart: spacingX._20,
    textAlign: 'left',
    marginBottom: spacingY._16,
  },
  navigationContainer: {
    paddingHorizontal: spacingX._20,
    marginBottom: spacingY._20,
    gap: spacingY._12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacingX._16,
    borderRadius: radius._12,
    gap: spacingX._16,
  },
  navIconContainer: {
    width: 56,
    height: 56,
    borderRadius: radius._12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navContent: {
    flex: 1,
    gap: spacingY._5,
  },
  navSubtitle: {
    marginTop: spacingY._5,
  },
});
