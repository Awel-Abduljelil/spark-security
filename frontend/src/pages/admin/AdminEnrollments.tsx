import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminSummary } from "../../components/admin/AdminSummary";
import { EnrollmentDetailDialog } from "../../components/admin/EnrollmentDetailDialog";
import { ManualEnrollmentDialog } from "../../components/admin/ManualEnrollmentDialog";
import {
  bulkVerify,
  exportCsv,
  getSummary,
  listCohorts,
  listCourses,
  listEnrollments,
  logout,
  type AdminCohort,
  type AdminCourseListItem,
  type AdminEnrollment,
  type AdminSummary as AdminSummaryData,
  type EnrollmentFilters,
  type EnrollmentStatus,
} from "../../lib/adminApi";

const statuses: Array<{ label: string; value: EnrollmentStatus | "all" }> = [
  { label: "Pending", value: "pending" },
  { label: "All", value: "all" },
  { label: "Verified", value: "verified" },
  { label: "Rejected", value: "rejected" },
];

function parsePage(value: string | null): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

function currentFilters(params: URLSearchParams): EnrollmentFilters {
  const statusValue = params.get("status");
  const status: EnrollmentStatus | undefined =
    statusValue === "pending" ||
    statusValue === "verified" ||
    statusValue === "rejected"
      ? statusValue
      : undefined;

  return {
    status: statusValue === "all" ? undefined : (status ?? "pending"),
    q: params.get("q") ?? undefined,
    courseSlug: params.get("courseSlug") || undefined,
    cohortId: params.get("cohortId")
      ? Number(params.get("cohortId"))
      : undefined,
    page: parsePage(params.get("page")),
  };
}

