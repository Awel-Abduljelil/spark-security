import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { LanguageContext, type Language } from "./language";
import { translations } from "./translations";

function getInitialLanguage(): Language {
  const savedLanguage = window.localStorage.getItem("spark-language");
  return savedLanguage === "om" || savedLanguage === "am" ? savedLanguage : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem("spark-language", language);
    document.documentElement.lang =
      language === "om" ? "om" : language === "am" ? "am" : "en";
  }, [language]);

  const t = (text: string) =>
    language === "en" ? text : translations[language][text] ?? text;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
