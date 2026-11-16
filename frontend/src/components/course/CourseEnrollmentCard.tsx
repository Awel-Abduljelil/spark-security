import { Link } from "react-router-dom";
import type { CohortStatus } from "../../hooks/useCohort";
import { useLanguage } from "../../i18n/useLanguage";
import type { CourseWithDetail } from "../../types/course";
import "./CourseEnrollmentCard.css";

interface CourseEnrollmentCardProps {
  course: CourseWithDetail;
  cohortStatus: CohortStatus;
}

export function CourseEnrollmentCard({
  course,
  cohortStatus,
}: CourseEnrollmentCardProps) {
  const { t } = useLanguage();
  const cohortReady = cohortStatus === "ready";
  const cohortLoading = cohortStatus === "loading";
  const cohortUnavailable = cohortStatus === "error";
  const noCohort = cohortStatus === "none";
  const isFull = cohortReady && course.totalSeats !== 0 && course.seatsLeft === 0;

  return (
    <aside className="course-enrollment" aria-label={t("Enroll in this cohort")}>
      <p className="course-enrollment__label">{t("Cohort enrollment")}</p>
      <p className="course-enrollment__price">
        {cohortReady && typeof course.priceEtb === "number"
          ? `ETB ${course.priceEtb.toLocaleString("en-US")}`
          : t("Price unavailable")}
      </p>
      <dl className="course-enrollment__details">
        <div>
          <dt>{t("Starts")}</dt>
          <dd>
            {cohortReady
              ? course.startDate || t("To be announced")
              : cohortLoading
                ? t("Loading...")
                : t("Unavailable")}
          </dd>
        </div>
        <div>
          <dt>{t("Seats left")}</dt>
          <dd>
            {cohortReady
              ? course.totalSeats === 0
                ? t("Unlimited")
                : `${course.seatsLeft} of ${course.totalSeats}`
              : cohortLoading
                ? t("Loading...")
                : t("Unavailable")}
          </dd>
        </div>
      </dl>
      {cohortLoading ? (
        <button className="course-enrollment__button" type="button" disabled>
          {t("Checking availability...")}
        </button>
      ) : cohortUnavailable ? (
        <button className="course-enrollment__button" type="button" disabled>
          {t("Enrollment unavailable")}
        </button>
      ) : noCohort ? (
        <button className="course-enrollment__button" type="button" disabled>
          {t("Registration closed")}
        </button>
      ) : isFull ? (
        <button className="course-enrollment__button" type="button" disabled>
          {t("Cohort full")}
        </button>
      ) : (
        <Link
          className="hero-action-button course-enrollment__button"
          to={`/enroll?course=${course.slug}`}
        >
          {t("Enroll now")}
        </Link>
      )}
    </aside>
  );
}