function AdminSearchField({ query }: { query: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [value, setValue] = useState(query);

  useEffect(() => {
    if (value.trim() === query) return;
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (value.trim()) next.set("q", value.trim());
      else next.delete("q");
      next.delete("page");
      setSearchParams(next, { replace: true });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query, searchParams, setSearchParams, value]);

  return (
    <label className="admin-field admin-search">
      Search
      <input
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        placeholder="Name, email, phone, Telegram"
      />
    </label>
  );
}

export function AdminEnrollments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [summary, setSummary] = useState<AdminSummaryData | null>(null);
  const [cohortOptions, setCohortOptions] = useState<AdminCohort[]>([]);
  const [courseOptions, setCourseOptions] = useState<AdminCourseListItem[]>([]);
  const [cohortOptionsLoading, setCohortOptionsLoading] = useState(true);
  const [cohortOptionsError, setCohortOptionsError] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const [items, setItems] = useState<AdminEnrollment[]>([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [loadedQuery, setLoadedQuery] = useState<string | null>(null);
  const [listError, setListError] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const filters = currentFilters(searchParams);
  const queryKey = searchParams.toString();
  const listLoading = loadedQuery !== queryKey;
  const selectedStatus = searchParams.get("status") ?? "pending";
  const canExport = Boolean(filters.courseSlug || filters.cohortId);
  const filteredCohort = cohortOptions.find(
    (cohort) => cohort.id === filters.cohortId,
  );

  useEffect(() => {
    let active = true;
    getSummary()
      .then((result) => {
        if (active) setSummary(result);
      })
      .catch((error: unknown) => {
        if (active) {
          setSummaryError(
            error instanceof Error ? error.message : "Could not load summary.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([listCohorts(), listCourses()])
      .then(([result, courseRows]) => {
        if (active) {
          setCohortOptions(result);
          setCourseOptions(courseRows);
          setCohortOptionsLoading(false);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setCohortOptionsLoading(false);
          setCohortOptionsError(
            error instanceof Error ? error.message : "Could not load cohorts.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    listEnrollments(currentFilters(searchParams))
      .then((result) => {
        if (!active) return;
        setItems(result.items);
        setTotal(result.total);
        setPageCount(result.pageCount);
        setListError("");
      })
      .catch((error: unknown) => {
        if (active) {
          setItems([]);
          setTotal(0);
          setPageCount(0);
          setListError(
            error instanceof Error
              ? error.message
              : "Could not load enrollments.",
          );
        }
      })
      .finally(() => {
        if (active) setLoadedQuery(queryKey);
      });
    return () => {
      active = false;
    };
  }, [queryKey, searchParams]);

  function updateFilter(
    key: "status" | "courseSlug" | "cohortId" | "page",
    value: string,
  ) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
    setSelectedIds([]);
  }

  async function refreshData() {
    try {
      const [summaryResult, enrollmentResult] = await Promise.all([
        getSummary(),
        listEnrollments(currentFilters(searchParams)),
      ]);
      const courseRows = await listCourses();
      setSummary(summaryResult);
      setCohortOptions(await listCohorts());
      setCourseOptions(courseRows);
      setItems(enrollmentResult.items);
      setTotal(enrollmentResult.total);
      setPageCount(enrollmentResult.pageCount);
      setListError("");
      setSummaryError("");
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Could not refresh enrollment data.",
      );
    }
  }

  async function handleBulkVerify() {
    if (!selectedIds.length) return;
    setBulkLoading(true);
    setActionError("");
    setBulkMessage("");
    try {
      const result = await bulkVerify(selectedIds);
      const skipped = result.skipped
        .map((item) => `#${item.id}: ${item.reason.replaceAll("_", " ")}`)
        .join("; ");
      setBulkMessage(
        `${result.verified.length} verified.${skipped ? ` Skipped: ${skipped}` : ""}`,
      );
      setSelectedIds([]);
      await refreshData();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Bulk verification failed.",
      );
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleExport() {
    setExportLoading(true);
    setActionError("");
    try {
      await exportCsv(filters);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "CSV export failed.",
      );
    } finally {
      setExportLoading(false);
    }
  }

  async function handleLogout() {
    setLogoutLoading(true);
    try {
      await logout();
      window.location.assign("/admin/login");
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not sign out.",
      );
      setLogoutLoading(false);
    }
  }

  function toggleSelected(id: number) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <div className="admin-heading">
          <p className="admin-eyebrow">Spark Academy</p>
          <h1>Enrollments</h1>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            disabled={cohortOptionsLoading || Boolean(cohortOptionsError)}
            onClick={() => setManualDialogOpen(true)}
          >
            {cohortOptionsLoading ? "Loading cohorts..." : "Add student"}
          </button>
          <button
            className="invert"
            type="button"
            disabled={logoutLoading}
            onClick={() => void handleLogout()}
          >
            {logoutLoading ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </header>

      {summaryError && (
        <p className="admin-error" role="alert">
          {summaryError}
        </p>
      )}
      {summary ? (
        <AdminSummary summary={summary} courses={courseOptions} />
      ) : !summaryError ? (
        <p role="status">Loading summary...</p>
      ) : null}

      <section className="admin-panel" aria-label="Enrollment filters">
        <div className="admin-filter-row">
          <div
            className="admin-tabs"
            role="tablist"
            aria-label="Enrollment status"
          >
            {statuses.map((status) => (
              <button
                key={status.value}
                type="button"
                role="tab"
                aria-selected={selectedStatus === status.value}
                className={selectedStatus === status.value ? "" : "invert"}
                onClick={() => updateFilter("status", status.value)}
              >
                {status.label}
              </button>
            ))}
          </div>
          <label className="admin-field">
            Course
            <select
              value={filters.courseSlug ?? ""}
              onChange={(event) =>
                updateFilter("courseSlug", event.currentTarget.value)
              }
            >
              <option value="">All courses</option>
              {courseOptions.map((course) => (
                <option value={course.slug} key={course.slug}>
                  {course.title} ({course.slug})
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            Cohort
            <select
              value={filters.cohortId ?? ""}
              onChange={(event) =>
                updateFilter("cohortId", event.currentTarget.value)
              }
            >
              <option value="">All cohorts</option>
              {cohortOptions.map((cohort) => (
                <option value={cohort.id} key={cohort.id}>
                  {courseOptions.find((course) => course.slug === cohort.courseSlug)?.title ?? cohort.courseSlug} ({cohort.courseSlug}) / {cohort.label || cohort.startDate}
                </option>
              ))}
            </select>
          </label>
          <AdminSearchField
            key={searchParams.get("q") ?? ""}
            query={searchParams.get("q") ?? ""}
          />
          <button
            type="button"
            className="invert"
            disabled={!canExport || exportLoading}
            onClick={() => void handleExport()}
          >
            {exportLoading ? "Exporting..." : "Export CSV"}
          </button>
        </div>
        {cohortOptionsError && (
          <p className="admin-error" role="alert">
            {cohortOptionsError}
          </p>
        )}
        {filters.cohortId !== undefined && (
          <p className="admin-cohort-filter" role="status">
            Showing cohort{" "}
            {filteredCohort
              ? `${courseOptions.find((course) => course.slug === filteredCohort.courseSlug)?.title ?? filteredCohort.courseSlug} (${filteredCohort.courseSlug}) / ${filteredCohort.label || filteredCohort.startDate}`
              : filters.cohortId}
            <button
              className="invert"
              type="button"
              onClick={() => updateFilter("cohortId", "")}
            >
              Clear cohort filter
            </button>
          </p>
        )}
      </section>

      {selectedStatus === "pending" && (
        <div className="admin-bulk-bar">
          <button
            type="button"
            disabled={!selectedIds.length || bulkLoading}
            onClick={() => void handleBulkVerify()}
          >
            {bulkLoading
              ? "Verifying..."
              : `Verify selected (${selectedIds.length})`}
          </button>
          {bulkMessage && <p role="status">{bulkMessage}</p>}
        </div>
      )}
      {actionError && (
        <p className="admin-error" role="alert">
          {actionError}
        </p>
      )}
      {listError && (
        <p className="admin-error" role="alert">
          {listError}
        </p>
      )}
      {listLoading ? (
        <p className="admin-loading" role="status">
          Loading enrollments...
        </p>
      ) : listError ? null : items.length === 0 ? (
        <p className="admin-empty">No enrollments match these filters.</p>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Phone</th>
                  <th>Telegram</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Review flags</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    tabIndex={0}
                    onClick={() => setSelectedId(item.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") setSelectedId(item.id);
                    }}
                  >
                    <td onClick={(event) => event.stopPropagation()}>
                      {selectedStatus === "pending" &&
                        item.status === "pending" && (
                          <input
                            type="checkbox"
                            aria-label={`Select ${item.fullName}`}
                            checked={selectedIds.includes(item.id)}
                            onChange={() => toggleSelected(item.id)}
                          />
                        )}
                    </td>
                    <td data-label="Name">
                      {item.fullName}
                      <small>{item.email}</small>
                      {item.createdByAdmin && (
                        <span className="admin-badge admin-badge--manual">
                          Manual
                        </span>
                      )}
                    </td>
                    <td data-label="Course">{courseOptions.find((course) => course.slug === item.courseSlug)?.title ?? item.courseSlug} ({item.courseSlug})</td>
                    <td data-label="Phone">{item.phone}</td>
                    <td data-label="Telegram">{item.telegram}</td>
                    <td data-label="Submitted">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td data-label="Status">
                      <span
                        className={`admin-badge admin-badge--${item.status}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td data-label="Review flags">
                      {item.possibleDuplicate && (
                        <span className="admin-badge admin-badge--warning">
                          Possible duplicate
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="admin-pagination">
            <span>{total} enrollments</span>
            <div>
              <button
                type="button"
                className="invert"
                disabled={(filters.page ?? 1) <= 1}
                onClick={() =>
                  updateFilter(
                    "page",
                    String(Math.max(1, (filters.page ?? 1) - 1)),
                  )
                }
              >
                Previous
              </button>
              <span>
                Page {filters.page ?? 1} of {Math.max(1, pageCount)}
              </span>
              <button
                type="button"
                className="invert"
                disabled={(filters.page ?? 1) >= pageCount}
                onClick={() =>
                  updateFilter("page", String((filters.page ?? 1) + 1))
                }
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
      <EnrollmentDetailDialog
        enrollmentId={selectedId}
        courses={courseOptions}
        onClose={() => setSelectedId(null)}
        onUpdated={() => void refreshData()}
      />
      {manualDialogOpen && (
        <ManualEnrollmentDialog
          cohorts={cohortOptions}
          courses={courseOptions}
          onClose={() => setManualDialogOpen(false)}
          onCreated={() => {
            setManualDialogOpen(false);
            void refreshData();
          }}
        />
      )}
    </main>
  );
}
