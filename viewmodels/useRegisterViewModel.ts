import { router } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { registerWithEmail, signInWithGoogle } from '../services/authService';
import { RegisterRequest } from '../data/types';

export function useRegisterViewModel() {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Handle registration
   */
  const handleRegister = async () => {
    // Validation
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await registerWithEmail({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password,
        phoneNumber: phoneNumber.trim() || undefined,
      });
      
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        // Clear form
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setPhoneNumber('');
        // Navigate to onboarding after successful registration
        router.replace('/(onboarding)/choose-role');
      }
    } catch (err: any) {
      console.log('Registration error:', err);
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
        // Navigate to onboarding after successful Google sign in (if needed)
        // For now, check if onboarding is needed
        router.replace('/(onboarding)/choose-role');
      }
    } catch (err: any) {
      console.log('Google sign in error:', err);
      setError('An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  return {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    phoneNumber,
    setPhoneNumber,
    loading,
    error,
    user,
    handleRegister,
    handleGoogleSignIn,
  };
}

