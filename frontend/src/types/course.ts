import type { CourseLanguage, CourseLevel, Instructor, Week } from "./apiContract";

export type {
  CourseContent,
  CourseLevel,
  CourseLanguage,
  Instructor,
  Week,
} from "./apiContract";

export interface Course {
  slug: string;
  title: string;
  level: CourseLevel;
  language: CourseLanguage;
  duration: string;
  sessions: number;
  labs: number;
  price: string;
  priceEtb?: number;
  discountPriceEtb?: number | null;
  enrollmentOpen?: boolean;
  cover?: string | null;
  tag?: string;
  description: string;
  skills?: string[];
}

export interface CourseDetail {
  slug: string;
  outcomes: string[];
  startDate: string;
  totalSeats: number;
  seatsLeft: number;
  priceEtb?: number;
  cover?: string;
  schedule: string;
  platform?: string;
  cohortsPerYear?: number;
  weeks: Week[];
  requirements: string[];
  audience: string[];
  instructors: Instructor[];
}

export type CourseWithDetail = Course & CourseDetail;
