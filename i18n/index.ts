import i18next, { InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager, Platform } from "react-native";

import translationAr from "./locales/arabic.json";
import translationEn from "./locales/english.json";

const resources = {
  ar: { translation: translationAr },
  en: { translation: translationEn },
};

const RTL_LANGUAGES = ["ar"]; // Arabic is RTL
const defaultLanguage = "en";

// ⚡ Helper to handle RTL + restart
const handleDirection = (lng: string) => {
  if (Platform.OS !== "web") {
    const isRTL = RTL_LANGUAGES.includes(lng);

    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      // restart is needed to apply changes
    }
  }
};

// Options typed explicitly
const options: InitOptions = {
  resources,
  lng: defaultLanguage,
  fallbackLng: "en",
  compatibilityJSON: "v4",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
};

// Initialize i18n
i18next.use(initReactI18next).init(options);

// 🔄 Change language + apply RTL if needed
export const changeLanguage = async (lng: string) => {
  await i18next.changeLanguage(lng);
  handleDirection(lng);
};

export default i18next;
