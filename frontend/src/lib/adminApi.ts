import { adminUrl } from "./adminPath";
import axios from "axios";
import type {
  AdminCohort,
  AdminCohortFilters,
  AdminCohortInput,
  AdminCohortUpdate,
  AdminCourse,
  AdminCourseInput,
  AdminCourseListItem,
  AdminCourseUpdate,
  AdminEnrollment,
  AdminLoginRequest,
  AdminOkResponse,
  AdminSummary,
  AdminValidationIssue,
  BulkVerifyRequest,
  BulkVerifyResult,
  EnrollmentFilters,
  EnrollmentPage,
  EnrollmentUpdate,
  ManualEnrollmentInput,
  MoveEnrollmentRequest,
} from "../types/apiContract";

export type {
  AdminCohort,
  AdminCohortFilters,
  AdminCohortInput,
  AdminCohortSummary,
  AdminCohortUpdate,
  AdminCourse,
  AdminCourseContent,
  AdminCourseInput,
  AdminCourseLevel,
  AdminCourseListItem,
  AdminCourseStatus,
  AdminCourseUpdate,
  AdminEnrollment,
  AdminErrorResponse,
  AdminLoginRequest,
  AdminOkResponse,
  AdminSummary,
  AdminValidationIssue,
  CourseLanguage,
  BulkVerifyRequest,
  BulkVerifyResult,
  EnrollmentFilters,
  EnrollmentPage,
  EnrollmentStatus,
  EnrollmentUpdate,
  ManualEnrollmentInput,
  MoveEnrollmentRequest,
} from "../types/apiContract";

export interface LegacySettings {
  [key: string]: string;
}

export interface LegacyMentor {
  id: number;
  name: string;
  role: string;
  bio: string;
  specialties: string[];
  achievements: string[];
  photo: string;
  linkedin: string;
  github: string;
  published: number;
  sort: number;
}

export interface LegacyFaq {
  id: number;
  question: string;
  answer: string;
  published: number;
  sort: number;
}

export interface LegacyPaymentMethod {
  id: number;
  type: string;
  bank: string;
  holder: string;
  number: string;
  notes: string;
  active: number;
  sort: number;
}

export interface LegacyMessage {
  id: number;
  name: string;
  email: string;
  body: string;
  read: number;
  created_at: number;
}

export interface LegacyAuditEntry {
  email: string;
  action: string;
  entity: string | null;
  detail: string | null;
  ip: string;
  created_at: number;
}

export interface LegacyAdminInfo {
  email: string;
  totp: boolean;
}

export class AdminApiError extends Error {
  readonly status: number;
  readonly issues: AdminValidationIssue[];

  constructor(
    status: number,
    message: string,
    issues: AdminValidationIssue[] = [],
  ) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.issues = issues;
  }
}

const adminApi = axios.create({
  baseURL:
    import.meta.env.MODE === "test"
      ? (import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ?? "")
      : "",
  withCredentials: true,
  headers: { "X-Requested-With": "spark" },
});

adminApi.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? "";
      if (
        !url.includes("/api/app/admin/login") &&
        !url.includes("/api/app/admin/me")
      ) {
        window.location.assign(adminUrl("/login"));
      }
    }
    return Promise.reject(error);
  },
);

function normalizedError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const body: unknown = error.response?.data;
    if (typeof body === "object" && body !== null) {
      const message =
        "message" in body && typeof body.message === "string"
          ? body.message
          : "error" in body && typeof body.error === "string"
            ? body.error
            : "The admin request failed. Please try again.";
      const issues =
        "issues" in body && Array.isArray(body.issues)
          ? body.issues.filter(
              (issue): issue is AdminValidationIssue =>
                typeof issue === "object" &&
                issue !== null &&
                "path" in issue &&
                typeof issue.path === "string" &&
                "message" in issue &&
                typeof issue.message === "string",
            )
          : [];
      return new AdminApiError(error.response?.status ?? 0, message, issues);
    }
    return new AdminApiError(
      error.response?.status ?? 0,
      "The admin request failed. Please try again.",
    );
  }
  return new AdminApiError(0, "The admin request failed. Please try again.");
}

async function request<T>(operation: () => Promise<{ data: T }>): Promise<T> {
  try {
    return (await operation()).data;
  } catch (error) {
    throw normalizedError(error);
  }
}

