import Constants from 'expo-constants';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../config/firebase';
import { AuthResult, RegisterRequest } from '../data/types';

// Check if we're running in Expo Go (where native modules don't work)
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// Lazy load GoogleSignin to avoid errors if native module isn't linked
let GoogleSignin: any = null;
let isGoogleSigninConfigured = false;
let googleSigninLoadAttempted = false;
let googleSigninLoadError: Error | null = null;

const getGoogleSignin = async () => {
  // Don't try to load in Expo Go
  if (isExpoGo) {
    return null;
  }

  // If we've already tried and failed, don't try again
  if (googleSigninLoadError) {
    return null;
  }

  if (!GoogleSignin && !googleSigninLoadAttempted) {
    googleSigninLoadAttempted = true;
    try {
      // Use dynamic import with error handling
      const module = await import('@react-native-google-signin/google-signin');
      
      if (module?.GoogleSignin) {
        GoogleSignin = module.GoogleSignin;
        
        // Configure Google Sign-In only once
        if (!isGoogleSigninConfigured) {
          try {
            const config = {
              // Web Client ID from Google Cloud Console
              webClientId: '953671950972-j824d2grrefn764m5892u4u15qe131a5.apps.googleusercontent.com',
              // iOS Client ID (only needed for iOS, should be different from webClientId)
              // iosClientId: 'YOUR_IOS_CLIENT_ID_HERE',
            };
            console.log('Configuring Google Sign-In with:', {
              webClientId: config.webClientId,
            });
            GoogleSignin.configure(config);
            isGoogleSigninConfigured = true;
            console.log('Google Sign-In configured successfully');
          } catch (configError) {
            console.warn('Failed to configure Google Sign-In:', configError);
            googleSigninLoadError = configError as Error;
            return null;
          }
        }
      }
    } catch (error: any) {
      // Store the error so we don't keep trying
      googleSigninLoadError = error;
      const errorMsg = error?.message || String(error);
      console.warn('Google Sign-In module not available. Native module not linked.', errorMsg);
      return null;
    }
  }
  
  // If we tried but GoogleSignin is still null, return null
  if (googleSigninLoadAttempted && !GoogleSignin) {
    return null;
  }
  
  return GoogleSignin;
};

// Export a function to check if Google Sign-In is available
export const isGoogleSignInAvailable = () => !isExpoGo;

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      user: userCredential.user,
      error: null,
    };
  } catch (error: any) {
    console.log('Sign in error:', error);
    
    // Check for specific error codes
    if (error?.code === 'auth/invalid-credential') {
      return {
        user: null,
        error: 'Email or password is invalid',
      };
    }
    
    // Generic error for other cases
    return {
      user: null,
      error: 'An error occurred, please try again',
    };
  }
}

/**
 * Register a new user with email and password, and create their Firestore document
 */
export async function registerWithEmail(data: RegisterRequest): Promise<AuthResult> {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = userCredential.user;

    // Create user document in Firestore
    const userDocRef = doc(firestore, 'users', user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return {
      user: user,
      error: null,
    };
  } catch (error: any) {
    console.log('Registration error:', error);
    return {
      user: null,
      error: 'An error occurred, please try again',
    };
  }
}

/**
 * Sign up with email and password (legacy function, use registerWithEmail instead)
 */
export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return {
      user: userCredential.user,
      error: null,
    };
  } catch (error: any) {
    console.log('Sign up error:', error);
    return {
      user: null,
      error: 'An error occurred, please try again',
    };
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const GoogleSigninModule = await getGoogleSignin();
    
    if (!GoogleSigninModule) {
      const errorMsg = isExpoGo 
        ? 'Google Sign-In is not available in Expo Go. Please use a development build.'
        : 'Google Sign-In is not available. The native module is not linked. Please rebuild the app with: npx expo prebuild && npx expo run:android';
      
      return {
        user: null,
        error: errorMsg,
      };
    }
    
    // Check if your device supports Google Play (Android only)
    if (typeof GoogleSigninModule.hasPlayServices === 'function') {
      await GoogleSigninModule.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }
    
    // Sign in with Google
    const signInResult = await GoogleSigninModule.signIn();
    
    // Get the user's ID token
    // The response structure is: { type: "success", data: { idToken, user, ... } }
    const idToken = signInResult?.data?.idToken || signInResult?.idToken;
    
    if (!idToken) {
      console.error('No ID token received from Google Sign-In. Full result:', JSON.stringify(signInResult, null, 2));
      return {
        user: null,
        error: 'Failed to get ID token from Google Sign-In. The response may be invalid.',
      };
    }
    
    console.log('ID Token received, length:', idToken.length);
    
    // Create a Google credential with the token
    let googleCredential;
    try {
      googleCredential = GoogleAuthProvider.credential(idToken);
      if (!googleCredential) {
        throw new Error('GoogleAuthProvider.credential returned null');
      }
    } catch (credError: any) {
      console.error('Error creating Google credential:', credError);
      return {
        user: null,
        error: `Failed to create Google credential: ${credError.message || 'Invalid ID token'}`,
      };
    }
    
    // Sign in with the credential
    const userCredential = await signInWithCredential(auth, googleCredential);
    
    return {
      user: userCredential.user,
      error: null,
    };
  } catch (error: any) {
    // Log full error for debugging
    console.log('Google Sign-In Error:', {
      code: error.code,
      message: error.message,
      error: error,
    });
    
    return {
      user: null,
      error: 'An error occurred, please try again',
    };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    const GoogleSigninModule = await getGoogleSignin();
    if (GoogleSigninModule) {
      await GoogleSigninModule.signOut();
    }
    await auth.signOut();
  } catch (error) {
    console.log('Error signing out:', error);
    throw error;
  }
}

