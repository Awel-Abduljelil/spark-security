import type { ApiCourseCard, ApiCourseDetail } from "./api";
import type { Course, CourseWithDetail } from "../types/course";

export function mapApiCourseCard(course: ApiCourseCard): Course {
  const price = course.nextCohort
    ? course.nextCohort.priceEtb !== null
      ? `${course.nextCohort.priceEtb.toLocaleString("en-US")} ETB`
      : "Price unavailable"
    : "Registration closed";

  return {
    slug: course.slug,
    title: course.title,
    level: course.level,
    language: course.language,
    duration: course.duration,
    sessions: course.sessions,
    labs: course.labs,
    price,
    ...(course.cover ? { cover: course.cover } : {}),
    ...(course.priceEtb !== undefined ? { priceEtb: course.priceEtb } : {}),
    ...(course.discountPriceEtb !== undefined
      ? { discountPriceEtb: course.discountPriceEtb }
      : {}),
    enrollmentOpen: course.enrollmentOpen ?? Boolean(course.nextCohort),
    ...(course.tag ? { tag: course.tag } : {}),
    description: course.description,
    skills: course.skills,
  };
}

export function mapApiCourseDetail(course: ApiCourseDetail): CourseWithDetail {
  const cohort = course.nextCohort;
  return {
    slug: course.slug,
    title: course.title,
    level: course.level,
    language: course.language,
    duration: course.duration,
    sessions: course.sessions,
    labs: course.labs,
    price: cohort
      ? cohort.priceEtb !== null
        ? `${cohort.priceEtb.toLocaleString("en-US")} ETB`
        : "Price unavailable"
      : "Registration closed",
    ...(course.tag ? { tag: course.tag } : {}),
    description: course.description,
    ...(course.cover ? { cover: course.cover } : {}),
    skills: course.skills,
    ...(course.platform !== null ? { platform: course.platform } : {}),
    ...(course.cohortsPerYear !== null
      ? { cohortsPerYear: course.cohortsPerYear }
      : {}),
    outcomes: course.content.outcomes,
    weeks: course.content.weeks,
    requirements: course.content.requirements,
    audience: course.content.audience,
    instructors: course.content.instructors,
    startDate: cohort?.startDate ?? "",
    totalSeats: cohort?.totalSeats ?? 0,
    seatsLeft: cohort?.seatsLeft ?? 0,
    ...(cohort?.priceEtb !== null && cohort?.priceEtb !== undefined
      ? { priceEtb: cohort.priceEtb }
      : {}),
    schedule: cohort?.schedule ?? "",
  };
}