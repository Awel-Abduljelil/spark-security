import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteCourse,
  listCourses,
  updateCourse,
  type AdminCourseListItem,
  type AdminCourseStatus,
  type CourseLanguage,
} from "../../lib/adminApi";

export function AdminCourses() {
  const [courses, setCourses] = useState<AdminCourseListItem[] | null>(null);
  const [error, setError] = useState("");
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [languageFilter, setLanguageFilter] = useState<CourseLanguage | "all">("all");
  const visibleCourses = courses?.filter(
    (course) => languageFilter === "all" || course.language === languageFilter,
  );

  async function loadCourses() {
    setError("");
    try {
      setCourses(await listCourses());
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not load courses.",
      );
    }
  }

  useEffect(() => {
    let active = true;
    listCourses()
      .then((result) => {
        if (active) setCourses(result);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not load courses.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  async function changeStatus(course: AdminCourseListItem, status: AdminCourseStatus) {
    setBusySlug(course.slug);
    setError("");
    try {
      await updateCourse(course.slug, { status });
      await loadCourses();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not update course status.",
      );
    } finally {
      setBusySlug(null);
    }
  }

  async function removeCourse(course: AdminCourseListItem) {
    if (!window.confirm(`Delete ${course.title} (${course.slug})?`)) return;
    setBusySlug(course.slug);
    setError("");
    try {
      await deleteCourse(course.slug);
      await loadCourses();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not delete course.",
      );
    } finally {
      setBusySlug(null);
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <div className="admin-heading">
          <p className="admin-eyebrow">Spark Academy</p>
          <h1>Courses</h1>
        </div>
        <Link className="admin-link-button" to="/admin/courses/new">
          New course
        </Link>
      </header>

      {error && <p className="admin-error" role="alert">{error}</p>}
      {courses === null && !error ? (
        <p className="admin-loading" role="status">Loading courses...</p>
      ) : courses?.length === 0 ? (
        <p className="admin-empty">No courses yet.</p>
      ) : courses && (
        <>
        <label className="admin-field admin-course-language-filter">
          Language filter
          <select
            value={languageFilter}
            onChange={(event) => setLanguageFilter(event.currentTarget.value as CourseLanguage | "all")}
          >
            <option value="all">All languages</option>
            <option value="en">English</option>
            <option value="om">Afaan Oromoo</option>
            <option value="am">አማርኛ</option>
          </select>
        </label>
        {visibleCourses?.length === 0 ? (
          <p className="admin-empty">No courses match this language.</p>
        ) : <div className="admin-table-wrap">
          <table className="admin-table admin-courses-table">
            <thead>
              <tr>
                <th>Order</th><th>Title</th><th>Slug</th><th>Level</th>
                <th>Language</th><th>Status</th><th>Cohorts</th><th>Enrollments</th><th>Updated</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleCourses?.map((course) => (
                <tr key={course.slug}>
                  <td data-label="Order">{course.sortOrder}</td>
                  <td data-label="Title">{course.title}</td>
                  <td data-label="Slug">{course.slug}</td>
                  <td data-label="Level">{course.level}</td>
                  <td data-label="Language">{course.language}</td>
                  <td data-label="Status">
                    <span className={`admin-badge admin-badge--${course.status}`}>
                      {course.status}
                    </span>
                  </td>
                  <td data-label="Cohorts">{course.cohortCount}</td>
                  <td data-label="Enrollments">{course.enrollmentCount}</td>
                  <td data-label="Updated">{new Date(course.updatedAt).toLocaleDateString()}</td>
                  <td data-label="Actions">
                    <div className="admin-row-actions">
                      <Link className="admin-link-button" to={`/admin/courses/${encodeURIComponent(course.slug)}`}>
                        Edit
                      </Link>
                      {course.status === "draft" ? (
                        <button className="success" type="button" disabled={busySlug === course.slug} onClick={() => void changeStatus(course, "published")}>
                          Publish
                        </button>
                      ) : course.status === "published" ? (
                        <button className="invert" type="button" disabled={busySlug === course.slug} onClick={() => void changeStatus(course, "draft")}>
                          Unpublish
                        </button>
                      ) : (
                        <button className="invert" type="button" disabled={busySlug === course.slug} onClick={() => void changeStatus(course, "draft")}>
                          Restore
                        </button>
                      )}
                      {course.status !== "archived" && (
                        <button className="warning" type="button" disabled={busySlug === course.slug} onClick={() => void changeStatus(course, "archived")}>
                          Archive
                        </button>
                      )}
                      {course.cohortCount === 0 && (
                        <button className="danger" type="button" disabled={busySlug === course.slug} onClick={() => void removeCourse(course)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
        </>
      )}
    </main>
  );
}