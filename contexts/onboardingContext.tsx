import { auth } from '@/config/firebase';
import { checkOnboardingStatus, UserRole } from '@/services/onboardingService';
import { onAuthStateChanged } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface OnboardingContextType {
  onboardingCompleted: boolean;
  role: UserRole | null;
  apartmentId: string | null;
  isLoading: boolean;
  refreshOnboardingStatus: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [apartmentId, setApartmentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshOnboardingStatus = async () => {
    try {
      const status = await checkOnboardingStatus();
      setOnboardingCompleted(status.completed);
      setRole(status.role);
      setApartmentId(status.apartmentId);
    } catch (error) {
      console.log('Error refreshing onboarding status:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoading(true);
        await refreshOnboardingStatus();
        setIsLoading(false);
      } else {
        setOnboardingCompleted(false);
        setRole(null);
        setApartmentId(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const contextValue: OnboardingContextType = {
    onboardingCompleted,
    role,
    apartmentId,
    isLoading,
    refreshOnboardingStatus,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

