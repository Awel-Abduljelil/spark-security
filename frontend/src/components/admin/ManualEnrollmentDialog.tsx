import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  createEnrollment,
  type AdminCohort,
  type AdminCourseListItem,
} from "../../lib/adminApi";

interface ManualEnrollmentDialogProps {
  cohorts: AdminCohort[];
  courses: AdminCourseListItem[];
  onClose: () => void;
  onCreated: () => void;
}

export function ManualEnrollmentDialog({
  cohorts,
  courses,
  onClose,
  onCreated,
}: ManualEnrollmentDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [cohortId, setCohortId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [status, setStatus] = useState<"pending" | "verified">("pending");
  const [adminNote, setAdminNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createEnrollment({
        cohortId: Number(cohortId),
        fullName,
        email,
        phone,
        telegram,
        status,
        ...(adminNote.trim() ? { adminNote: adminNote.trim() } : {}),
      });
      onCreated();
      dialogRef.current?.close();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not add this student.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog
      className="admin-dialog"
      ref={dialogRef}
      aria-labelledby="manual-enrollment-title"
      onClose={onClose}
    >
      <form className="admin-dialog__content" onSubmit={handleSubmit}>
        <header className="admin-dialog__header">
          <h2 id="manual-enrollment-title">Add student</h2>
          <button
            className="invert"
            type="button"
            onClick={() => dialogRef.current?.close()}
          >
            Close
          </button>
        </header>
        <label className="admin-field">
          Cohort
          <select
            required
            value={cohortId}
            onChange={(event) => setCohortId(event.currentTarget.value)}
          >
            <option value="">Choose a cohort</option>
            {cohorts.map((cohort) => (
              <option value={cohort.id} key={cohort.id}>
                {courses.find((course) => course.slug === cohort.courseSlug)?.title ?? cohort.courseSlug} ({cohort.courseSlug}) / {cohort.label || cohort.startDate}
                {cohort.isOpen ? "" : " (closed)"}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          Full name
          <input
            autoComplete="name"
            required
            pattern="\p{L}+(?:[\-']\p{L}+)* \p{L}+(?:[\-']\p{L}+)*(?: \p{L}+(?:[\-']\p{L}+)*)*"
            title="Enter your first and last name using letters only, separated by a space"
            value={fullName}
            onChange={(event) => setFullName(event.currentTarget.value)}
          />
        </label>
        <label className="admin-field">
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
          />
        </label>
        <label className="admin-field">
          Phone
          <input
            type="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(event) => setPhone(event.currentTarget.value)}
          />
        </label>
        <label className="admin-field">
          Telegram username
          <input
            required
            pattern="@[A-Za-z0-9_]{5,32}"
            title="Enter a Telegram username starting with @ (5-32 characters)."
            placeholder="@username"
            value={telegram}
            onChange={(event) => setTelegram(event.currentTarget.value)}
          />
        </label>
        <label className="admin-field">
          Initial status
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.currentTarget.value as "pending" | "verified")
            }
          >
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
          </select>
        </label>
        <label className="admin-field">
          Admin note (optional)
          <textarea
            maxLength={5000}
            value={adminNote}
            onChange={(event) => setAdminNote(event.currentTarget.value)}
          />
        </label>
        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={saving || cohorts.length === 0}>
          {saving ? "Adding student..." : "Add student"}
        </button>
      </form>
    </dialog>
  );
}
