import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, NativeModules } from 'react-native';

// 直接引入翻譯檔案
import enTranslation from './translations/en.json';
import zhTWTranslation from './translations/zh-tw.json';

// 以更穩定的方式取得用戶語系
const getDeviceLocale = () => {
  // 針對 iOS
  if (Platform.OS === 'ios') {
    return (
      NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0]
    );
  }
  // 針對 Android
  return NativeModules.I18nManager.localeIdentifier;
};

const LANGUAGE_DETECTOR = {
  type: "languageDetector",
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // 先嘗試從存儲中獲取使用者設定的語系
      const savedLanguage = await AsyncStorage.getItem("user-language");
      if (savedLanguage) {
        return callback(savedLanguage);
      }
      
      // 若沒有存儲的語系，則嘗試取得設備語系
      try {
        const deviceLocale = getDeviceLocale();
        const languageCode = deviceLocale.split(/[-_]/)[0];
        callback(languageCode === "zh" ? "zh-tw" : "en");
      } catch (localeError) {
        console.error("Error detecting device locale:", localeError);
        callback("en"); // 預設使用英文
      }
    } catch (error) {
      console.error("Language detection error:", error);
      callback("en");
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem("user-language", lng);
    } catch (error) {
      console.error("Language caching error:", error);
    }
  },
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    resources: {
      en: {
        translation: enTranslation
      },
      "zh-tw": {
        translation: zhTWTranslation
      },
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;