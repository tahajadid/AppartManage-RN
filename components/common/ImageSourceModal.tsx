import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import { Camera, Image, X } from 'phosphor-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Modal,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

interface ImageSourceModalProps {
  visible: boolean;
  onClose: () => void;
  onCameraPress: () => void;
  onGalleryPress: () => void;
}

export default function ImageSourceModal({
  visible,
  onClose,
  onCameraPress,
  onGalleryPress,
}: ImageSourceModalProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();

  const handleCameraPress = () => {
    onCameraPress();
    onClose();
  };

  const handleGalleryPress = () => {
    onGalleryPress();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalContent, { backgroundColor: colors.neutral800 }]}>
              <View style={styles.header}>
                <Typo size={18} color={colors.titleText} fontWeight="600">
                  {t('selectImageSource') || 'Select Image Source'}
                </Typo>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <X size={20} color={colors.subtitleText} weight="bold" />
                </TouchableOpacity>
              </View>

              <View style={styles.options}>
                <TouchableOpacity
                  style={[styles.option, { backgroundColor: colors.neutral700 }]}
                  onPress={handleCameraPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <Camera size={24} color={colors.primary} weight="regular" />
                  </View>
                  <Typo size={16} color={colors.text} fontWeight="600">
                    {t('takePhoto') || 'Take Photo'}
                  </Typo>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.option, { backgroundColor: colors.neutral700 }]}
                  onPress={handleGalleryPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <Image size={24} color={colors.primary} weight="regular" />
                  </View>
                  <Typo size={16} color={colors.text} fontWeight="600">
                    {t('chooseFromGallery') || 'Choose from Gallery'}
                  </Typo>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: radius._20,
    borderTopRightRadius: radius._20,
    paddingBottom: spacingY._50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._20,
    paddingBottom: spacingY._16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    padding: spacingX._8,
  },
  options: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._16,
    gap: spacingY._12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacingX._16,
    borderRadius: radius._12,
    gap: spacingX._16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius._10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

