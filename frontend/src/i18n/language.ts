import { createContext } from "react";

export type Language = "en" | "om" | "am";

export function isLanguage(value: string): value is Language {
  return value === "en" || value === "om" || value === "am";
}

export interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (text: string) => string;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);