export function login(
  email: string,
  password: string,
  code?: string,
): Promise<AdminOkResponse> {
  const body: AdminLoginRequest = { email, password, ...(code ? { code } : {}) };
  return request(() =>
    adminApi.post<AdminOkResponse>("/api/app/admin/login", body),
  );
}

export function logout(): Promise<AdminOkResponse> {
  return request(() =>
    adminApi.post<AdminOkResponse>("/api/app/admin/logout"),
  );
}

export function me(): Promise<AdminOkResponse> {
  return request(() => adminApi.get<AdminOkResponse>("/api/app/admin/me"));
}

export function getLegacyAdminInfo(): Promise<LegacyAdminInfo> {
  return request(() => adminApi.get<LegacyAdminInfo>("/api/admin/me"));
}

export function getLegacySettings(): Promise<LegacySettings> {
  return request(() => adminApi.get<LegacySettings>("/api/admin/settings"));
}

export function updateLegacySettings(settings: LegacySettings): Promise<AdminOkResponse> {
  return request(() => adminApi.put<AdminOkResponse>("/api/admin/settings", settings));
}

export function listMentors(): Promise<LegacyMentor[]> {
  return request(() => adminApi.get<LegacyMentor[]>("/api/admin/mentors"));
}

export function saveMentor(id: number | null, input: Omit<LegacyMentor, "id">): Promise<LegacyMentor> {
  return request(() => id === null
    ? adminApi.post<LegacyMentor>("/api/admin/mentors", input)
    : adminApi.put<LegacyMentor>(`/api/admin/mentors/${id}`, input));
}

export function deleteMentor(id: number): Promise<AdminOkResponse> {
  return request(() => adminApi.delete<AdminOkResponse>(`/api/admin/mentors/${id}`));
}

export function listFaqs(): Promise<LegacyFaq[]> {
  return request(() => adminApi.get<LegacyFaq[]>("/api/admin/faqs"));
}

export function saveFaq(id: number | null, input: Omit<LegacyFaq, "id">): Promise<LegacyFaq> {
  return request(() => id === null
    ? adminApi.post<LegacyFaq>("/api/admin/faqs", input)
    : adminApi.put<LegacyFaq>(`/api/admin/faqs/${id}`, input));
}

export function deleteFaq(id: number): Promise<AdminOkResponse> {
  return request(() => adminApi.delete<AdminOkResponse>(`/api/admin/faqs/${id}`));
}

export function listPaymentMethods(): Promise<LegacyPaymentMethod[]> {
  return request(() => adminApi.get<LegacyPaymentMethod[]>("/api/admin/payment-methods"));
}

export function savePaymentMethod(id: number | null, input: Omit<LegacyPaymentMethod, "id">): Promise<LegacyPaymentMethod> {
  return request(() => id === null
    ? adminApi.post<LegacyPaymentMethod>("/api/admin/payment-methods", input)
    : adminApi.put<LegacyPaymentMethod>(`/api/admin/payment-methods/${id}`, input));
}

export function deletePaymentMethod(id: number): Promise<AdminOkResponse> {
  return request(() => adminApi.delete<AdminOkResponse>(`/api/admin/payment-methods/${id}`));
}

export function listMessages(): Promise<LegacyMessage[]> {
  return request(() => adminApi.get<LegacyMessage[]>("/api/admin/messages"));
}

export function markMessageRead(id: number): Promise<AdminOkResponse> {
  return request(() => adminApi.put<AdminOkResponse>(`/api/admin/messages/${id}/read`));
}

export function deleteMessage(id: number): Promise<AdminOkResponse> {
  return request(() => adminApi.delete<AdminOkResponse>(`/api/admin/messages/${id}`));
}

export function listAuditEntries(): Promise<LegacyAuditEntry[]> {
  return request(() => adminApi.get<LegacyAuditEntry[]>("/api/admin/audit"));
}

export function changeAdminPassword(input: { current: string; next: string; confirm: string }): Promise<AdminOkResponse> {
  return request(() => adminApi.post<AdminOkResponse>("/api/admin/password", input));
}

export interface TotpSetup {
  secret: string;
  uri: string;
}

export function setupAdminTotp(): Promise<TotpSetup> {
  return request(() => adminApi.post<TotpSetup>("/api/admin/2fa/setup"));
}

export function enableAdminTotp(code: string): Promise<AdminOkResponse> {
  return request(() => adminApi.post<AdminOkResponse>("/api/admin/2fa/enable", { code }));
}

