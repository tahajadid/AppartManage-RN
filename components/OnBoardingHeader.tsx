import Typo from '@/components/Typo';
import { spacingX, spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import { router } from 'expo-router';
import { ArrowLeft } from 'phosphor-react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface OnBoardingHeaderProps {
  title: string;
  onBack?: () => void;
}

const OnBoardingHeader: React.FC<OnBoardingHeaderProps> = ({ title, onBack }) => {
  const colors = useThemeColors();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.backButtonContainer}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} weight="bold" />
        </Pressable>
      </View>
      <View style={styles.titleContainer}>
        <Typo 
          size={28}
          color={colors.titleText}
          fontWeight="700"
          style={styles.title}
        >
          {title}
        </Typo>
      </View>
      <View style={styles.spacer} />
    </View>
  );
};

export default OnBoardingHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacingY._24,
    marginBottom: spacingY._16,
  },
  backButtonContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: spacingX._5,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'flex-start',
    marginHorizontal: spacingX._10,
  },
  title: {
    textAlign: 'center',
  },
  spacer: {
    width: 40,
  },
});

