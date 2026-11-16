import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { CourseLanguage } from "../types/apiContract";
import {
  isCourseLanguage,
  readStoredCourseLanguage,
  storeCourseLanguage,
} from "../lib/courseLanguage";

export function useCourseLanguage(): {
  language: CourseLanguage;
  setLanguage: (language: CourseLanguage) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const [storedLanguage, setStoredLanguage] = useState(readStoredCourseLanguage);
  const urlLanguage = searchParams.get("lang");
  const language =
    urlLanguage === null
      ? storedLanguage
      : isCourseLanguage(urlLanguage)
        ? urlLanguage
        : "en";

  useEffect(() => {
    if (urlLanguage === null) {
      if (storedLanguage !== "en") {
        setSearchParams((current) => {
          const next = new URLSearchParams(current);
          next.set("lang", storedLanguage);
          return next;
        }, { replace: true });
      }
      return;
    }

    const nextLanguage = isCourseLanguage(urlLanguage) ? urlLanguage : "en";
    if (nextLanguage !== urlLanguage) {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set("lang", nextLanguage);
        return next;
      }, { replace: true });
    }
    storeCourseLanguage(nextLanguage);
  }, [searchParams, setSearchParams, storedLanguage, urlLanguage]);

  const setLanguage = useCallback((nextLanguage: CourseLanguage) => {
    storeCourseLanguage(nextLanguage);
    setStoredLanguage(nextLanguage);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("lang", nextLanguage);
      return next;
    });
  }, [setSearchParams]);

  return { language, setLanguage };
}
