import { sendPasswordReset } from '@/services/authService';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useForgetPasswordViewModel() {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const { t } = useTranslation();

  const handleSendResetLink = async () => {
    if (!email.trim()) {
      setError(t('email') + ' is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await sendPasswordReset(email.trim());
      
      if (result.success) {
        setSuccess(true);
        setError(null);
        // Clear email after successful send
        setTimeout(() => {
          setEmail('');
        }, 2000);
      } else {
        setError(result.error || t('errorOccurred'));
        setSuccess(false);
      }
    } catch (err: any) {
      console.log('Password reset error:', err);
      setError(t('errorOccurred'));
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    loading,
    error,
    success,
    handleSendResetLink,
  };
}

