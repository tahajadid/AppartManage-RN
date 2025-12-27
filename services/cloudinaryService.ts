import { CLOUDINARY_UPLOAD_URL, cloudinaryConfig } from '@/config/cloudinary';

export interface CloudinaryUploadResult {
  success: boolean;
  error?: string;
  url?: string;
  publicId?: string;
}

/**
 * Upload a single image to Cloudinary
 * @param imageUri - Local URI of the image (from expo-image-picker)
 * @returns Promise with upload result containing the Cloudinary URL
 */
export async function uploadImageToCloudinary(
  imageUri: string
): Promise<CloudinaryUploadResult> {
  try {
    // Create FormData for the upload
    const formData = new FormData();
    
    // Extract filename from URI
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Append image file to FormData
    formData.append('file', {
      uri: imageUri,
      type: type,
      name: filename,
    } as any);

    // Add upload preset (required for unsigned uploads)
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    
    // Optional: Add folder to organize images
    formData.append('folder', 'appartmanage/issues');

    // Upload to Cloudinary
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('Cloudinary upload error:', errorData);
      return {
        success: false,
        error: errorData.error?.message || 'Failed to upload image',
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      url: data.secure_url || data.url,
      publicId: data.public_id,
    };
  } catch (error: any) {
    console.log('Error uploading to Cloudinary:', error);
    return {
      success: false,
      error: error.message || 'An error occurred while uploading the image',
    };
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param imageUris - Array of local URIs (from expo-image-picker)
 * @returns Promise with array of upload results
 */
export async function uploadImagesToCloudinary(
  imageUris: string[]
): Promise<{
  success: boolean;
  error?: string;
  urls?: string[];
}> {
  try {
    if (imageUris.length === 0) {
      return {
        success: true,
        urls: [],
      };
    }

    // Upload all images in parallel
    const uploadPromises = imageUris.map((uri) => uploadImageToCloudinary(uri));
    const results = await Promise.all(uploadPromises);

    // Check if all uploads succeeded
    const failedUploads = results.filter((result) => !result.success);
    if (failedUploads.length > 0) {
      return {
        success: false,
        error: failedUploads[0].error || 'Some images failed to upload',
      };
    }

    // Extract URLs from successful uploads
    const urls = results
      .map((result) => result.url)
      .filter((url): url is string => !!url);

    return {
      success: true,
      urls,
    };
  } catch (error: any) {
    console.log('Error uploading images to Cloudinary:', error);
    return {
      success: false,
      error: error.message || 'An error occurred while uploading images',
    };
  }
}

