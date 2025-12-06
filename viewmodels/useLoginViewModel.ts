import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { signInWithEmail, signInWithGoogle } from '../services/authService';

export function useLoginViewModel() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // User is signed in, navigate to tabs
        //router.replace('/(home)');
      } else {
        // User is signed out, navigate to login
        //router.replace('/(auth)/login');
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Handle email/password login
   */
  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signInWithEmail(email, password);
      
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        // Navigation will happen automatically via onAuthStateChanged
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google Sign-In
   */
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithGoogle();
      
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        // Navigation will happen automatically via onAuthStateChanged
      }
    } catch (err: any) {
      // Catch any errors, including native module loading errors
      let errorMessage = 'An error occurred during Google sign in';
      
      if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Check if it's a native module error
      if (err?.message?.includes('TurboModuleRegistry') || err?.message?.includes('RNGoogleSignin')) {
        errorMessage = 'Google Sign-In is not available. Please rebuild the app with native modules: npx expo prebuild && npx expo run:ios';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    user,
    handleEmailLogin,
    handleGoogleSignIn,
  };
}

