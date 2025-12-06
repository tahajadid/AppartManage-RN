import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { I18nManager, Platform } from 'react-native';
import i18n from '@/i18n';

interface RTLContextType {
  isRTL: boolean;
  currentLanguage: string;
  changeLanguage: (lang: 'en' | 'ar') => Promise<void>;
  refreshKey: number;
}

const RTLContext = createContext<RTLContextType | undefined>(undefined);

export const RTLProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from i18n
  const [isRTL, setIsRTL] = useState(() => {
    const lang = i18n.language;
    return lang === 'ar';
  });
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [refreshKey, setRefreshKey] = useState(0);

  // Listen to i18n language changes
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      const shouldBeRTL = lng === 'ar';
      setCurrentLanguage(lng);
      setIsRTL(shouldBeRTL);
      
      // Update I18nManager (for native components)
      if (Platform.OS !== 'web') {
        I18nManager.forceRTL(shouldBeRTL);
        I18nManager.allowRTL(shouldBeRTL);
      }
      
      // Force re-render by updating key
      setRefreshKey(prev => prev + 1);
    };

    // Set initial state
    handleLanguageChanged(i18n.language);

    // Listen for language changes
    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  const changeLanguage = async (lang: 'en' | 'ar') => {
    const shouldBeRTL = lang === 'ar';
    
    // Update state immediately (before i18n changes)
    setCurrentLanguage(lang);
    setIsRTL(shouldBeRTL);
    
    // Update i18n
    await i18n.changeLanguage(lang);
    
    // Update I18nManager (for native components)
    if (Platform.OS !== 'web') {
      I18nManager.forceRTL(shouldBeRTL);
      I18nManager.allowRTL(shouldBeRTL);
    }
    
    // Force re-render
    setRefreshKey(prev => prev + 1);
  };

  return (
    <RTLContext.Provider value={{ isRTL, currentLanguage, changeLanguage, refreshKey }}>
      <React.Fragment key={refreshKey}>
        {children}
      </React.Fragment>
    </RTLContext.Provider>
  );
};

export const useRTL = (): RTLContextType => {
  const context = useContext(RTLContext);
  if (!context) {
    throw new Error('useRTL must be used within RTLProvider');
  }
  return context;
};

