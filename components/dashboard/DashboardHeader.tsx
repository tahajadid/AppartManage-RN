import Shimmer from '@/components/common/Shimmer';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import { Bell } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import BalanceHeader from './BalanceHeader';

interface DashboardHeaderProps {
  apartmentName: string;
  currentBalance: number;
  remainingToCollect: number;
  loading: boolean;
  headerHeight: number;
  insetsTop: number;
}

export default function DashboardHeader({
  apartmentName,
  currentBalance,
  remainingToCollect,
  loading,
  headerHeight,
  insetsTop,
}: DashboardHeaderProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <View style={[styles.headerOverlay, { paddingTop: insetsTop + spacingY._20 }]}>
      {/* Top Row: Apartment Name and Notification */}
      <View style={styles.headerTopRow}>
        {loading ? (
          <Shimmer width={180} height={32} style={{ marginStart: -spacingX._25 }} borderRadius={radius._8} />
        ) : (
          <Typo
            size={22}
            color={colors.primary}
            style={{
              backgroundColor: colors.neutral750,
              paddingHorizontal: spacingX._20,
              paddingVertical: spacingY._5,
              borderRadius: radius._8,
              marginStart: -spacingX._25,
            }}
            fontWeight="600"
          >
            {apartmentName || t('apartmentName')}
          </Typo>
        )}
        <TouchableOpacity style={styles.notificationButton}>
          <Bell size={28} color={colors.white} weight="regular" />
        </TouchableOpacity>
      </View>

      {/* Center Content: Balance */}
      <BalanceHeader
        currentBalance={currentBalance}
        remainingToCollect={remainingToCollect}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: spacingX._20,
    justifyContent: 'space-between',
    paddingBottom: spacingY._20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    padding: spacingX._8,
  },
});

