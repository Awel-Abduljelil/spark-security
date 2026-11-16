import { useCourses } from "../../hooks/useCourses";
import { useCourseLanguage } from "../../hooks/useCourseLanguage";
import { CoursePreview } from "./CoursePreview";

export function CourseCatalog() {
  const { language, setLanguage } = useCourseLanguage();
  const { data: courses, status } = useCourses(language);
  const message =
    status === "loading"
      ? "Loading courses..."
      : status === "error" || status === "notfound"
        ? "Courses are temporarily unavailable. Please try again later."
        : undefined;

  return (
    <CoursePreview
      coursesToShow={courses}
      language={language}
      onLanguageChange={setLanguage}
      message={message}
    />
  );
}
