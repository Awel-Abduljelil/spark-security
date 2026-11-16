import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import type { Course } from "../../types/course";
import type { CourseLanguage } from "../../types/apiContract";
import { CourseLanguageBadge } from "../course/CourseLanguageBadge";
import "./CoursePreview.css";

interface CoursePreviewProps {
  coursesToShow?: Course[];
  showAllLink?: boolean;
  message?: string;
  language?: CourseLanguage;
  onLanguageChange?: (language: CourseLanguage) => void;
}

export function CoursePreview({
  coursesToShow = [],
  showAllLink = true,
  message,
  language = "en",
  onLanguageChange,
}: CoursePreviewProps) {
  const { t } = useLanguage();

  return (
    <section
      className="course-preview"
      id="courses"
      aria-labelledby="courses-title"
    >
      <div className="course-preview__container">
        <div className="course-preview__heading">
          <div>
            <p className="course-preview__eyebrow">{t("Start exploring")}</p>
            <h2 id="courses-title">{t("A path for every curious mind.")}</h2>
            <p>{t("Short, focused courses to help you build real understanding.")}</p>
          </div>
          {showAllLink && (
            <Link className="course-preview__all-link" to="/#courses">
              {t("See all courses")} <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
        <div className="course-preview__filters">
            {onLanguageChange && (
              <>
                <label htmlFor="course-language-filter">Course language</label>
                <select
                  id="course-language-filter"
                  aria-label="Filter courses by teaching language"
                  value={language}
                  onChange={(event) => onLanguageChange(event.currentTarget.value as CourseLanguage)}
                >
                  <option value="en">English</option>
                  <option value="om">Afaan Oromoo</option>
                  <option value="am">አማርኛ</option>
                </select>
              </>
            )}
            <p aria-live="polite">
              {coursesToShow.length} {coursesToShow.length === 1 ? "course" : "courses"}
            </p>
        </div>
        {message ? (
            <p className="course-preview__message" role="status">
              {message}
            </p>
        ) : coursesToShow.length === 0 ? (
            <div className="course-preview__empty" role="status">
              <p>
                {language === "en"
                  ? "No courses are available yet."
                  : "No courses in this language yet. Showing English courses is available."}
              </p>
              {language !== "en" && onLanguageChange && (
                <button type="button" onClick={() => onLanguageChange("en")}>
                  Show English courses
                </button>
              )}
            </div>
        ) : (
            <div className="course-grid">
            {coursesToShow.map((course) => (
              <article className="course-card" key={course.slug}>
                <div className="course-card__badges">
                  <span className="course-card__level">{course.level}</span>
                  {course.tag && (
                    <span className="course-card__tag">{course.tag}</span>
                  )}
                  <CourseLanguageBadge language={course.language} />
                </div>
                <h3>{course.title}</h3>
                <p className="course-card__description">
                  {course.description}
                </p>
                {course.skills && (
                  <ul
                    className="course-card__skills"
                    aria-label={t("Skills covered")}
                  >
                    {course.skills.slice(0, 4).map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                )}
                <ul
                  className="course-card__meta"
                  aria-label={t("Course details")}
                >
                  <li>{course.duration}</li>
                  <li>{course.sessions} {t("sessions")}</li>
                  <li>{course.labs} {t("labs")}</li>
                </ul>
                <div className="course-card__footer">
                  <span className="course-card__price">{course.price}</span>
                  <Link
                    className="course-card__link"
                    to={`/courses/${course.slug}`}
                  >
                    {t("View course")} <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
