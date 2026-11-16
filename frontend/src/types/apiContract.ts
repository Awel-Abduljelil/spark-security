export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";
export type CourseLanguage = "en" | "om" | "am";
export type CourseStatus = "draft" | "published" | "archived";
export type EnrollmentStatus = "pending" | "verified" | "rejected";
export type ReceiptType = "upload" | "link" | "manual";
export type EnrollmentReceiptMethod = "upload" | "link";

export interface Week {
  title: string;
  topics: string[];
}

export interface Instructor {
  name: string;
  role: string;
  bio: string;
  photo?: string | null;
}

export interface CourseContent {
  outcomes: string[];
  weeks: Week[];
  requirements: string[];
  audience: string[];
  instructors: Instructor[];
}

export interface HealthResponse {
  ok: true;
}

export interface CourseNextCohort {
  startDate: string;
  label: string | null;
  priceEtb: number | null;
  seatsLeft: number;
  totalSeats: number;
  schedule: string | null;
}

export interface ApiCourseCard {
  slug: string;
  title: string;
  level: CourseLevel;
  duration: string;
  sessions: number;
  labs: number;
  language: CourseLanguage;
  tag: string | null;
  description: string;
  skills: string[];
  nextCohort: CourseNextCohort | null;
}

export type CoursesResponse = ApiCourseCard[];

export interface ApiCourseDetail {
  slug: string;
  title: string;
  level: CourseLevel;
  duration: string;
  sessions: number;
  labs: number;
  tag: string | null;
  description: string;
  skills: string[];
  nextCohort: CourseNextCohort | null;
  cover: string | null;
  content: CourseContent;
  platform: string | null;
  cohortsPerYear: number | null;
  language: CourseLanguage;
}

export interface Cohort {
  id: number;
  courseSlug: string;
  startDate: string;
  totalSeats: number;
  seatsLeft: number;
  priceEtb: number | null;
  schedule: string | null;
  label: string | null;
}

export interface EnrollmentRequest {
  fullName: string;
  email: string;
  phone: string;
  telegram: string;
  courseSlug: string;
  receiptType: EnrollmentReceiptMethod;
  receiptLink?: string;
  agreedToTerms: boolean;
}

export interface EnrollmentResponse {
  id: number;
  ref: string;
  course: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
}

export interface PublicErrorResponse {
  error: string;
}

export interface AdminValidationIssue {
  path: string;
  message: string;
}

export interface AdminErrorResponse {
  message: string;
  issues?: AdminValidationIssue[];
}

export interface AdminOkResponse {
  ok: true;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
  code?: string;
}

export interface AdminCohortSummary {
  id: number;
  courseSlug: string;
  startDate: string;
  totalSeats: number;
  verified: number;
  seatsLeft: number;
}

export interface AdminCohort {
  id: number;
  courseSlug: string;
  label: string | null;
  startDate: string;
  totalSeats: number;
  priceEtb: number | null;
  schedule: string | null;
  isOpen: boolean;
  counts: {
    pending: number;
    verified: number;
    rejected: number;
  };
  seatsLeft: number;
}

export interface AdminCohortInput {
  courseSlug: string;
  label?: string;
  startDate: string;
  totalSeats: number;
  priceEtb: number;
  schedule: string;
  isOpen?: boolean;
}

export interface AdminCohortUpdate {
  courseSlug?: string;
  label?: string | null;
  startDate?: string;
  totalSeats?: number;
  priceEtb?: number | null;
  schedule?: string | null;
  isOpen?: boolean;
}

export interface AdminCohortFilters {
  courseSlug?: string;
  isOpen?: boolean;
}

export interface ManualEnrollmentInput {
  cohortId: number;
  fullName: string;
  email: string;
  phone: string;
  telegram: string;
  status: "pending" | "verified";
  adminNote?: string;
}

export interface AdminSummary {
  pending: number;
  verified: number;
  rejected: number;
  cohorts: AdminCohortSummary[];
}

export type AdminCourseStatus = CourseStatus;
export type AdminCourseLevel = CourseLevel;
export type AdminCourseContent = CourseContent;

export interface AdminCourseListItem {
  slug: string;
  title: string;
  level: AdminCourseLevel;
  language: CourseLanguage;
  status: AdminCourseStatus;
  sortOrder: number;
  updatedAt: string;
  cohortCount: number;
  enrollmentCount: number;
}

export interface AdminCourse
  extends Omit<AdminCourseListItem, "cohortCount" | "enrollmentCount"> {
  duration: string;
  sessions: number;
  labs: number;
  tag: string | null;
  description: string;
  cover: string | null;
  skills: string[];
  content: AdminCourseContent;
  platform: string | null;
  cohortsPerYear: number | null;
  createdAt: string;
}

export interface AdminCourseInput {
  slug: string;
  status?: AdminCourseStatus;
  sortOrder: number;
  title: string;
  level: AdminCourseLevel;
  duration: string;
  sessions: number;
  labs: number;
  tag?: string;
  description: string;
  cover?: string | null;
  skills: string[];
  content: AdminCourseContent;
  platform?: string | null;
  language: CourseLanguage;
  cohortsPerYear?: number | null;
}

export type AdminCourseUpdate = Omit<
  Partial<Omit<AdminCourseInput, "slug">>,
  "tag"
> & { tag?: string | null };

export interface AdminEnrollment {
  id: number;
  cohortId: number;
  courseSlug: string;
  startDate: string;
  totalSeats: number;
  isOpen: boolean;
  fullName: string;
  email: string;
  phone: string;
  telegram: string;
  receiptType: ReceiptType;
  receiptRef: string | null;
  status: EnrollmentStatus;
  createdAt: string;
  rejectionReason: string | null;
  adminNote: string | null;
  accessNote: string | null;
  telegramInvited: boolean;
  reviewedAt: string | null;
  possibleDuplicate: boolean;
  createdByAdmin: boolean;
}

export interface EnrollmentFilters {
  status?: EnrollmentStatus;
  courseSlug?: string;
  cohortId?: number;
  q?: string;
  page?: number;
}

export interface EnrollmentPage {
  items: AdminEnrollment[];
  total: number;
  page: number;
  pageCount: number;
}

export interface EnrollmentUpdate {
  status?: EnrollmentStatus;
  rejectionReason?: string | null;
  adminNote?: string | null;
  accessNote?: string | null;
  telegramInvited?: boolean;
}

export interface BulkVerifyRequest {
  ids: number[];
}

export interface BulkVerifyResult {
  verified: number[];
  skipped: Array<{ id: number; reason: string }>;
}

export interface MoveEnrollmentRequest {
  cohortId: number;
}
