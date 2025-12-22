import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import { Resident } from '@/services/apartmentService';
import { Detective, Pencil, Trash, User } from 'phosphor-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

interface ResidentItemProps {
  resident: Resident;
  onPress?: (residentId: string) => void;
  onDelete?: (residentId: string) => void;
  editable?: boolean;
  showDelete?: boolean;
}

export default function ResidentItem({ 
  resident, 
  onPress, 
  onDelete,
  editable = false,
  showDelete = false 
}: ResidentItemProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  
  const isSyndicResident = resident.isSyndic;
  const isClickable = editable; // Syndic can edit all residents including themselves
  const canDelete = showDelete && !isSyndicResident; // Cannot delete syndic

  const handlePress = () => {
    if (isClickable && onPress) {
      onPress(resident.id);
    }
  };

  const handleDelete = () => {
    if (canDelete && onDelete) {
      onDelete(resident.id);
    }
  };

  const Container = editable ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.residentItem,
        { backgroundColor: colors.neutral800 }
      ]}
      onPress={handlePress}
      disabled={!isClickable}
    >
      <View style={styles.residentItemLeft}>
        <View style={[
          styles.residentAvatar,
          { backgroundColor: isSyndicResident ? colors.goldColorBackground + '82' : colors.primary + '20' }
        ]}>
          {resident.isLinkedWithUser ? (
            <User
              size={24}
              color={colors.primary} 
              weight="bold" 
            />
          ) : (
            <Detective
              size={24}
              color={colors.neutral300} 
              weight="bold" 
            />
          )}
        </View>
        <View style={styles.residentInfo}>
          <View style={styles.residentNameRow}>
            <Typo size={16} color={colors.text} fontWeight="600">
              {resident.name}
            </Typo>
            {isSyndicResident && (
              <View style={[styles.syndicBadge, { backgroundColor: colors.goldColorBackground }]}>
                <Typo size={12} color={colors.primary} fontWeight="700">
                  {t('syndic')}
                </Typo>
              </View>
            )}
          </View>
          <Typo size={14} color={colors.text} style={styles.residentDetails}>
            {t('monthlyFee')}: {resident.monthlyFee} MAD
          </Typo>
          {resident.remainingAmount > 0 && (
            <Typo size={14} color={colors.brightOrange} style={styles.residentDetails}>
              {t('remainingAmount')}: {resident.remainingAmount} MAD
            </Typo>
          )}
        </View>
      </View>
      <View style={styles.actionsContainer}>
        {editable && (
          <Pencil 
            size={20} 
            color={isSyndicResident ? colors.goldColorBorder : colors.primary} 
            weight="bold" 
          />
        )}
        {canDelete && (
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteButton}
          >
            <Trash 
              size={20} 
              color={colors.redClose} 
              weight="bold" 
            />
          </TouchableOpacity>
        )}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  residentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacingX._16,
    borderRadius: radius._12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  residentItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  residentAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius._8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacingX._12,
  },
  residentInfo: {
    flex: 1,
  },
  residentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._8,
    marginBottom: spacingY._5,
  },
  syndicBadge: {
    paddingHorizontal: spacingX._8,
    paddingVertical: spacingY._5,
    borderRadius: radius._4,
  },
  residentDetails: {
    marginTop: spacingY._5,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._12,
  },
  deleteButton: {
    padding: spacingX._5,
  },
});

