import { auth, firestore } from '@/config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

export interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber?: string;
}

/**
 * Get user profile information from Firestore
 */
export async function getUserProfile(): Promise<{
  success: boolean;
  error: string | null;
  profile?: UserProfile;
}> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Get user document from Firestore
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        success: true,
        profile: {
          fullName: userData.fullName || user.displayName || '',
          email: userData.email || user.email || '',
          phoneNumber: userData.phoneNumber || '',
        },
      };
    } else {
      // If no Firestore document, use auth data
      return {
        success: true,
        profile: {
          fullName: user.displayName || '',
          email: user.email || '',
          phoneNumber: '',
        },
      };
    }
  } catch (error: any) {
    console.log('Error getting user profile:', error);
    return {
      success: false,
      error: 'Failed to load user profile',
    };
  }
}

/**
 * Update user profile in Firestore and Firebase Auth
 */
export async function updateUserProfile(profile: UserProfile): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Update Firebase Auth profile
    await updateProfile(user, {
      displayName: profile.fullName,
    });

    // Update Firestore user document
    const userDocRef = doc(firestore, 'users', user.uid);
    await updateDoc(userDocRef, {
      fullName: profile.fullName,
      email: profile.email,
      phoneNumber: profile.phoneNumber || '',
      updatedAt: new Date().toISOString(),
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.log('Error updating user profile:', error);
    return {
      success: false,
      error: 'Failed to update user profile',
    };
  }
}

