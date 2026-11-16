import { Link } from "react-router-dom";
import type { CohortStatus } from "../../hooks/useCohort";
import { useLanguage } from "../../i18n/useLanguage";
import type { CourseWithDetail } from "../../types/course";
import "./CourseHeader.css";
import { CourseLanguageBadge } from "./CourseLanguageBadge";

interface CourseHeaderProps {
  course: CourseWithDetail;
  cohortStatus: CohortStatus;
}

export function CourseHeader({
  course,
  cohortStatus,
}: CourseHeaderProps) {
  const { t } = useLanguage();
  const cohortLoading = cohortStatus === "loading";
  const cohortUnavailable = cohortStatus === "error";
  const noCohort = cohortStatus === "none";
  return (
    <header className="course-detail-header">
      <nav className="course-detail-header__breadcrumb" aria-label={t("Breadcrumb")}>
        <Link to="/">{t("Home")}</Link>
        <span aria-hidden="true">/</span>
        <Link to="/#courses">{t("Courses")}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{course.title}</span>
      </nav>
      <div className={`course-detail-header__body${course.cover ? " course-detail-header__body--with-cover" : ""}`}>
        <div className="course-detail-header__content">
          <div className="course-detail-header__badges">
            <span className="course-card__level">{course.level}</span>
            {course.tag && <span className="course-card__tag">{course.tag}</span>}
            <CourseLanguageBadge language={course.language} />
          </div>
          <h1>{course.title}</h1>
          <p className="course-detail-header__description">{course.description}</p>
          <ul className="course-detail-header__meta" aria-label={t("Course details")}>
            <li>{course.duration}</li>
            <li>{course.sessions} {t("sessions")}</li>
            <li>{course.labs} {t("labs")}</li>
          </ul>
          <p className="course-detail-header__cohort">
            <span>
              {t("Next cohort")}:{" "}
              {cohortLoading
                ? t("Loading...")
                : cohortUnavailable
                  ? t("Unavailable")
                  : noCohort
                    ? t("Not scheduled")
                    : course.startDate || t("To be announced")}
            </span>
            <span>
              {cohortLoading
                ? t("Checking availability...")
                : cohortUnavailable
                  ? t("Enrollment unavailable")
                  : noCohort
                    ? t("Registration closed")
                    : course.totalSeats === 0
                      ? t("Unlimited seats")
                      : `${course.seatsLeft} ${t("seats left")}`}
            </span>
          </p>
        </div>
        {course.cover && (
          <div className="course-detail-header__visual">
            <img src={course.cover} alt={`${course.title} course`} />
          </div>
        )}
      </div>
    </header>
  );
}
