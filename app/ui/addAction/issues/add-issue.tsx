import AppHeader from '@/components/AppHeader';
import ImageSourceModal from '@/components/common/ImageSourceModal';
import InfoModal from '@/components/common/InfoModal';
import Input from '@/components/Input';
import IssueTypeSelector from '@/components/issues/IssueTypeSelector';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { radius, spacingX, spacingY } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboardingContext';
import { useRTL } from '@/contexts/RTLContext';
import useThemeColors from '@/contexts/useThemeColors';
import { createIssue, IssueType } from '@/services/issueService';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Camera, X } from 'phosphor-react-native';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image as RNImage,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddIssueScreen() {
  const colors = useThemeColors();
  const { isRTL } = useRTL();
  const { apartmentId } = useOnboarding();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [selectedType, setSelectedType] = useState<IssueType | null>(null);
  const [description, setDescription] = useState<string>('');
  const [images, setImages] = useState<string[]>([]); // Array of image URIs (local)
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState<boolean>(false);
  const [imageSourceModalVisible, setImageSourceModalVisible] = useState<boolean>(false);

  const handleTypeSelect = (type: IssueType) => {
    setSelectedType(type);
    setError(null);
  };

  const requestCameraPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('permissionRequired') || 'Permission Required',
          t('cameraPermissionMessage') || 'Sorry, we need camera permissions to take photos!'
        );
        return false;
      }
    }
    return true;
  };

  const requestMediaLibraryPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('permissionRequired') || 'Permission Required',
          t('imagePermissionMessage') || 'Sorry, we need camera roll permissions to select images!'
        );
        return false;
      }
    }
    return true;
  };

  const handlePickImage = () => {
    if (images.length >= 2) {
      Alert.alert(
        t('maxImagesReached') || 'Maximum Images',
        t('maxImagesMessage') || 'You can only add up to 2 images'
      );
      return;
    }
    setImageSourceModalVisible(true);
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    // Wrap in Promise to catch unhandled rejections
    const cameraPromise = ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    // Handle promise rejection for "keep awake" errors
    cameraPromise.catch((err: any) => {
      // Silently ignore "keep awake" errors - they're harmless
      if (err?.message && err.message.includes('keep awake')) {
        console.log('Ignoring keep awake error (harmless)');
        return;
      }
      // Re-throw other errors
      throw err;
    });

    let result: ImagePicker.ImagePickerResult | null = null;
    
    try {
      result = await cameraPromise;
    } catch (err: any) {
      console.log('Error launching camera:', err);
      // Ignore "keep awake" and parcelable errors as they're harmless warnings
      if (err?.message && (
        err.message.includes('keep awake') ||
        err.message.includes('BadParcelableException') ||
        err.message.includes('ActivityResult') ||
        err.message.includes('ClassNotFoundException')
      )) {
        // Try to continue - the image might have been captured
        console.log('Ignoring harmless error, checking if image was captured...');
        // Don't return - let it try to process result
      } else {
        setError(t('errorTakingPhoto') || 'Error taking photo');
        return;
      }
    }

    // Process result - even if there was an error, the image might have been captured
    try {
      if (result && !result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        if (imageUri) {
          setImages((prevImages) => {
            if (prevImages.length >= 2) return prevImages;
            return [...prevImages, imageUri];
          });
          setError(null);
        }
      }
    } catch (err: any) {
      console.log('Error processing camera result:', err);
      // Silently ignore processing errors
    }
  };

  const handleChooseFromGallery = async () => {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) return;

    let result: ImagePicker.ImagePickerResult | null = null;
    
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
    } catch (err: any) {
      console.log('Error launching image library:', err);
      // Ignore "keep awake" and parcelable errors as they're harmless warnings
      if (err?.message && (
        err.message.includes('keep awake') ||
        err.message.includes('BadParcelableException') ||
        err.message.includes('ActivityResult') ||
        err.message.includes('ClassNotFoundException')
      )) {
        // Try to continue - the image might have been selected
        console.log('Ignoring harmless error, checking if image was selected...');
      } else {
        setError(t('errorPickingImage') || 'Error picking image');
        return;
      }
    }

    // Process result outside try-catch to avoid Android crash
    try {
      if (result && !result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        if (imageUri) {
          setImages((prevImages) => {
            if (prevImages.length >= 2) return prevImages;
            return [...prevImages, imageUri];
          });
          setError(null);
        }
      }
    } catch (err: any) {
      console.log('Error processing gallery result:', err);
      // Silently ignore processing errors
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedType) {
      setError(t('issueTypeRequired') || 'Please select an issue type');
      return;
    }

    if (!description.trim()) {
      setError(t('descriptionRequired') || 'Please enter a description');
      return;
    }

    if (!apartmentId) {
      setError(t('apartmentNotFound') || 'Apartment not found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For now, images array will be empty - image upload will be implemented later
      const result = await createIssue(
        apartmentId,
        selectedType,
        description.trim(),
        [] // Empty array for now - will be populated after image upload implementation
      );

      if (result.success) {
        setSuccessModalVisible(true);
      } else {
        setError(result.error || t('errorOccurred') || 'An error occurred, please try again');
      }
    } catch (err: any) {
      console.log('Error creating issue:', err);
      setError(t('errorOccurred') || 'An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => (
    <>
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: colors.redClose + '20' }]}>
          <Typo size={14} color={colors.redClose}>
            {error}
          </Typo>
        </View>
      )}

      {/* Issue Type Selection */}
      <IssueTypeSelector
        selectedType={selectedType}
        onTypeSelect={handleTypeSelect}
      />

      {/* Description Input */}
      <View style={styles.section}>
        <Typo size={16} color={colors.titleText} fontWeight="600" style={styles.label}>
          {t('description') || 'Description'} *
        </Typo>
        <Input
          placeholder={t('enterIssueDescription') || 'Describe the issue...'}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          containerStyle={StyleSheet.flatten([styles.inputContainer, styles.descriptionInput])}
          inputStyle={styles.descriptionInputText}
          onFocus={() => {
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, Platform.OS === 'ios' ? 300 : 100);
          }}
        />
      </View>

      {/* Image Picker Section */}
      <View style={styles.section}>
        <Typo size={16} color={colors.titleText} fontWeight="600" style={
            {marginBottom: spacingY._12, marginTop: spacingY._24}}>
          {t('images') || 'Images'} {t('optional')} ({images.length}/2)
        </Typo>
        
        {/* Image Grid */}
        <View style={styles.imageGrid}>
          {images.map((imageUri, index) => (
            <View key={index} style={styles.imageContainer}>
              <RNImage source={{ uri: imageUri }} style={styles.image} />
              <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: colors.redClose }]}
                onPress={() => handleRemoveImage(index)}
                activeOpacity={0.7}
              >
                <X size={16} color={colors.white} weight="bold" />
              </TouchableOpacity>
            </View>
          ))}
          
          {images.length < 2 && (
            <TouchableOpacity
              style={[styles.addImageButton, { 
                backgroundColor: colors.neutral800, 
                borderColor: colors.neutral700 
              }]}
              onPress={handlePickImage}
              activeOpacity={0.7}
            >
              <Camera size={24} color={colors.primary} weight="regular" />
              <Typo size={12} color={colors.subtitleText} style={styles.addImageText}>
                {t('addImage') || 'Add Image'}
              </Typo>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
        <AppHeader title={t('addIssue') || 'Report Issue'} />

        <View style={styles.contentWrapper}>
          {Platform.OS === 'ios' ? (
            <KeyboardAvoidingView
              behavior="padding"
              style={styles.keyboardView}
              keyboardVerticalOffset={0}
            >
              <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={[
                  styles.scrollContent,
                  { direction: isRTL ? 'rtl' : 'ltr' },
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
              >
                {renderContent()}
              </ScrollView>
            </KeyboardAvoidingView>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={[
                styles.scrollContent,
                { direction: isRTL ? 'rtl' : 'ltr' },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
              {renderContent()}
            </ScrollView>
          )}
        </View>

        {/* Fixed Action Button at Bottom */}
        <View
          style={[
            styles.buttonContainer,
            {
              backgroundColor: colors.screenBackground,
              paddingBottom: insets.bottom + spacingY._16,
            },
          ]}
        >
          <PrimaryButton
            onPress={handleSubmit}
            backgroundColor={colors.primary}
            loading={loading}
            style={styles.submitButton}
          >
            <Typo size={16} color={colors.white} fontWeight="600">
              {t('submitIssue') || 'Submit Issue'}
            </Typo>
          </PrimaryButton>
        </View>

        {/* Image Source Selection Modal */}
        <ImageSourceModal
          visible={imageSourceModalVisible}
          onClose={() => setImageSourceModalVisible(false)}
          onCameraPress={handleTakePhoto}
          onGalleryPress={handleChooseFromGallery}
        />

        {/* Success Modal */}
        <InfoModal
          visible={successModalVisible}
          type="success"
          title={t('success') || 'Success'}
          message={t('issueReported') || 'Issue reported successfully'}
          onClose={() => {
            setSuccessModalVisible(false);
            router.back();
          }}
          showCancel={false}
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
  contentWrapper: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacingX._20,
    paddingBottom: spacingY._60 + spacingY._40,
  },
  section: {
    marginBottom: spacingY._24,
  },
  label: {
    marginBottom: spacingY._12,
  },
  inputContainer: {
    marginBottom: spacingY._8,
  },
  descriptionInput: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingTop: spacingY._12,
  },
  descriptionInputText: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  errorContainer: {
    padding: spacingX._12,
    borderRadius: radius._8,
    marginBottom: spacingY._16,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacingX._12,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: radius._10,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: radius._10,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingX._8,
  },
  addImageText: {
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(22, 110, 139, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  submitButton: {
    width: '100%',
  },
});

