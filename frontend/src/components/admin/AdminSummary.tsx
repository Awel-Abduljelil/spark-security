import type {
  AdminCourseListItem,
  AdminSummary as AdminSummaryData,
} from "../../lib/adminApi";

interface AdminSummaryProps {
  summary: AdminSummaryData;
  courses: AdminCourseListItem[];
}

export function AdminSummary({ summary, courses }: AdminSummaryProps) {
  return (
    <section className="admin-summary" aria-label="Enrollment summary">
      <div className="admin-summary__counts">
        <div>
          <span>Pending</span>
          <strong>{summary.pending}</strong>
        </div>
        <div>
          <span>Verified</span>
          <strong>{summary.verified}</strong>
        </div>
        <div>
          <span>Rejected</span>
          <strong>{summary.rejected}</strong>
        </div>
      </div>
      <div className="admin-summary__cohorts">
        {summary.cohorts.map((cohort) => {
          const title = courses.find(
            (course) => course.slug === cohort.courseSlug,
          )?.title;
          return (
            <div className="admin-summary__cohort" key={cohort.id}>
              <strong>
                {title ? `${title} (${cohort.courseSlug})` : cohort.courseSlug}
              </strong>
              <span>
                {cohort.totalSeats === 0
                  ? "Unlimited seats"
                  : `${cohort.seatsLeft} seats left`}
              </span>
              <span>{cohort.startDate}</span>
            </div>
          );
        })}
        {summary.cohorts.length === 0 && <span>No open cohorts</span>}
      </div>
    </section>
  );
}
