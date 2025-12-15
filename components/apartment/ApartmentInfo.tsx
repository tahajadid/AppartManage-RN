import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import { router } from 'expo-router';
import { Pencil, User, Users } from 'phosphor-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Platform,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

interface ApartmentInfoProps {
  syndicName: string;
  residentsCount: number;
  apartmentId: string;
}

export default function ApartmentInfo({ syndicName, residentsCount, apartmentId }: ApartmentInfoProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();

  const handleEdit = () => {
    router.push({
      pathname: '/ui/apartment/syndic/modify-apartment',
      params: { apartmentId },
    } as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral800 }]}>
      <View style={styles.content}>
        <View style={styles.infoRow}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <User size={24} color={colors.primary} weight="bold" />
          </View>
          <View style={styles.infoText}>
            <Typo size={14} color={colors.subtitleText} fontWeight="400">
              {t('syndic')}
            </Typo>
            <Typo size={16} color={colors.titleText} fontWeight="600" style={styles.value}>
              {syndicName}
            </Typo>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Users size={24} color={colors.primary} weight="bold" />
          </View>
          <View style={styles.infoText}>
            <Typo size={14} color={colors.subtitleText} fontWeight="400">
              {t('residents')}
            </Typo>
            <Typo size={16} color={colors.titleText} fontWeight="600" style={styles.value}>
              {residentsCount} {residentsCount === 1 ? t('resident') : t('residents')}
            </Typo>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.editButton, { backgroundColor: colors.primary }]}
        onPress={handleEdit}
      >
        <Pencil size={20} color={colors.white} weight="bold" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacingX._16,
    borderRadius: radius._12,
    marginBottom: spacingY._20,
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
  content: {
    flex: 1,
    gap: spacingY._12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius._8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
  },
  value: {
    marginTop: spacingY._5,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: radius._8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacingX._12,
  },
});

