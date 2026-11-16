import { CoursePreview } from "../home/CoursePreview";
import { useCourses } from "../../hooks/useCourses";
import { useLanguage } from "../../i18n/useLanguage";
import "./RelatedCourses.css";

interface RelatedCoursesProps {
  currentSlug: string;
}

export function RelatedCourses({ currentSlug }: RelatedCoursesProps) {
  const { t } = useLanguage();
  const { data: courses, status } = useCourses();
  const relatedCourses = courses.filter(
    (course) => course.slug !== currentSlug,
  );
  const message =
    status === "loading"
      ? t("Loading related courses...")
      : status === "error" || status === "notfound"
        ? t("Related courses are temporarily unavailable.")
        : undefined;

  if (status === "ready" && relatedCourses.length === 0) {
    return null;
  }

  return (
    <section className="course-related" aria-label={t("Related courses")}>
      <CoursePreview
        coursesToShow={relatedCourses}
        showAllLink={false}
        message={message}
      />
    </section>
  );
}
