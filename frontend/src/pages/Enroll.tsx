import { useSearchParams } from "react-router-dom";
import { EnrollForm } from "../components/enroll/EnrollForm";
import { EnrollSteps } from "../components/enroll/EnrollSteps";
import { PaymentInfo } from "../components/enroll/PaymentInfo";
import { EnrollmentStatusLookup } from "../components/enroll/EnrollmentStatusLookup";
import { useCourses } from "../hooks/useCourses";
import { useLanguage } from "../i18n/useLanguage";
import "./Enroll.css";

export function Enroll() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const courseSlug = searchParams.get("course");
  const { data: courses, status } = useCourses();
  const initialCourse = courses.find((course) => course.slug === courseSlug);

  return (
    <main className="enroll-page">
      <header className="enroll-page__heading">
        <p className="enroll-page__eyebrow">{t("Join a cohort")}</p>
        <h1>{t("Enroll in a course")}</h1>
        <p>{t("Reserve your place by completing payment and sending us your receipt.")}</p>
        {status === "error" && (
          <p className="enroll-notice" role="alert">
            {t("Courses are temporarily unavailable. Please try again later.")}
          </p>
        )}
      </header>
      <div className="enroll-page__layout">
        <div className="enroll-page__instructions">
          <EnrollSteps />
          <PaymentInfo />
        </div>
        <EnrollForm
          key={`${courseSlug ?? "no-course"}:${initialCourse?.slug ?? ""}`}
          initialCourseSlug={initialCourse?.slug ?? ""}
          courses={courses}
        />
      </div>
      <EnrollmentStatusLookup />
    </main>
  );
}