export function disableAdminTotp(password: string): Promise<AdminOkResponse> {
  return request(() => adminApi.post<AdminOkResponse>("/api/admin/2fa/disable", { password }));
}

export function getSummary(): Promise<AdminSummary> {
  return request(() => adminApi.get<AdminSummary>("/api/app/admin/summary"));
}

export function listCourses(): Promise<AdminCourseListItem[]> {
  return request(() =>
    adminApi.get<AdminCourseListItem[]>("/api/app/admin/courses"),
  );
}

export function getCourse(slug: string): Promise<AdminCourse> {
  return request(() =>
    adminApi.get<AdminCourse>(`/api/app/admin/courses/${encodeURIComponent(slug)}`),
  );
}

export function createCourse(course: AdminCourseInput): Promise<AdminCourse> {
  return request(() => adminApi.post<AdminCourse>("/api/app/admin/courses", course));
}

export function updateCourse(
  slug: string,
  changes: AdminCourseUpdate,
): Promise<AdminCourse> {
  return request(() =>
    adminApi.patch<AdminCourse>(
      `/api/app/admin/courses/${encodeURIComponent(slug)}`,
      changes,
    ),
  );
}

export function uploadImage(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  return request(() => adminApi.post<{ url: string }>("/api/admin/upload", form));
}

export function deleteCourse(slug: string): Promise<void> {
  return request(() =>
    adminApi.delete<void>(`/api/app/admin/courses/${encodeURIComponent(slug)}`),
  );
}

export function listCohorts(
  filters: AdminCohortFilters = {},
): Promise<AdminCohort[]> {
  return request(() =>
    adminApi.get<AdminCohort[]>("/api/app/admin/cohorts", {
      params: filters,
    }),
  );
}

export function createCohort(cohort: AdminCohortInput): Promise<AdminCohort> {
  return request(() =>
    adminApi.post<AdminCohort>("/api/app/admin/cohorts", cohort),
  );
}

export function updateCohort(
  id: number,
  changes: AdminCohortUpdate,
): Promise<AdminCohort> {
  return request(() =>
    adminApi.patch<AdminCohort>(`/api/app/admin/cohorts/${id}`, changes),
  );
}

export function deleteCohort(id: number): Promise<void> {
  return request(() => adminApi.delete<void>(`/api/app/admin/cohorts/${id}`));
}

export function listEnrollments(
  filters: EnrollmentFilters,
): Promise<EnrollmentPage> {
  return request(() =>
    adminApi.get<EnrollmentPage>("/api/app/admin/enrollments", { params: filters }),
  );
}

export function getEnrollment(id: number): Promise<AdminEnrollment> {
  return request(() =>
    adminApi.get<AdminEnrollment>(`/api/app/admin/enrollments/${id}`),
  );
}

export function updateEnrollment(
  id: number,
  update: EnrollmentUpdate,
): Promise<AdminEnrollment> {
  return request(() =>
    adminApi.patch<AdminEnrollment>(`/api/app/admin/enrollments/${id}`, update),
  );
}

export function deleteEnrollment(id: number): Promise<AdminOkResponse> {
  return request(() =>
    adminApi.delete<AdminOkResponse>(`/api/app/admin/enrollments/${id}`),
  );
}

export function bulkVerify(ids: number[]): Promise<BulkVerifyResult> {
  const body: BulkVerifyRequest = { ids };
  return request(() =>
    adminApi.post<BulkVerifyResult>("/api/app/admin/enrollments/bulk-verify", body),
  );
}

export function createEnrollment(
  enrollment: ManualEnrollmentInput,
): Promise<AdminEnrollment> {
  return request(() =>
    adminApi.post<AdminEnrollment>("/api/app/admin/enrollments", enrollment),
  );
}

export function moveEnrollment(
  id: number,
  cohortId: number,
): Promise<AdminEnrollment> {
  const body: MoveEnrollmentRequest = { cohortId };
  return request(() =>
    adminApi.post<AdminEnrollment>(`/api/app/admin/enrollments/${id}/move`, body),
  );
}

export async function exportCsv(filters: EnrollmentFilters): Promise<void> {
  try {
    const response = await adminApi.get<Blob>(
      "/api/app/admin/enrollments/export.csv",
      { params: filters, responseType: "blob" },
    );
    const objectUrl = URL.createObjectURL(response.data);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = "enrollments.csv";
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  } catch (error) {
    throw normalizedError(error);
  }
}
