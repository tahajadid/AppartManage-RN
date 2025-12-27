/**
 * Cloudinary Configuration
 * 
 * To get your credentials:
 * 1. Go to https://cloudinary.com/console
 * 2. Navigate to Dashboard
 * 3. Copy your Cloud Name, API Key, and API Secret
 * 
 * IMPORTANT: For production, store these in environment variables or secure storage
 * Never commit API secrets to version control!
 */

export const cloudinaryConfig = {
  cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dabef47gg',
  apiKey: process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || '735762384486547',
  // Note: API Secret should NOT be exposed in client-side code
  // For React Native, we'll use unsigned uploads with upload presets
  uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'appartmanage-issues',
};

/**
 * Cloudinary Upload URL
 */
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;

