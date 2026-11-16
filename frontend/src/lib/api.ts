import axios from "axios";
import type {
  ApiCourseDetail,
  Cohort,
  CourseLanguage,
  CoursesResponse,
  EnrollmentResponse,
} from "../types/apiContract";

export type {
  ApiCourseCard,
  ApiCourseDetail,
  Cohort,
  CourseLanguage,
  EnrollmentResponse,
} from "../types/apiContract";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface EnrollmentStatusResponse {
  ref: string;
  course: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
  reason?: string;
  instructions?: string;
  telegramInvited?: boolean;
}

const apiBaseUrl =
  import.meta.env.MODE === "test"
    ? (import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ?? "")
    : "";

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: false,
});

function toApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return new ApiError(0, "The request could not be completed.");
  }

  let message = "The request could not be completed.";
  const body: unknown = error.response?.data;

  if (typeof body === "object" && body !== null) {
    if ("message" in body && typeof body.message === "string") {
      message = body.message;
    } else if ("error" in body && typeof body.error === "string") {
      message = body.error;
    }
  }

  return new ApiError(error.response?.status ?? 0, message);
}

async function request<T>(operation: () => Promise<{ data: T }>): Promise<T> {
  try {
    return (await operation()).data;
  } catch (error) {
    throw toApiError(error);
  }
}

export function getCohort(slug: string, signal?: AbortSignal): Promise<Cohort> {
  return request(() =>
    api.get<Cohort>(`/api/app/cohorts/${encodeURIComponent(slug)}`, { signal }),
  );
}

export function submitEnrollment(
  formData: FormData,
): Promise<EnrollmentResponse> {
  return request(() => api.post<EnrollmentResponse>("/api/enroll", formData));
}

export function lookupEnrollmentStatus(
  ref: string,
  phone: string,
): Promise<EnrollmentStatusResponse> {
  return request(() =>
    api.post<EnrollmentStatusResponse>("/api/enroll/status", { ref, phone }),
  );
}

export function getCourses(
  signal?: AbortSignal,
  language?: CourseLanguage,
): Promise<CoursesResponse> {
  return request(() =>
    api.get<CoursesResponse>("/api/app/courses", {
      signal,
      ...(language ? { params: { lang: language } } : {}),
    }),
  );
}

export function getCourse(
  slug: string,
  signal?: AbortSignal,
): Promise<ApiCourseDetail> {
  return request(() =>
    api.get<ApiCourseDetail>(`/api/app/courses/${encodeURIComponent(slug)}`, {
      signal,
    }),
  );
}

export interface PaymentMethod {
  type: string;
  bank: string | null;
  holder: string | null;
  number: string | null;
  notes: string | null;
}

export interface PaymentMethodsResponse {
  methods: PaymentMethod[];
  reference: string;
}

export interface AppSiteResponse {
  settings: Record<string, string>;
  mentors: Array<{
    id: number;
    name: string;
    role: string;
    bio: string;
    specialties: string[];
    achievements: string[];
    photo: string | null;
    linkedin: string | null;
    github: string | null;
  }>;
  faqs: Array<{ question: string; answer: string }>;
}

export function getAppSite(signal?: AbortSignal): Promise<AppSiteResponse> {
  return request(() => api.get<AppSiteResponse>("/api/app/site", { signal }));
}

export function getPaymentMethods(
  signal?: AbortSignal,
): Promise<PaymentMethodsResponse> {
  return request(() =>
    api.get<PaymentMethodsResponse>("/api/payment-methods", { signal }),
  );
}

export function submitContact(form: {
  name: string;
  email: string;
  message: string;
}): Promise<{ ok: true }> {
  return request(() => api.post<{ ok: true }>("/api/contact", form));
}
