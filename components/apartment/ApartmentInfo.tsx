import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { Copy, IdentificationBadge, Pencil, User, Users } from 'phosphor-react-native';
import React, { useState } from 'react';
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
  joinCode: string;
  showEditButton?: boolean;
}

export default function ApartmentInfo({ syndicName, residentsCount, apartmentId, joinCode, showEditButton = true }: ApartmentInfoProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleEdit = () => {
    router.push({
      pathname: '/ui/apartment/syndic/modify-apartment',
      params: { apartmentId },
    } as any);
  };

  const handleCopyCode = async () => {
    if (!joinCode) return;
    
    try {
      await Clipboard.setStringAsync(joinCode);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.log('Error copying to clipboard:', error);
    }
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

        {joinCode && (
          <View style={styles.infoRow}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <IdentificationBadge size={24} color={colors.primary} weight="bold" />
            </View>
            <View style={styles.infoText}>
              <Typo size={14} color={colors.subtitleText} fontWeight="400" style={{paddingTop: spacingY._8}}>
                {t('joinCode') || 'Join Code'}
              </Typo>
              <View style={styles.codeRow}>
                <Typo size={16} color={colors.primary} fontWeight="600" style={styles.codeText}>
                  {joinCode}
                </Typo>
                <TouchableOpacity
                  onPress={handleCopyCode}
                  style={[styles.copyButton, 
                  { backgroundColor: colors.neutral300 + '88', flexDirection: 'row', alignItems: 'center', gap: spacingX._5 }]}>
                    <Typo size={14} color={colors.white} fontWeight="600" >
                    {t('copy')}
                    </Typo>
                  <Copy
                    size={14}
                    style={{marginLeft: spacingX._3}}
                    color={copied ? colors.white : colors.white}
                    weight={copied ? 'fill' : 'regular'}
                  />
                </TouchableOpacity>
              </View>
              {copied && (
                <Typo size={12} color={colors.primary} fontWeight="400" style={styles.copiedText}>
                  {t('copied') || 'Copied!'}
                </Typo>
              )}
            </View>
          </View>
        )}
      </View>

      {showEditButton && (
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          onPress={handleEdit}
        >
          <Pencil size={20} color={colors.white} weight="bold" />
        </TouchableOpacity>
      )}
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
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._8,
    marginTop: spacingY._5,
  },
  codeText: {
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginTop: -spacingY._5,
  },
  copyButton: {
    padding: spacingX._8,
    borderRadius: radius._6,
  },
  copiedText: {
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

