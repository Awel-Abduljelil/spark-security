import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CohortDialog } from "../../components/admin/CohortDialog";
import {
  deleteCohort,
  exportCsv,
  listCourses,
  listCohorts,
  updateCohort,
  type AdminCohort,
  type AdminCourseListItem,
} from "../../lib/adminApi";

export function AdminCohorts() {
  const [cohorts, setCohorts] = useState<AdminCohort[] | null>(null);
  const [courseOptions, setCourseOptions] = useState<AdminCourseListItem[]>([]);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [exportingId, setExportingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState<AdminCohort | null>(null);

  async function loadCohorts() {
    setError("");
    try {
      const [cohortRows, courseRows] = await Promise.all([
        listCohorts(),
        listCourses(),
      ]);
      setCohorts(cohortRows);
      setCourseOptions(courseRows);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not load cohorts.",
      );
    }
  }

  useEffect(() => {
    let active = true;
    Promise.all([listCohorts(), listCourses()])
      .then(([cohortRows, courseRows]) => {
        if (active) {
          setCohorts(cohortRows);
          setCourseOptions(courseRows);
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not load cohorts.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  async function toggleOpen(cohort: AdminCohort) {
    setBusyId(cohort.id);
    setActionError("");
    try {
      await updateCohort(cohort.id, { isOpen: !cohort.isOpen });
      await loadCohorts();
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Could not update cohort status.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function removeCohort(cohort: AdminCohort) {
    if (
      !window.confirm(`Delete the ${cohort.label || cohort.startDate} cohort?`)
    ) {
      return;
    }
    setBusyId(cohort.id);
    setActionError("");
    try {
      await deleteCohort(cohort.id);
      await loadCohorts();
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Could not delete cohort.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleExport(cohortId: number) {
    setExportingId(cohortId);
    setActionError("");
    try {
      await exportCsv({ cohortId });
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Could not export this cohort.",
      );
    } finally {
      setExportingId(null);
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <div className="admin-heading">
          <p className="admin-eyebrow">Spark Academy</p>
          <h1>Cohorts</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingCohort(null);
            setDialogOpen(true);
          }}
        >
          Create cohort
        </button>
      </header>

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
      {actionError && (
        <p className="admin-error" role="alert">
          {actionError}
        </p>
      )}
      {cohorts === null && !error ? (
        <p className="admin-loading" role="status">
          Loading cohorts...
        </p>
      ) : cohorts?.length === 0 ? (
        <p className="admin-empty">No cohorts yet.</p>
      ) : (
        cohorts && (
          <div className="admin-table-wrap">
            <table className="admin-table admin-cohorts-table">
              <thead>
                <tr>
                  <th>Cohort</th>
                  <th>Course</th>
                  <th>Price</th>
                  <th>Schedule</th>
                  <th>Seats</th>
                  <th>Pending</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort) => {
                  const course = courseOptions.find((item) => item.slug === cohort.courseSlug);
                  const enrollmentCount =
                    cohort.counts.pending +
                    cohort.counts.verified +
                    cohort.counts.rejected;
                  return (
                    <tr key={cohort.id}>
                      <td data-label="Cohort">
                        <strong>{cohort.label || cohort.startDate}</strong>
                        {cohort.label && <small>{cohort.startDate}</small>}
                      </td>
                      <td data-label="Course">{course?.title ?? cohort.courseSlug} ({cohort.courseSlug})</td>
                      <td data-label="Price">
                        {cohort.priceEtb !== null
                          ? `ETB ${cohort.priceEtb.toLocaleString("en-US")}`
                          : "Course default"}
                      </td>
                      <td data-label="Schedule">
                        {cohort.schedule ?? "Course default"}
                      </td>
                      <td data-label="Seats">
                        {cohort.counts.verified} / {cohort.totalSeats === 0 ? "Unlimited" : cohort.totalSeats}
                      </td>
                      <td data-label="Pending">{cohort.counts.pending}</td>
                      <td data-label="Status">
                        <span
                          className={`admin-badge ${cohort.isOpen ? "admin-badge--verified" : "admin-badge--rejected"}`}
                        >
                          {cohort.isOpen ? "Open" : "Closed"}
                        </span>
                      </td>
                      <td data-label="Actions">
                        <div className="admin-row-actions">
                          <button
                            className="invert"
                            type="button"
                            disabled={busyId === cohort.id}
                            onClick={() => {
                              setEditingCohort(cohort);
                              setDialogOpen(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="invert"
                            type="button"
                            disabled={busyId === cohort.id}
                            onClick={() => void toggleOpen(cohort)}
                          >
                            {busyId === cohort.id
                              ? "Saving..."
                              : cohort.isOpen
                                ? "Close"
                                : "Open"}
                          </button>
                          {enrollmentCount === 0 && (
                            <button
                              className="danger"
                              type="button"
                              disabled={busyId === cohort.id}
                              onClick={() => void removeCohort(cohort)}
                            >
                              Delete
                            </button>
                          )}
                          <Link
                            className="admin-link-button"
                            to={`/admin?cohortId=${cohort.id}`}
                          >
                            View enrollments
                          </Link>
                          <button
                            className="invert"
                            type="button"
                            disabled={exportingId === cohort.id}
                            onClick={() => void handleExport(cohort.id)}
                          >
                            {exportingId === cohort.id
                              ? "Exporting..."
                              : "Export CSV"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {dialogOpen && (
        <CohortDialog
          key={editingCohort?.id ?? "new-cohort"}
          cohort={editingCohort}
          courses={courseOptions}
          onClose={() => setDialogOpen(false)}
          onSaved={() => {
            setDialogOpen(false);
            void loadCohorts();
          }}
        />
      )}
    </main>
  );
}
