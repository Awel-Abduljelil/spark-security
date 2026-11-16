import type { CourseLanguage } from "../../types/apiContract";
import { courseLanguageLabels } from "../../lib/courseLanguage";
import "./CourseLanguageBadge.css";

export function CourseLanguageBadge({ language }: { language: CourseLanguage }) {
  return (
    <span className={`course-language-badge course-language-badge--${language}`}>
      {courseLanguageLabels[language]}
    </span>
  );
}
