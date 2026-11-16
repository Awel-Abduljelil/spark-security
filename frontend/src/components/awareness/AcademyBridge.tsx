import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import { useCourses } from "../../hooks/useCourses";
import { CourseCard } from "../course/CourseCard";

export function AcademyBridge() {
  const { t } = useLanguage();
  const { data: courses } = useCourses();
  const beginnerCourse = courses.find((course) => course.level === "Beginner");

  if (!beginnerCourse) {
    return null;
  }

  return (
    <section
      className="awareness-section awareness-bridge"
      aria-labelledby="academy-bridge-title"
    >
      <div className="awareness-section__inner awareness-bridge__inner">
        <div className="awareness-bridge__content">
          <p className="awareness-eyebrow">{t("Want to go deeper?")}</p>
          <h2 id="academy-bridge-title">
            {t("Build your digital safety habits with guided learning.")}
          </h2>
          <p>
            {t("The beginner course is a simple, structured way to understand online risks and respond with calm, practical steps.")}
          </p>
          <div className="awareness-actions">
            <Link
              className="awareness-button awareness-button--primary"
              to={`/courses/${beginnerCourse.slug}`}
            >
              {t("Take the beginner course")}
            </Link>
            <Link
              className="awareness-button awareness-button--secondary"
              to="/#courses"
            >
              {t("Browse all courses")}
            </Link>
          </div>
        </div>

        <CourseCard course={beginnerCourse} />
      </div>
    </section>
  );
}
