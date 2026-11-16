import { Link, useParams } from "react-router-dom";
import { CourseAudience } from "../components/course/CourseAudience";
import { CourseEnrollmentCard } from "../components/course/CourseEnrollmentCard";
import { CourseFormat } from "../components/course/CourseFormat";
import { CourseHeader } from "../components/course/CourseHeader";
import { CourseInstructors } from "../components/course/CourseInstructors";
import { CourseSyllabus } from "../components/course/CourseSyllabus";
import { LearningOutcomes } from "../components/course/LearningOutcomes";
import { RelatedCourses } from "../components/course/RelatedCourses";
import { EthicsNote } from "../components/home/EthicsNote";
import { Faq } from "../components/home/Faq";
import { courseFaqs } from "../data/courseFaqs";
import { useCourse } from "../hooks/useCourse";
import { useCohort } from "../hooks/useCohort";
import { useLanguage } from "../i18n/useLanguage";
import "./CourseDetail.css";

export function CourseDetail() {
  const { t } = useLanguage();
  const { slug } = useParams();
  const { data: course, status: courseStatus } = useCourse(slug ?? "");
  const { cohort, status: cohortStatus } = useCohort(course?.slug ?? "");
  const activeCohort = cohortStatus === "ready" ? cohort : null;
  const displayCourse = course
    ? activeCohort
      ? {
          ...course,
          startDate: activeCohort.startDate,
          totalSeats: activeCohort.totalSeats,
          seatsLeft: activeCohort.seatsLeft,
          ...(activeCohort.priceEtb !== null
            ? { priceEtb: activeCohort.priceEtb }
            : {}),
          schedule: activeCohort.schedule ?? course.schedule,
        }
      : course
    : null;

  if (!displayCourse && courseStatus === "loading") {
    return (
      <main className="course-not-found">
        <h1>{t("Loading course...")}</h1>
      </main>
    );
  }

  if (!displayCourse && courseStatus === "error") {
    return (
      <main className="course-not-found">
        <h1>{t("Course temporarily unavailable")}</h1>
        <p>{t("We could not load this course right now. Please try again later.")}</p>
        <Link to="/#courses">{t("Browse courses")}</Link>
      </main>
    );
  }

  if (!displayCourse) {
    return (
      <main className="course-not-found">
        <h1>{t("Course not found")}</h1>
        <Link to="/#courses">{t("Browse courses")}</Link>
      </main>
    );
  }

  return (
    <main className="course-detail">
      <CourseHeader course={displayCourse} cohortStatus={cohortStatus} />
      <div className="course-detail__layout">
        <div className="course-detail__sections">
          <LearningOutcomes outcomes={displayCourse.outcomes} />
          <CourseFormat course={displayCourse} />
          <CourseSyllabus weeks={displayCourse.weeks} />
          <CourseAudience
            audience={displayCourse.audience}
            requirements={displayCourse.requirements}
          />
          <CourseInstructors instructors={displayCourse.instructors} />
          <EthicsNote />
          <Faq items={courseFaqs} />
        </div>
        <CourseEnrollmentCard
          course={displayCourse}
          cohortStatus={cohortStatus}
        />
        <RelatedCourses currentSlug={displayCourse.slug} />
      </div>
    </main>
  );
}
