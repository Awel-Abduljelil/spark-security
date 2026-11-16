export interface CachedEnrollmentStatus {
  ref: string;
  course: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
}

const cacheKey = "spark-enrollment-status";
const cacheDurationMs = 24 * 60 * 60 * 1000;

function isCachedStatus(value: unknown): value is CachedEnrollmentStatus {
  if (typeof value !== "object" || value === null) return false;
  return (
    "ref" in value &&
    typeof value.ref === "string" &&
    "course" in value &&
    typeof value.course === "string" &&
    "amount" in value &&
    typeof value.amount === "number" &&
    Number.isFinite(value.amount) &&
    "status" in value &&
    (value.status === "pending" ||
      value.status === "approved" ||
      value.status === "rejected") &&
    "createdAt" in value &&
    typeof value.createdAt === "number" &&
    Number.isFinite(value.createdAt)
  );
}

export function readEnrollmentStatusCache(): {
  status: CachedEnrollmentStatus | null;
  unavailable: boolean;
} {
  try {
    const raw = window.localStorage.getItem(cacheKey);
    if (!raw) return { status: null, unavailable: false };

    const parsed: unknown = JSON.parse(raw);
    if (!isCachedStatus(parsed)) {
      window.localStorage.removeItem(cacheKey);
      return { status: null, unavailable: false };
    }

    if (Date.now() - parsed.createdAt >= cacheDurationMs) {
      window.localStorage.removeItem(cacheKey);
      return { status: null, unavailable: false };
    }

    return { status: parsed, unavailable: false };
  } catch {
    return { status: null, unavailable: true };
  }
}

export function saveEnrollmentStatusCache(
  status: CachedEnrollmentStatus,
): boolean {
  try {
    window.localStorage.setItem(cacheKey, JSON.stringify(status));
    return true;
  } catch {
    return false;
  }
}
