import { onAuthStateChanged, User } from 'firebase/auth';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { signInWithEmail, signInWithGoogle } from '../services/authService';
import { checkOnboardingStatus } from '../services/onboardingService';
import { SignInRequest } from '../data/types';

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
        setEmail('');
        setPassword('');
        // Check onboarding status and navigate accordingly
        const onboardingStatus = await checkOnboardingStatus();
        if (onboardingStatus.completed) {
          router.replace('/(home)');
        } else {
          router.replace('/(onboarding)/choose-role');
        }
      }
    } catch (err: any) {
      console.log('Login error:', err);
      setError('An error occurred, please try again');
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
        // Check onboarding status and navigate accordingly
        const onboardingStatus = await checkOnboardingStatus();
        if (onboardingStatus.completed) {
          router.replace('/(home)');
        } else {
          router.replace('/(onboarding)/choose-role');
        }
      }
    } catch (err: any) {
      console.log('Google sign in error:', err);
      setError('An error occurred, please try again');
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

