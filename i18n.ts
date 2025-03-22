import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LANGUAGE_DETECTOR = {
  type: "languageDetector",
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // 先嘗試從 AsyncStorage 讀取使用者設定的語言
      const savedLanguage = await AsyncStorage.getItem("user-language");
      if (savedLanguage) {
        return callback(savedLanguage);
      }
      // 如果沒有儲存的語言設定，使用系統語言
      const locale = Localization.locale;
      const languageCode = locale.split("-")[0];
      callback(languageCode === "zh" ? "zh-tw" : "en");
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
        translation: require("./public/locales/en/translation.json"),
      },
      "zh-tw": {
        translation: require("./public/locales/zh-tw/translation.json"),
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
