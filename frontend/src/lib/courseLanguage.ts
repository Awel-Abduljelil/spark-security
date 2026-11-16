import type { CourseLanguage } from "../types/apiContract";

export const courseLanguages: CourseLanguage[] = ["en", "om", "am"];

export const courseLanguageLabels: Record<CourseLanguage, string> = {
  en: "English",
  om: "Afaan Oromoo",
  am: "አማርኛ",
};

export function isCourseLanguage(value: string | null): value is CourseLanguage {
  return value !== null && courseLanguages.includes(value as CourseLanguage);
}

export function readStoredCourseLanguage(): CourseLanguage {
  try {
    const stored = window.localStorage.getItem("course-language");
    return isCourseLanguage(stored) ? stored : "en";
  } catch {
    return "en";
  }
}

export function storeCourseLanguage(language: CourseLanguage): void {
  try {
    window.localStorage.setItem("course-language", language);
  } catch {
    // URL state remains available when browser storage is disabled.
  }
}
